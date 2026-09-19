import { useState, useEffect, useCallback, useRef } from 'react';
import { Position, Direction, GameState, Difficulty, GameMode, GRID_SIZE, DIFFICULTY_SPEEDS, TIMED_DURATIONS, Player, PowerUp, TITLES, Theme, GAME_MAPS, MatchType, BOT_INTELLIGENCE, POWERUP_SPAWN_RATES } from '../types';
import { savePlayer, addXp } from '../store';
import { audioManager } from '../audio';
import { getRankFromElo } from './CompetitiveScreen';

type MultiplayerType = 'bot' | 'player' | 'zen';

interface GameProps {
  player: Player;
  setPlayer: (p: Player) => void;
  mode: GameMode;
  difficulty: Difficulty;
  onBack: () => void;
  isMultiplayer?: boolean;
  multiplayerType?: MultiplayerType;
  matchType?: MatchType;
  theme: Theme;
  toggleTheme: () => void;
}

function getRandomFood(snake: Position[], obstacles?: Position[]): Position {
  let food: Position;
  do {
    food = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
  } while (
    snake.some(s => s.x === food.x && s.y === food.y) ||
    (obstacles && obstacles.some(o => o.x === food.x && o.y === food.y))
  );
  return food;
}

function getRandomPowerUp(snake: Position[], obstacles?: Position[], spawnRate: number = 0.15): PowerUp | null {
  if (Math.random() > spawnRate) return null;
  const types: PowerUp['type'][] = ['speed', 'slow', 'double', 'shrink', 'shield', 'time_slow', 'coin_magnet', 'ghost_pass', 'score_boost'];
  const icons = ['⚡', '🐌', '✖️2', '🔽', '🛡️', '⏱️', '🧲', '👻', '💫'];
  const idx = Math.floor(Math.random() * types.length);
  
  let position: Position;
  let attempts = 0;
  do {
    position = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
    attempts++;
  } while (
    attempts < 100 &&
    (snake.some(s => s.x === position.x && s.y === position.y) ||
    (obstacles && obstacles.some(o => o.x === position.x && o.y === position.y)))
  );
  
  return {
    position,
    type: types[idx],
    icon: icons[idx],
    expiresAt: Date.now() + 8000,
  };
}

// Bot AI - moves toward food intelligently
function getBotDirection(snake: Position[], food: Position, currentDir: Direction, otherSnake?: Position[], isZenMode?: boolean, botIntelligence: number = 0.6): Direction {
  const head = snake[0];
  const possibleDirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const opposites: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
  
  // Filter out opposite direction
  const validDirs = possibleDirs.filter(d => d !== opposites[currentDir]);
  
  // Score each direction
  const scores: { dir: Direction; score: number }[] = [];
  
  for (const dir of validDirs) {
    let newHead = { ...head };
    if (dir === 'UP') newHead.y--;
    else if (dir === 'DOWN') newHead.y++;
    else if (dir === 'LEFT') newHead.x--;
    else newHead.x++;
    
    let score = 0;
    
    // In zen mode, wrap around walls
    if (isZenMode) {
      if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
      else if (newHead.x >= GRID_SIZE) newHead.x = 0;
      if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
      else if (newHead.y >= GRID_SIZE) newHead.y = 0;
    }
    
    // Distance to food (closer is better)
    // In zen mode, calculate distance considering wrapping
    let dist;
    if (isZenMode) {
      const dx = Math.min(Math.abs(newHead.x - food.x), GRID_SIZE - Math.abs(newHead.x - food.x));
      const dy = Math.min(Math.abs(newHead.y - food.y), GRID_SIZE - Math.abs(newHead.y - food.y));
      dist = dx + dy;
    } else {
      dist = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
    }
    score -= dist * 2;
    
    // Check if out of bounds (bad) - only in non-zen mode
    if (!isZenMode && (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE)) {
      score -= 1000;
    } else {
      // Check self collision (very bad)
      if (snake.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y)) {
        score -= 1000;
      }
      
      // Check other snake collision - SNAKES CAN PASS THROUGH EACH OTHER
      // Removed penalty for moving into other snake
      
      // Bonus for being adjacent to food
      if (newHead.x === food.x && newHead.y === food.y) {
        score += 100;
      }
      
      // Randomness based on bot intelligence
      // Lower intelligence = more randomness
      const randomnessFactor = (1 - botIntelligence) * 50;
      score += Math.random() * randomnessFactor;
    }
    
    scores.push({ dir, score });
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Return best direction (with intelligence-based chance of making suboptimal move)
  if (Math.random() > botIntelligence && scores.length > 1) {
    // Sometimes choose a suboptimal direction based on intelligence
    const randomIndex = Math.floor(Math.random() * Math.min(3, scores.length));
    return scores[randomIndex]?.dir || currentDir;
  }
  
  return scores[0]?.dir || currentDir;
}

export default function Game({ player, setPlayer, mode, difficulty, onBack, isMultiplayer, multiplayerType = 'player', matchType = 'unranked', theme, toggleTheme }: GameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [snake2, setSnake2] = useState<Position[]>([{ x: 10, y: 15 }, { x: 9, y: 15 }, { x: 8, y: 15 }]);
  const [food, setFood] = useState<Position>(() => {
    const currentMap = GAME_MAPS.find(m => m.id === player.activeMap);
    return getRandomFood([{ x: 10, y: 10 }], currentMap?.obstacles);
  });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [direction2, setDirection2] = useState<Direction>('LEFT');
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [score2, setScore2] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMED_DURATIONS[difficulty]);
  const [combo, setCombo] = useState(0);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activeEffects, setActiveEffects] = useState<string[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [newTitles, setNewTitles] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(audioManager.getIsMuted());
  const [survivalTime, setSurvivalTime] = useState(0);
  const [survivalSpeed, setSurvivalSpeed] = useState(1);
  const [eloChange, setEloChange] = useState(0);
  
  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const minSwipeDistance = 30; // Minimum pixels to register as a swipe

  const dirRef = useRef<Direction>('RIGHT');
  const dir2Ref = useRef<Direction>('LEFT');
  const stateRef = useRef<GameState>('IDLE');
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const particleId = useRef(0);
  const snakeRef = useRef<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const snake2Ref = useRef<Position[]>([{ x: 10, y: 15 }, { x: 9, y: 15 }, { x: 8, y: 15 }]);
  const foodRef = useRef<Position>(food);

  // Keep foodRef in sync with food state
  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  useEffect(() => { stateRef.current = gameState; }, [gameState]);
  useEffect(() => { dirRef.current = direction; }, [direction]);
  useEffect(() => { dir2Ref.current = direction2; }, [direction2]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { snake2Ref.current = snake2; }, [snake2]);
  useEffect(() => { foodRef.current = food; }, [food]);

  // Background music control
  useEffect(() => {
    if (gameState === 'PLAYING') {
      audioManager.resume(); // Resume audio context after user interaction
      audioManager.startBGM();
    } else {
      audioManager.stopBGM();
    }
  }, [gameState]);

  // Timer for timed mode
  useEffect(() => {
    if (gameState !== 'PLAYING' || mode !== 'timed') return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('GAME_OVER');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, mode]);

  // Survival mode - track time and increase speed
  useEffect(() => {
    if (gameState !== 'PLAYING' || mode !== 'survival') return;
    
    // Track survival time
    const timeInterval = setInterval(() => {
      setSurvivalTime(t => t + 1);
    }, 1000);
    
    // Increase speed every 10 seconds
    const speedInterval = setInterval(() => {
      setSurvivalSpeed(s => s + 1);
    }, 10000);
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(speedInterval);
    };
  }, [gameState, mode]);

  // Power-up spawner
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    const interval = setInterval(() => {
      const currentMap = GAME_MAPS.find(m => m.id === player.activeMap);
      const allSnakes = isMultiplayer ? [...snakeRef.current, ...snake2Ref.current] : snakeRef.current;
      const spawnRate = POWERUP_SPAWN_RATES[difficulty];
      const pu = getRandomPowerUp(allSnakes, currentMap?.obstacles, spawnRate);
      if (pu) {
        setPowerUps(prev => [...prev.filter(p => p.expiresAt > Date.now()), pu]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [gameState, isMultiplayer, player.activeMap, difficulty]);

  // Coin magnet effect - move food closer to snake
  useEffect(() => {
    if (gameState !== 'PLAYING' || !activeEffects.includes('coin_magnet')) return;
    const interval = setInterval(() => {
      setFood(currentFood => {
        const snakeHead = snakeRef.current[0];
        if (!snakeHead) return currentFood;
        
        // Move food one step closer to snake head
        let newX = currentFood.x;
        let newY = currentFood.y;
        
        if (currentFood.x < snakeHead.x) newX++;
        else if (currentFood.x > snakeHead.x) newX--;
        
        if (currentFood.y < snakeHead.y) newY++;
        else if (currentFood.y > snakeHead.y) newY--;
        
        // Ensure new position is valid
        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
          return { x: newX, y: newY };
        }
        return currentFood;
      });
    }, 500); // Move food every 500ms
    return () => clearInterval(interval);
  }, [gameState, activeEffects]);

  const addParticle = (x: number, y: number, text: string) => {
    const id = particleId.current++;
    setParticles(prev => [...prev, { id, x, y, text }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 1000);
  };

  const startGame = useCallback(() => {
    const initSnake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(initSnake);
    snakeRef.current = initSnake;
    const currentMap = GAME_MAPS.find(m => m.id === player.activeMap);
    setFood(getRandomFood(initSnake, currentMap?.obstacles));
    setDirection('RIGHT');
    dirRef.current = 'RIGHT';
    setScore(0);
    setCombo(0);
    setPowerUps([]);
    setActiveEffects([]);
    setTimeLeft(TIMED_DURATIONS[difficulty]);
    setSurvivalTime(0);
    setSurvivalSpeed(1);

    if (isMultiplayer) {
      const initSnake2 = [{ x: 10, y: 15 }, { x: 9, y: 15 }, { x: 8, y: 15 }];
      setSnake2(initSnake2);
      snake2Ref.current = initSnake2;
      setDirection2('LEFT');
      dir2Ref.current = 'LEFT';
      setScore2(0);
    }

    setGameState('PLAYING');
    setShowResult(false);
  }, [difficulty, isMultiplayer]);

  const changeDir = useCallback((newDir: Direction, playerNum: 1 | 2 = 1) => {
    const opposites: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (playerNum === 1) {
      if (opposites[newDir] !== dirRef.current) {
        setDirection(newDir);
        dirRef.current = newDir;
      }
    } else {
      if (opposites[newDir] !== dir2Ref.current) {
        setDirection2(newDir);
        dir2Ref.current = newDir;
      }
    }
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (stateRef.current === 'IDLE' || stateRef.current === 'GAME_OVER') {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); startGame(); return; }
      }
      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (stateRef.current === 'PLAYING') setGameState('PAUSED');
        else if (stateRef.current === 'PAUSED') setGameState('PLAYING');
        return;
      }

      if (stateRef.current !== 'PLAYING') return;

      const p1Keys: Record<string, Direction> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', W: 'UP', s: 'DOWN', S: 'DOWN', a: 'LEFT', A: 'LEFT', d: 'RIGHT', D: 'RIGHT' };
      const p2Keys: Record<string, Direction> = { i: 'UP', k: 'DOWN', j: 'LEFT', l: 'RIGHT', I: 'UP', K: 'DOWN', J: 'LEFT', L: 'RIGHT' };

      if (p1Keys[e.key]) { e.preventDefault(); changeDir(p1Keys[e.key], 1); }
      if (isMultiplayer && multiplayerType === 'player' && p2Keys[e.key]) { e.preventDefault(); changeDir(p2Keys[e.key], 2); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [startGame, changeDir, isMultiplayer, multiplayerType]);

  // Touch swipe with visual feedback
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchRef.current = { x: touch.clientX, y: touch.clientY };
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      setTouchEnd(null);
      setSwipeDirection(null);
    };
    
    const onMove = (e: TouchEvent) => {
      if (!touchRef.current) return;
      const touch = e.touches[0];
      setTouchEnd({ x: touch.clientX, y: touch.clientY });
      
      // Calculate direction in real-time for visual feedback
      const dx = touch.clientX - touchRef.current.x;
      const dy = touch.clientY - touchRef.current.y;
      
      if (Math.abs(dx) > minSwipeDistance || Math.abs(dy) > minSwipeDistance) {
        if (Math.abs(dx) > Math.abs(dy)) {
          setSwipeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
        } else {
          setSwipeDirection(dy > 0 ? 'DOWN' : 'UP');
        }
      }
    };
    
    const onEnd = (e: TouchEvent) => {
      if (!touchRef.current || stateRef.current !== 'PLAYING') {
        setTouchStart(null);
        setTouchEnd(null);
        setSwipeDirection(null);
        return;
      }
      const dx = e.changedTouches[0].clientX - touchRef.current.x;
      const dy = e.changedTouches[0].clientY - touchRef.current.y;
      
      if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
        setTouchStart(null);
        setTouchEnd(null);
        setSwipeDirection(null);
        return;
      }
      
      if (Math.abs(dx) > Math.abs(dy)) {
        changeDir(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        changeDir(dy > 0 ? 'DOWN' : 'UP');
      }
      
      touchRef.current = null;
      setTouchStart(null);
      setTouchEnd(null);
      setTimeout(() => setSwipeDirection(null), 300);
    };
    
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [changeDir]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    let speed = DIFFICULTY_SPEEDS[difficulty];
    
    // Survival mode - speed increases over time
    if (mode === 'survival') {
      speed = speed / survivalSpeed;
    }
    
    if (activeEffects.includes('speed')) speed *= 0.6;
    if (activeEffects.includes('slow')) speed *= 1.5;
    if (activeEffects.includes('time_slow')) speed *= 2.0; // Even slower than 'slow'

    const interval = setInterval(() => {
      if (stateRef.current !== 'PLAYING') return;

      // Bot AI movement (if multiplayer with bot or zen multiplayer)
      if (isMultiplayer && (multiplayerType === 'bot' || multiplayerType === 'zen')) {
        const botIntelligence = BOT_INTELLIGENCE[difficulty];
        const botDir = getBotDirection(snake2Ref.current, foodRef.current, dir2Ref.current, snakeRef.current, multiplayerType === 'zen', botIntelligence);
        dir2Ref.current = botDir;
        setDirection2(botDir);
      }

      // Player 1 movement
      setSnake(prev => {
        const head = prev[0];
        const dir = dirRef.current;
        let newHead = { ...head };
        
        if (dir === 'UP') newHead.y--;
        else if (dir === 'DOWN') newHead.y++;
        else if (dir === 'LEFT') newHead.x--;
        else newHead.x++;

        // Zen mode or Zen Multiplayer: wrap around walls
        if (mode === 'zen' || multiplayerType === 'zen') {
          if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
          else if (newHead.x >= GRID_SIZE) newHead.x = 0;
          if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
          else if (newHead.y >= GRID_SIZE) newHead.y = 0;
        } else {
          // Wall collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            // Ghost pass allows passing through walls
            if (activeEffects.includes('ghost_pass')) {
              // Wrap around the grid
              if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
              else if (newHead.x >= GRID_SIZE) newHead.x = 0;
              if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
              else if (newHead.y >= GRID_SIZE) newHead.y = 0;
            } else {
              setGameState('GAME_OVER');
              return prev;
            }
          }
        }

        // Self collision
        if (prev.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameState('GAME_OVER');
          return prev;
        }

        // Map obstacle collision
        const currentMap = GAME_MAPS.find(m => m.id === player.activeMap);
        if (currentMap?.obstacles && currentMap.obstacles.some(obs => obs.x === newHead.x && obs.y === newHead.y)) {
          setGameState('GAME_OVER');
          return prev;
        }

        // Portal teleportation
        if (currentMap?.portals) {
          const portal = currentMap.portals.find(p => p.from.x === newHead.x && p.from.y === newHead.y);
          if (portal) {
            newHead = { ...portal.to };
          }
        }

        // Multiplayer collision - SNAKES CAN NOW PASS THROUGH EACH OTHER!
        // Removed collision detection between player snakes in all modes

        const newSnake = [newHead, ...prev];
        let ate = false;

        if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
          ate = true;
          audioManager.playEatSound();
          let multiplier = activeEffects.includes('double') ? 2 : 1;
          if (activeEffects.includes('score_boost')) multiplier *= 3; // Triple score
          const comboBonus = Math.floor(combo / 3);
          const points = (10 + comboBonus * 5) * multiplier;
          setScore(s => s + points);
          setCombo(c => c + 1);
          
          // Get all snakes and obstacles to avoid food spawning on them
          const allSnakes = isMultiplayer ? [...newSnake, ...snake2Ref.current] : newSnake;
          const currentMap = GAME_MAPS.find(m => m.id === player.activeMap);
          setFood(getRandomFood(allSnakes, currentMap?.obstacles));
          addParticle(newHead.x, newHead.y, `+${points}`);
        } else {
          newSnake.pop();
          setCombo(0);
        }

        // Check power-ups
        setPowerUps(prevPu => {
          const remaining = prevPu.filter(pu => {
            if (pu.position.x === newHead.x && pu.position.y === newHead.y) {
              if (pu.type === 'double') setActiveEffects(e => [...e.filter(x => x !== 'double'), 'double']);
              else if (pu.type === 'speed') setActiveEffects(e => [...e.filter(x => x !== 'speed'), 'speed']);
              else if (pu.type === 'slow') setActiveEffects(e => [...e.filter(x => x !== 'slow'), 'slow']);
              else if (pu.type === 'time_slow') setActiveEffects(e => [...e.filter(x => x !== 'time_slow'), 'time_slow']);
              else if (pu.type === 'coin_magnet') setActiveEffects(e => [...e.filter(x => x !== 'coin_magnet'), 'coin_magnet']);
              else if (pu.type === 'ghost_pass') setActiveEffects(e => [...e.filter(x => x !== 'ghost_pass'), 'ghost_pass']);
              else if (pu.type === 'score_boost') setActiveEffects(e => [...e.filter(x => x !== 'score_boost'), 'score_boost']);
              else if (pu.type === 'shrink' && newSnake.length > 5) {
                newSnake.splice(Math.floor(newSnake.length / 2));
              }
              addParticle(pu.position.x, pu.position.y, pu.icon);
              return false;
            }
            return pu.expiresAt > Date.now();
          });
          return remaining;
        });

        return newSnake;
      });

      // Player 2 / Bot movement (multiplayer)
      if (isMultiplayer) {
        setSnake2(prev => {
          const head = prev[0];
          const dir = dir2Ref.current;
          let newHead = { ...head };
          
          if (dir === 'UP') newHead.y--;
          else if (dir === 'DOWN') newHead.y++;
          else if (dir === 'LEFT') newHead.x--;
          else newHead.x++;

          // Zen mode or Zen Multiplayer: wrap around walls
          if (mode === 'zen' || multiplayerType === 'zen') {
            if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
            else if (newHead.x >= GRID_SIZE) newHead.x = 0;
            if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
            else if (newHead.y >= GRID_SIZE) newHead.y = 0;
          } else {
            // Wall collision
            if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
              // Ghost pass allows passing through walls
              if (activeEffects.includes('ghost_pass')) {
                // Wrap around the grid
                if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
                else if (newHead.x >= GRID_SIZE) newHead.x = 0;
                if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
                else if (newHead.y >= GRID_SIZE) newHead.y = 0;
              } else {
                setGameState('GAME_OVER');
                return prev;
              }
            }
          }

          // Self collision
          if (prev.slice(0, -1).some(s => s.x === newHead.x && s.y === newHead.y)) {
            setGameState('GAME_OVER');
            return prev;
          }

          // Multiplayer collision - SNAKES CAN NOW PASS THROUGH EACH OTHER!
          // Removed collision detection between player and bot snakes

          const newSnake = [newHead, ...prev];
          if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
            setScore2(s => s + 10);
            const allSnakes = [...newSnake, ...snakeRef.current];
            const currentMap = GAME_MAPS.find(m => m.id === player.activeMap);
            setFood(getRandomFood(allSnakes, currentMap?.obstacles));
          } else {
            newSnake.pop();
          }
          return newSnake;
        });
      }
    }, speed);

    return () => clearInterval(interval);
  }, [gameState, difficulty, activeEffects, combo, isMultiplayer, multiplayerType, mode, survivalSpeed]);

  // Handle game over - save stats
  useEffect(() => {
    if (gameState === 'GAME_OVER' && !showResult) {
      audioManager.playGameOverSound();
      // For survival mode, use survival time as score
      // For competitive mode, use player's score
      const finalS = mode === 'survival' ? survivalTime : score;
      setFinalScore(finalS);
      
      const foodEaten = Math.floor(score / 10);
      const xp = Math.floor(finalS / 2) + (difficulty === 'hard' ? 20 : difficulty === 'insane' ? 50 : difficulty === 'medium' ? 10 : 5);
      const coins = Math.floor(finalS / 5) + 5;
      
      setXpEarned(xp);
      setCoinsEarned(coins);

      let updated = { ...player };
      updated.totalScore += finalS;
      updated.gamesPlayed += 1;
      updated.totalFoodEaten += foodEaten;
      updated.longestSnake = Math.max(updated.longestSnake, snake.length);
      updated.coins += coins;
      
      // Track zen games
      if (mode === 'zen') {
        updated.zenGamesPlayed += 1;
      }
      
      // Track bot wins and award keys/chests
      if (isMultiplayer && multiplayerType === 'bot' && score > score2) {
        updated.gamesWonVsBot += 1;
        updated.gamesWon += 1;
        
        // Award keys based on difficulty
        const keysEarned = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 5;
        updated.keys += keysEarned;
        
        // Award chests based on score
        if (finalS >= 200) {
          updated.chests.legendary_chest = (updated.chests.legendary_chest || 0) + 1;
        } else if (finalS >= 100) {
          updated.chests.golden_chest = (updated.chests.golden_chest || 0) + 1;
        } else if (finalS >= 50) {
          updated.chests.silver_chest = (updated.chests.silver_chest || 0) + 1;
        } else {
          updated.chests.wooden_chest = (updated.chests.wooden_chest || 0) + 1;
        }
      }
      
      // Also award for single player wins (score >= 50)
      if (!isMultiplayer && finalS >= 50) {
        updated.gamesWon += 1;
        const keysEarned = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : difficulty === 'hard' ? 3 : 5;
        updated.keys += keysEarned;
        
        if (finalS >= 200) {
          updated.chests.legendary_chest = (updated.chests.legendary_chest || 0) + 1;
        } else if (finalS >= 100) {
          updated.chests.golden_chest = (updated.chests.golden_chest || 0) + 1;
        } else if (finalS >= 50) {
          updated.chests.silver_chest = (updated.chests.silver_chest || 0) + 1;
        } else {
          updated.chests.wooden_chest = (updated.chests.wooden_chest || 0) + 1;
        }
      }
      
      if (mode === 'timed') {
        if (finalS > updated.timedHighScores[difficulty]) {
          updated.timedHighScores[difficulty] = finalS;
        }
      } else {
        if (finalS > updated.highScores[difficulty]) {
          updated.highScores[difficulty] = finalS;
        }
      }

      // Handle competitive mode ELO changes
      if (mode === 'competitive') {
        updated.competitiveGamesPlayed += 1;
        
        if (matchType === 'ranked') {
          // Simulate opponent ELO (random between player's ELO - 200 and + 200)
          const opponentElo = Math.max(100, player.elo + Math.floor(Math.random() * 400) - 200);
          
          // Determine if player won (higher score wins in competitive mode)
          const playerWon = score > score2;
          
          // Calculate ELO change using simplified ELO formula
          const K = 32; // K-factor (determines how much ELO changes)
          const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - player.elo) / 400));
          const actualScore = playerWon ? 1 : 0;
          const eloChangeValue = Math.round(K * (actualScore - expectedScore));
          
          setEloChange(eloChangeValue);
          updated.elo = Math.max(0, player.elo + eloChangeValue);
          updated.rank = getRankFromElo(updated.elo);
          
          if (playerWon) {
            updated.rankedWins += 1;
          } else {
            updated.rankedLosses += 1;
          }
        } else {
          // Unranked match - just track games played
          updated.unrankedGamesPlayed += 1;
        }
      }

      updated = addXp(updated, xp);
      
      // Check for new titles
      const unlockedTitles: string[] = [];
      for (const title of TITLES) {
        if (!player.titles.includes(title.id) && title.condition(updated)) {
          unlockedTitles.push(title.id);
          updated.titles = [...updated.titles, title.id];
          updated.coins += title.coinReward;
        }
      }
      setNewTitles(unlockedTitles);
      
      setPlayer(updated);
      savePlayer(updated);

      setTimeout(() => setShowResult(true), 500);
    }
  }, [gameState]);

  // Clear effects after time
  useEffect(() => {
    if (activeEffects.length === 0) return;
    const timeout = setTimeout(() => setActiveEffects([]), 5000);
    return () => clearTimeout(timeout);
  }, [activeEffects]);

  const getSkinColor = (index: number, total: number, isP2 = false) => {
    const ratio = index / Math.max(total - 1, 1);
    const opacity = 1 - ratio * 0.5;
    
    if (isP2) {
      if (index === 0) return { bg: `rgba(96, 165, 250, ${opacity})`, shadow: '0 0 10px rgba(96, 165, 250, 0.7)' };
      return { bg: `rgba(59, 130, 246, ${opacity})`, shadow: 'none' };
    }

    // Get equipped character skin colors
    const characterSkin = player.equippedCharacterSkin;
    
    // Debug log to see what skin is being used
    if (index === 0) {
      console.log(`Rendering snake with skin: ${characterSkin}, character: ${player.equippedCharacter}`);
    }
    
    const characterSkins: Record<string, { head: string; body: string; glow: string }> = {
      // Classic Snake skins
      classic_green: { head: '74, 222, 128', body: '34, 197, 94', glow: 'rgba(74, 222, 128, 0.7)' },
      classic_red: { head: '248, 113, 113', body: '239, 68, 68', glow: 'rgba(248, 113, 113, 0.7)' },
      classic_blue: { head: '96, 165, 250', body: '59, 130, 246', glow: 'rgba(96, 165, 250, 0.7)' },
      // Dragon skins
      dragon_fire: { head: '251, 146, 60', body: '234, 88, 12', glow: 'rgba(251, 146, 60, 0.7)' },
      dragon_ice: { head: '147, 197, 253', body: '59, 130, 246', glow: 'rgba(147, 197, 253, 0.7)' },
      dragon_shadow: { head: '161, 161, 170', body: '82, 82, 91', glow: 'rgba(161, 161, 170, 0.7)' },
      // Phoenix skins
      phoenix_gold: { head: '253, 224, 71', body: '234, 179, 8', glow: 'rgba(253, 224, 71, 0.7)' },
      phoenix_crimson: { head: '248, 113, 113', body: '220, 38, 38', glow: 'rgba(248, 113, 113, 0.7)' },
      phoenix_silver: { head: '209, 213, 219', body: '156, 163, 175', glow: 'rgba(209, 213, 219, 0.7)' },
      // Unicorn skins
      unicorn_rainbow: { head: '248, 113, 113', body: '168, 85, 247', glow: 'rgba(248, 113, 113, 0.7)' },
      unicorn_moonlight: { head: '196, 181, 253', body: '139, 92, 246', glow: 'rgba(196, 181, 253, 0.7)' },
      unicorn_starlight: { head: '253, 224, 71', body: '245, 158, 11', glow: 'rgba(253, 224, 71, 0.7)' },
      // Kraken skins
      kraken_abyss: { head: '129, 140, 248', body: '79, 70, 229', glow: 'rgba(129, 140, 248, 0.7)' },
      kraken_storm: { head: '103, 232, 249', body: '6, 182, 212', glow: 'rgba(103, 232, 249, 0.7)' },
      kraken_void: { head: '167, 139, 250', body: '109, 40, 217', glow: 'rgba(167, 139, 250, 0.7)' },
      // Cosmic skins
      cosmic_nebula: { head: '129, 140, 248', body: '79, 70, 229', glow: 'rgba(129, 140, 248, 0.7)' },
      cosmic_galaxy: { head: '192, 132, 252', body: '139, 92, 246', glow: 'rgba(192, 132, 252, 0.7)' },
      cosmic_supernova: { head: '251, 146, 60', body: '234, 88, 12', glow: 'rgba(251, 146, 60, 0.7)' },
      // New character skins - Turtle
      turtle_green: { head: '74, 222, 128', body: '34, 197, 94', glow: 'rgba(74, 222, 128, 0.7)' },
      turtle_blue: { head: '96, 165, 250', body: '59, 130, 246', glow: 'rgba(96, 165, 250, 0.7)' },
      turtle_gold: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Rabbit
      rabbit_white: { head: '248, 250, 252', body: '226, 232, 240', glow: 'rgba(248, 250, 252, 0.7)' },
      rabbit_brown: { head: '161, 98, 7', body: '133, 77, 14', glow: 'rgba(161, 98, 7, 0.7)' },
      rabbit_silver: { head: '203, 213, 225', body: '148, 163, 184', glow: 'rgba(203, 213, 225, 0.7)' },
      // Fox
      fox_orange: { head: '251, 146, 60', body: '234, 88, 12', glow: 'rgba(251, 146, 60, 0.7)' },
      fox_red: { head: '239, 68, 68', body: '220, 38, 38', glow: 'rgba(239, 68, 68, 0.7)' },
      fox_arctic: { head: '241, 245, 249', body: '226, 232, 240', glow: 'rgba(241, 245, 249, 0.7)' },
      // Wolf
      wolf_gray: { head: '107, 114, 128', body: '75, 85, 99', glow: 'rgba(107, 114, 128, 0.7)' },
      wolf_black: { head: '31, 41, 55', body: '17, 24, 39', glow: 'rgba(31, 41, 55, 0.7)' },
      wolf_white: { head: '249, 250, 251', body: '243, 244, 246', glow: 'rgba(249, 250, 251, 0.7)' },
      // Lion
      lion_gold: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      lion_mane: { head: '146, 64, 14', body: '120, 53, 15', glow: 'rgba(146, 64, 14, 0.7)' },
      lion_white: { head: '254, 243, 199', body: '253, 230, 138', glow: 'rgba(254, 243, 199, 0.7)' },
      // Eagle
      eagle_brown: { head: '146, 64, 14', body: '120, 53, 15', glow: 'rgba(146, 64, 14, 0.7)' },
      eagle_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      eagle_bald: { head: '249, 250, 251', body: '31, 41, 55', glow: 'rgba(249, 250, 251, 0.7)' },
      // Panda
      panda_classic: { head: '249, 250, 251', body: '31, 41, 55', glow: 'rgba(249, 250, 251, 0.7)' },
      panda_red: { head: '220, 38, 38', body: '153, 27, 27', glow: 'rgba(220, 38, 38, 0.7)' },
      panda_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Tiger
      tiger_orange: { head: '251, 146, 60', body: '234, 88, 12', glow: 'rgba(251, 146, 60, 0.7)' },
      tiger_white: { head: '249, 250, 251', body: '229, 231, 235', glow: 'rgba(249, 250, 251, 0.7)' },
      tiger_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Bear
      bear_brown: { head: '146, 64, 14', body: '120, 53, 15', glow: 'rgba(146, 64, 14, 0.7)' },
      bear_polar: { head: '249, 250, 251', body: '243, 244, 246', glow: 'rgba(249, 250, 251, 0.7)' },
      bear_black: { head: '31, 41, 55', body: '17, 24, 39', glow: 'rgba(31, 41, 55, 0.7)' },
      // Shark
      shark_gray: { head: '107, 114, 128', body: '75, 85, 99', glow: 'rgba(107, 114, 128, 0.7)' },
      shark_blue: { head: '30, 64, 175', body: '30, 58, 138', glow: 'rgba(30, 64, 175, 0.7)' },
      shark_hammerhead: { head: '55, 65, 81', body: '31, 41, 55', glow: 'rgba(55, 65, 81, 0.7)' },
      // Owl
      owl_brown: { head: '146, 64, 14', body: '120, 53, 15', glow: 'rgba(146, 64, 14, 0.7)' },
      owl_snowy: { head: '249, 250, 251', body: '229, 231, 235', glow: 'rgba(249, 250, 251, 0.7)' },
      owl_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Dolphin
      dolphin_gray: { head: '107, 114, 128', body: '75, 85, 99', glow: 'rgba(107, 114, 128, 0.7)' },
      dolphin_blue: { head: '59, 130, 246', body: '37, 99, 235', glow: 'rgba(59, 130, 246, 0.7)' },
      dolphin_pink: { head: '236, 72, 153', body: '219, 39, 119', glow: 'rgba(236, 72, 153, 0.7)' },
      // Gorilla
      gorilla_black: { head: '55, 65, 81', body: '31, 41, 55', glow: 'rgba(55, 65, 81, 0.7)' },
      gorilla_silver: { head: '156, 163, 175', body: '107, 114, 128', glow: 'rgba(156, 163, 175, 0.7)' },
      gorilla_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Elephant
      elephant_gray: { head: '107, 114, 128', body: '75, 85, 99', glow: 'rgba(107, 114, 128, 0.7)' },
      elephant_african: { head: '146, 64, 14', body: '120, 53, 15', glow: 'rgba(146, 64, 14, 0.7)' },
      elephant_asian: { head: '120, 113, 108', body: '87, 83, 78', glow: 'rgba(120, 113, 108, 0.7)' },
      // Crocodile
      crocodile_green: { head: '22, 163, 74', body: '21, 128, 61', glow: 'rgba(22, 163, 74, 0.7)' },
      crocodile_nile: { head: '133, 77, 14', body: '113, 63, 18', glow: 'rgba(133, 77, 14, 0.7)' },
      crocodile_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Whale
      whale_blue: { head: '30, 64, 175', body: '30, 58, 138', glow: 'rgba(30, 64, 175, 0.7)' },
      whale_humpback: { head: '55, 65, 81', body: '31, 41, 55', glow: 'rgba(55, 65, 81, 0.7)' },
      whale_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Octopus
      octopus_purple: { head: '124, 58, 237', body: '109, 40, 217', glow: 'rgba(124, 58, 237, 0.7)' },
      octopus_blue: { head: '14, 165, 233', body: '2, 132, 199', glow: 'rgba(14, 165, 233, 0.7)' },
      octopus_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Dinosaur
      dinosaur_green: { head: '22, 163, 74', body: '21, 128, 61', glow: 'rgba(22, 163, 74, 0.7)' },
      dinosaur_red: { head: '220, 38, 38', body: '185, 28, 28', glow: 'rgba(220, 38, 38, 0.7)' },
      dinosaur_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
      // Alien
      alien_green: { head: '34, 197, 94', body: '22, 163, 74', glow: 'rgba(34, 197, 94, 0.7)' },
      alien_gray: { head: '107, 114, 128', body: '75, 85, 99', glow: 'rgba(107, 114, 128, 0.7)' },
      alien_golden: { head: '251, 191, 36', body: '245, 158, 11', glow: 'rgba(251, 191, 36, 0.7)' },
    };
    
    const skinColors = characterSkins[characterSkin] || characterSkins.classic_green;
    const { head, body, glow } = skinColors;
    
    if (index === 0) return { bg: `rgba(${head}, ${opacity})`, shadow: glow };
    return { bg: `rgba(${body}, ${opacity})`, shadow: 'none' };
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getModeLabel = () => {
    if (mode === 'competitive') {
      return matchType === 'ranked' ? '🏆 Ranked Match' : '🎮 Casual Match';
    }
    if (isMultiplayer) {
      if (multiplayerType === 'zen') return '🌀 Zen Battle';
      return multiplayerType === 'bot' ? '🤖 vs AI' : '👥 2 Players';
    }
    if (mode === 'timed') return '⏱️ Time Attack';
    if (mode === 'zen') return '🧘 Zen Mode';
    if (mode === 'survival') return '💀 Survival';
    return '🐍 Classic';
  };

  const getDifficultyLabel = () => {
    const labels = {
      easy: { text: 'EASY', color: 'text-green-400', bg: 'bg-green-900/50' },
      medium: { text: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-900/50' },
      hard: { text: 'HARD', color: 'text-red-400', bg: 'bg-red-900/50' },
      insane: { text: 'INSANE', color: 'text-purple-400', bg: 'bg-purple-900/50' },
    };
    return labels[difficulty];
  };

  const getPlayerLabel = () => {
    if (isMultiplayer && multiplayerType === 'player') {
      return { p1: `${player.avatar} ${player.username}`, p2: 'Player 2' };
    }
    if (isMultiplayer && (multiplayerType === 'bot' || multiplayerType === 'zen')) {
      return { p1: `${player.avatar} ${player.username}`, p2: '🤖 AI Bot' };
    }
    return { p1: `${player.avatar} ${player.username}`, p2: '' };
  };

  const playerLabels = getPlayerLabel();

  return (
    <div className={`h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-slate-50 to-white'} flex flex-col px-1 py-1 md:px-2 md:py-2 select-none overflow-hidden`}>
      {/* Compact Scoreboard at Top */}
      <div className="w-full flex-shrink-0 mb-1">
        <div className={`w-full ${theme === 'dark' ? 'bg-gray-800/95 border-gray-700/50' : 'bg-white border-gray-200 shadow-md'} rounded-xl px-2 py-1.5 border-2`}>
          {/* Single Row: All Info Horizontal */}
          <div className="flex items-center justify-between gap-3">
            {/* Player Info - Compact */}
            <div className="flex items-center gap-2">
              <div className="text-2xl">{player.avatar}</div>
              <div>
                <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} leading-tight`}>{player.username}</div>
                {player.equippedTitle && (
                  <div className={`text-[10px] ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>
                    {TITLES.find(ti => ti.id === player.equippedTitle)?.icon} {TITLES.find(ti => ti.id === player.equippedTitle)?.name}
                  </div>
                )}
              </div>
            </div>
            
            {/* Game Mode & Difficulty - Compact */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className={`text-xs font-bold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{getModeLabel()}</div>
                <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block ${getDifficultyLabel().bg} ${getDifficultyLabel().color} font-bold`}>
                  {getDifficultyLabel().text}
                </div>
              </div>
            </div>
            
            {/* Scores - Compact Horizontal */}
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                  {isMultiplayer ? 'P1' : '🎯'}
                </div>
                <div className="text-xl font-black text-green-400">{score}</div>
              </div>
              
              {mode === 'timed' && (
                <div className="text-center">
                  <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>⏱️</div>
                  <div className={`text-xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatTime(timeLeft)}</div>
                </div>
              )}
              
              {mode === 'survival' && (
                <div className="text-center">
                  <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>⚡</div>
                  <div className={`text-xl font-black ${survivalSpeed >= 5 ? 'text-red-400 animate-pulse' : survivalSpeed >= 3 ? 'text-orange-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>x{survivalSpeed}</div>
                </div>
              )}
              
              {mode === 'competitive' && (
                <div className="text-center">
                  <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>🏆</div>
                  <div className={`text-xl font-black ${matchType === 'ranked' ? 'text-yellow-400' : 'text-blue-400'}`}>{player.elo}</div>
                </div>
              )}
              
              {combo > 2 && (
                <div className="text-center">
                  <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>🔥</div>
                  <div className="text-xl font-black text-orange-400">x{combo}</div>
                </div>
              )}
              
              {isMultiplayer && (
                <div className="text-center">
                  <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>P2</div>
                  <div className="text-xl font-black text-blue-400">{score2}</div>
                </div>
              )}
              
              {!isMultiplayer && mode !== 'timed' && mode !== 'survival' && mode !== 'competitive' && (
                <div className="text-center">
                  <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}>📏</div>
                  <div className="text-xl font-black text-green-400">{snake.length}</div>
                </div>
              )}
            </div>
            
            {/* Power-ups & Controls - Compact */}
            <div className="flex items-center gap-2">
              {activeEffects.length > 0 && (
                <div className="flex gap-1">
                  {activeEffects.map(e => (
                    <span key={e} className="text-sm animate-pulse" title={e}>
                      {e === 'double' ? '✖️2' : e === 'speed' ? '⚡' : e === 'slow' ? '🐌' : e === 'time_slow' ? '⏱️' : e === 'coin_magnet' ? '🧲' : e === 'ghost_pass' ? '👻' : '💫'}
                    </span>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => {
                  audioManager.playClickSound();
                  const muted = audioManager.toggleMute();
                  setIsMuted(muted);
                }}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? '🔇' : '🔊'}
              </button>
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Board - Big & Centered */}
      <div className="flex-1 w-full flex items-center justify-center">
        <div className={`w-[min(85vh,95vw)] aspect-square bg-gray-900/90 rounded-2xl border-2 overflow-hidden shadow-2xl relative ${mode === 'zen' || multiplayerType === 'zen' ? 'border-purple-500/40 shadow-purple-500/20' : 'border-gray-700/60'}`}>
          {/* Grid */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-20">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
              <div key={i} className={`${(i % GRID_SIZE + Math.floor(i / GRID_SIZE)) % 2 === 0 ? 'bg-gray-800/40' : 'bg-gray-800/20'}`} />
            ))}
          </div>

          {/* Map Obstacles */}
          {(() => {
            const currentMap = GAME_MAPS.find(m => m.id === player.activeMap);
            if (!currentMap || !currentMap.obstacles) return null;
            
            return currentMap.obstacles.map((obs, i) => (
              <div
                key={`obs-${i}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: `${(obs.x / GRID_SIZE) * 100}%`,
                  top: `${(obs.y / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                }}
              >
                <div className="w-[90%] h-[90%] rounded-sm" style={{ backgroundColor: currentMap.wallColor, opacity: 0.8 }} />
              </div>
            ));
          })()}

          {/* Map Portals */}
          {(() => {
            const currentMap = GAME_MAPS.find(m => m.id === player.activeMap);
            if (!currentMap || !currentMap.portals) return null;
            
            return currentMap.portals.map((portal, i) => (
              <div
                key={`portal-${i}`}
                className="absolute flex items-center justify-center animate-pulse"
                style={{
                  left: `${(portal.from.x / GRID_SIZE) * 100}%`,
                  top: `${(portal.from.y / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                }}
              >
                <div className="w-[80%] h-[80%] bg-cyan-500/60 rounded-full flex items-center justify-center text-xs shadow-lg shadow-cyan-500/40">
                  🌀
                </div>
              </div>
            ));
          })()}

          {/* Zen mode indicator */}
          {(mode === 'zen' || multiplayerType === 'zen') && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-purple-900/60 rounded-full text-[10px] text-purple-300 border border-purple-500/30">
              🌀 Walls disabled - pass through!
            </div>
          )}

          {/* Food */}
          <div className="absolute flex items-center justify-center" style={{ left: `${(food.x / GRID_SIZE) * 100}%`, top: `${(food.y / GRID_SIZE) * 100}%`, width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%` }}>
            <div className="w-[75%] h-[75%] bg-red-500 rounded-full shadow-lg shadow-red-500/60 animate-bounce-subtle" />
          </div>

          {/* Power-ups */}
          {powerUps.map((pu, i) => (
            <div key={i} className="absolute flex items-center justify-center animate-pulse" style={{ left: `${(pu.position.x / GRID_SIZE) * 100}%`, top: `${(pu.position.y / GRID_SIZE) * 100}%`, width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%` }}>
              <div className="w-[80%] h-[80%] bg-purple-600/80 rounded-lg flex items-center justify-center text-[8px] shadow-lg shadow-purple-500/40">
                {pu.icon}
              </div>
            </div>
          ))}

          {/* Player 1 Snake */}
          {snake.map((seg, i) => {
            const style = getSkinColor(i, snake.length);
            return (
              <div key={`p1-${i}`} className="absolute" style={{ left: `${(seg.x / GRID_SIZE) * 100}%`, top: `${(seg.y / GRID_SIZE) * 100}%`, width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`, padding: '1px', zIndex: snake.length - i }}>
                <div className="w-full h-full rounded-sm transition-all duration-75" style={{ backgroundColor: style.bg, boxShadow: style.shadow, borderRadius: i === 0 ? '5px' : '3px', transform: i === 0 ? 'scale(1.05)' : `scale(${1 - (i / snake.length) * 0.15})` }}>
                  {i === 0 && (
                    <div className="w-full h-full flex items-center justify-center relative">
                      {/* Direction Arrow */}
                      <div className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-80" style={{
                        transform: direction === 'UP' ? 'rotate(-90deg)' : direction === 'DOWN' ? 'rotate(90deg)' : direction === 'LEFT' ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        <div className="text-[10px] md:text-xs">▶</div>
                      </div>
                      {/* Eyes */}
                      <div className="flex gap-[15%] z-10">
                        <div className="w-[18%] h-[18%] bg-white rounded-full" />
                        <div className="w-[18%] h-[18%] bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Player 2 / Bot Snake */}
          {isMultiplayer && snake2.map((seg, i) => {
            const style = getSkinColor(i, snake2.length, true);
            return (
              <div key={`p2-${i}`} className="absolute" style={{ left: `${(seg.x / GRID_SIZE) * 100}%`, top: `${(seg.y / GRID_SIZE) * 100}%`, width: `${100 / GRID_SIZE}%`, height: `${100 / GRID_SIZE}%`, padding: '1px', zIndex: snake2.length - i }}>
                <div className="w-full h-full rounded-sm" style={{ backgroundColor: style.bg, boxShadow: style.shadow, borderRadius: i === 0 ? '5px' : '3px', transform: i === 0 ? 'scale(1.05)' : `scale(${1 - (i / snake2.length) * 0.15})` }}>
                  {i === 0 && (
                    <div className="w-full h-full flex items-center justify-center relative">
                      {/* Direction Arrow */}
                      <div className="absolute inset-0 flex items-center justify-center text-white font-bold opacity-80" style={{
                        transform: direction2 === 'UP' ? 'rotate(-90deg)' : direction2 === 'DOWN' ? 'rotate(90deg)' : direction2 === 'LEFT' ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        <div className="text-[10px] md:text-xs">▶</div>
                      </div>
                      {/* Eyes */}
                      <div className="flex gap-[15%] z-10">
                        <div className="w-[18%] h-[18%] bg-white rounded-full" />
                        <div className="w-[18%] h-[18%] bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Particles */}
          {particles.map(p => (
            <div key={p.id} className="absolute pointer-events-none animate-float-up text-xs font-bold text-yellow-300" style={{ left: `${(p.x / GRID_SIZE) * 100}%`, top: `${(p.y / GRID_SIZE) * 100}%` }}>
              {p.text}
            </div>
          ))}

          {/* Overlays - Enhanced Start Screen */}
          {gameState === 'IDLE' && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in p-6">
              {/* Mode Icon */}
              <div className="text-6xl mb-4">
                {mode === 'competitive' 
                  ? (matchType === 'ranked' ? '🏆' : '🎮')
                  : isMultiplayer 
                  ? (multiplayerType === 'zen' ? '🌀' : multiplayerType === 'bot' ? '🤖' : '👥') 
                  : mode === 'timed' ? '⏱️' : mode === 'zen' ? '🧘' : mode === 'survival' ? '💀' : '🐍'}
              </div>
              
              {/* Mode Title */}
              <h2 className="text-2xl font-black text-white mb-2 text-center">
                {mode === 'competitive'
                  ? (matchType === 'ranked' ? '🏆 Ranked Match' : '🎮 Casual Match')
                  : isMultiplayer 
                  ? (multiplayerType === 'zen' ? '🌀 Zen Battle' : multiplayerType === 'bot' ? '🤖 vs AI Bot' : '👥 2 Player Battle') 
                  : mode === 'timed' ? '⏱️ Time Attack' : mode === 'zen' ? '🧘 Zen Mode' : mode === 'survival' ? '💀 Survival Challenge' : '🐍 Classic Mode'}
              </h2>
              
              {/* Player Info */}
              <div className={`flex items-center gap-2 mb-3 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'}`}>
                <span className="text-2xl">{player.avatar}</span>
                <div className="text-left">
                  <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{player.username}</div>
                  {player.equippedTitle && (
                    <div className={`text-[10px] ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>
                      {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mode Description */}
              <div className={`text-center mb-4 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} max-w-xs`}>
                {mode === 'competitive' && matchType === 'ranked' && (
                  <p className="text-yellow-300 text-xs font-bold">⚠️ ELO rating will be affected!</p>
                )}
                {mode === 'competitive' && matchType === 'unranked' && (
                  <p className="text-blue-300 text-xs font-bold">✨ Casual match • No ELO changes</p>
                )}
                {(mode === 'zen' || multiplayerType === 'zen') && (
                  <p className="text-purple-300 text-xs font-bold">🌀 Pass through walls freely!</p>
                )}
                {mode === 'survival' && (
                  <p className="text-red-300 text-xs font-bold">⚡ Speed increases over time!</p>
                )}
                {mode === 'timed' && (
                  <p className="text-cyan-300 text-xs font-bold">⏱️ Score as high as you can in 60 seconds!</p>
                )}
                {mode === 'classic' && !isMultiplayer && (
                  <p className="text-green-300 text-xs font-bold">🎯 Eat food, grow longer, avoid walls!</p>
                )}
              </div>
              
              {/* Controls Info */}
              {isMultiplayer && (
                <div className={`text-center mb-4 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800/60' : 'bg-white/60'} max-w-xs`}>
                  {multiplayerType === 'player' && (
                    <>
                      <p className={`text-xs font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🎮 Controls</p>
                      <p className="text-gray-400 text-xs">
                        <span className="text-green-400 font-bold">{playerLabels.p1}:</span> WASD/Arrows<br/>
                        <span className="text-blue-400 font-bold">{playerLabels.p2}:</span> IJKL
                      </p>
                    </>
                  )}
                  {(multiplayerType === 'bot' || multiplayerType === 'zen') && (
                    <p className="text-gray-400 text-xs">
                      <span className="text-green-400 font-bold">{playerLabels.p1}:</span> WASD/Arrows<br/>
                      <span className="text-blue-400 font-bold">{playerLabels.p2}:</span> AI Controlled
                    </p>
                  )}
                </div>
              )}
              
              {/* Start Button */}
              <button 
                onClick={() => { audioManager.playClickSound(); startGame(); }} 
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/50"
              >
                ▶ START GAME
              </button>
            </div>
          )}

          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in p-6">
              <div className="text-6xl mb-4">⏸️</div>
              <h2 className="text-2xl font-black text-white mb-2">Game Paused</h2>
              
              {/* Player Info */}
              <div className={`flex items-center gap-2 mb-4 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'}`}>
                <span className="text-2xl">{player.avatar}</span>
                <div className="text-left">
                  <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{player.username}</div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getModeLabel()} • {getDifficultyLabel().text}
                  </div>
                </div>
              </div>
              
              {/* Current Stats */}
              <div className={`grid grid-cols-2 gap-3 mb-4 w-full max-w-xs`}>
                <div className={`${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'} rounded-lg p-3 text-center`}>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Score</div>
                  <div className="text-xl font-black text-green-400">{score}</div>
                </div>
                <div className={`${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'} rounded-lg p-3 text-center`}>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Length</div>
                  <div className="text-xl font-black text-green-400">{snake.length}</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => { audioManager.playClickSound(); setGameState('PLAYING'); }} 
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  ▶ Resume
                </button>
                <button 
                  onClick={() => { audioManager.playClickSound(); onBack(); }} 
                  className={`px-6 py-3 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95`}
                >
                  ← Quit
                </button>
              </div>
            </div>
          )}

          {gameState === 'GAME_OVER' && showResult && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in overflow-y-auto p-4">
              {/* Result Icon */}
              <div className="text-5xl mb-3">
                {mode === 'competitive' 
                  ? (score > score2 ? '🏆' : score2 > score ? '💀' : '🤝')
                  : isMultiplayer 
                  ? (score > score2 ? '🏆' : score2 > score ? '💀' : '🤝')
                  : score >= (player.highScores[difficulty] || 0) ? '🎉' : '💀'}
              </div>
              
              {/* Result Title */}
              <h2 className={`text-2xl font-black mb-2 ${
                mode === 'competitive' || isMultiplayer
                  ? (score > score2 ? 'text-green-400' : score2 > score ? 'text-red-400' : 'text-yellow-400')
                  : score >= (player.highScores[difficulty] || 0) ? 'text-green-400' : 'text-red-400'
              }`}>
                {mode === 'competitive' 
                  ? (score > score2 ? '🏆 Victory!' : score2 > score ? '💀 Defeat!' : '🤝 Draw!')
                  : isMultiplayer 
                  ? (score > score2 ? '🏆 You Win!' : score2 > score ? ((multiplayerType === 'bot' || multiplayerType === 'zen') ? '💀 Bot Wins!' : '💀 Player 2 Wins!') : '🤝 Tie Game!') 
                  : score >= (player.highScores[difficulty] || 0) ? '🎉 New High Score!' : '💀 Game Over!'}
              </h2>
              
              {/* Player Info */}
              <div className={`flex items-center gap-2 mb-3 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'}`}>
                <span className="text-2xl">{player.avatar}</span>
                <div className="text-left">
                  <div className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{player.username}</div>
                  {player.equippedTitle && (
                    <div className={`text-[10px] ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`}>
                      {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`${theme === 'dark' ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-gray-200'} rounded-xl p-4 mb-3 w-full max-w-[280px] border-2`}>
                {mode === 'survival' ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>⏱️ Survived</span>
                      <span className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatTime(finalScore)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>⚡ Max Speed</span>
                      <span className="text-lg font-black text-orange-400">x{survivalSpeed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>🏆 Final Score</span>
                      <span className="text-lg font-black text-green-400">{score}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{playerLabels.p1}</span>
                      <span className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{score}</span>
                    </div>
                    {(isMultiplayer || mode === 'competitive') && (
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{playerLabels.p2}</span>
                        <span className="text-lg font-black text-blue-400">{score2}</span>
                      </div>
                    )}
                    {!isMultiplayer && mode !== 'competitive' && (
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>📏 Length</span>
                        <span className="text-lg font-black text-green-400">{snake.length}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Length</span>
                  <span className="text-green-400 font-bold">{snake.length}</span>
                </div>
                <div className="border-t border-gray-700 my-2" />
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-400">+XP</span>
                  <span className="text-yellow-400 font-bold">{xpEarned}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-yellow-500">+Coins</span>
                  <span className="text-yellow-500 font-bold">{coinsEarned}</span>
                </div>
                {mode === 'competitive' && matchType === 'ranked' && (
                  <>
                    <div className="border-t border-gray-700 my-2" />
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">ELO Change</span>
                      <span className={`font-bold ${eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {eloChange >= 0 ? '+' : ''}{eloChange}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">New Rank</span>
                      <span className="text-purple-400 font-bold">{getRankFromElo(player.elo).toUpperCase()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* New Titles Unlocked */}
              {newTitles.length > 0 && (
                <div className="w-full max-w-[250px] mb-3 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-3 border border-indigo-500/30 animate-fade-in">
                  <div className="text-xs text-indigo-300 font-bold mb-2 text-center">🎖️ New Title{newTitles.length > 1 ? 's' : ''} Unlocked!</div>
                  <div className="space-y-1">
                    {newTitles.map(titleId => {
                      const title = TITLES.find(t => t.id === titleId);
                      if (!title) return null;
                      return (
                        <div key={titleId} className="flex items-center gap-2 bg-gray-800/60 rounded-lg px-2 py-1.5">
                          <span className="text-lg">{title.icon}</span>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">{title.name}</div>
                            <div className="text-[10px] text-gray-400">{title.description}</div>
                          </div>
                          <span className="text-[10px] text-yellow-400">+{title.coinReward}🪙</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => { audioManager.playClickSound(); startGame(); }} className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95">↺ Again</button>
                <button onClick={() => { audioManager.playClickSound(); onBack(); }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all">← Menu</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
