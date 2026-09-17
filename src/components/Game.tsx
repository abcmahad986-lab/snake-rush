import { useState, useEffect, useCallback, useRef } from 'react';
import { Position, Direction, GameState, Difficulty, GameMode, GRID_SIZE, DIFFICULTY_SPEEDS, TIMED_DURATIONS, Player, PowerUp, TITLES, Theme, GAME_MAPS } from '../types';
import { savePlayer, addXp } from '../store';
import { audioManager } from '../audio';

type MultiplayerType = 'bot' | 'player' | 'zen';

interface GameProps {
  player: Player;
  setPlayer: (p: Player) => void;
  mode: GameMode;
  difficulty: Difficulty;
  onBack: () => void;
  isMultiplayer?: boolean;
  multiplayerType?: MultiplayerType;
  theme: Theme;
  toggleTheme: () => void;
}

function getRandomFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
  } while (snake.some(s => s.x === food.x && s.y === food.y));
  return food;
}

function getRandomPowerUp(): PowerUp | null {
  if (Math.random() > 0.15) return null;
  const types: PowerUp['type'][] = ['speed', 'slow', 'double', 'shrink', 'shield', 'time_slow', 'coin_magnet', 'ghost_pass', 'score_boost'];
  const icons = ['⚡', '🐌', '✖️2', '🔽', '🛡️', '⏱️', '🧲', '👻', '💫'];
  const idx = Math.floor(Math.random() * types.length);
  return {
    position: { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) },
    type: types[idx],
    icon: icons[idx],
    expiresAt: Date.now() + 8000,
  };
}

// Bot AI - moves toward food intelligently
function getBotDirection(snake: Position[], food: Position, currentDir: Direction, otherSnake?: Position[], isZenMode?: boolean): Direction {
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
      
      // Check other snake collision (bad)
      if (otherSnake && otherSnake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        score -= 500;
      }
      
      // Bonus for being adjacent to food
      if (newHead.x === food.x && newHead.y === food.y) {
        score += 100;
      }
      
      // Small randomness to avoid predictable behavior
      score += Math.random() * 5;
    }
    
    scores.push({ dir, score });
  }
  
  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);
  
  // Return best direction
  return scores[0]?.dir || currentDir;
}

export default function Game({ player, setPlayer, mode, difficulty, onBack, isMultiplayer, multiplayerType = 'player', theme, toggleTheme }: GameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [snake2, setSnake2] = useState<Position[]>([{ x: 10, y: 15 }, { x: 9, y: 15 }, { x: 8, y: 15 }]);
  const [food, setFood] = useState<Position>(() => getRandomFood([{ x: 10, y: 10 }]));
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
      const pu = getRandomPowerUp();
      if (pu) {
        setPowerUps(prev => [...prev.filter(p => p.expiresAt > Date.now()), pu]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [gameState]);

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
    setFood(getRandomFood(initSnake));
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

  // Touch
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onEnd = (e: TouchEvent) => {
      if (!touchRef.current || stateRef.current !== 'PLAYING') return;
      const dx = e.changedTouches[0].clientX - touchRef.current.x;
      const dy = e.changedTouches[0].clientY - touchRef.current.y;
      if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;
      if (Math.abs(dx) > Math.abs(dy)) changeDir(dx > 0 ? 'RIGHT' : 'LEFT');
      else changeDir(dy > 0 ? 'DOWN' : 'UP');
      touchRef.current = null;
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => { window.removeEventListener('touchstart', onStart); window.removeEventListener('touchend', onEnd); };
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
        const botDir = getBotDirection(snake2Ref.current, foodRef.current, dir2Ref.current, snakeRef.current, multiplayerType === 'zen');
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
        // Removed collision detection between player snakes

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
          
          // Get all snakes to avoid food spawning on them
          const allSnakes = isMultiplayer ? [...newSnake, ...snake2Ref.current] : newSnake;
          setFood(getRandomFood(allSnakes));
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

          const newSnake = [newHead, ...prev];
          if (newHead.x === foodRef.current.x && newHead.y === foodRef.current.y) {
            setScore2(s => s + 10);
            const allSnakes = [...newSnake, ...snakeRef.current];
            setFood(getRandomFood(allSnakes));
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
      const finalS = mode === 'survival' ? survivalTime : (isMultiplayer ? Math.max(score, score2) : score);
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

    const skin = player.equippedSkin;
    const colors: Record<string, [string, string]> = {
      classic: ['74, 222, 128', '34, 197, 94'],
      fire: ['251, 146, 60', '239, 68, 68'],
      ice: ['147, 197, 253', '59, 130, 246'],
      gold: ['253, 224, 71', '234, 179, 8'],
      rainbow: ['248, 113, 113', '168, 85, 247'],
      neon: ['192, 132, 252', '139, 92, 246'],
      galaxy: ['129, 140, 248', '79, 70, 229'],
      dragon: ['251, 113, 133', '220, 38, 38'],
      phantom: ['209, 213, 219', '156, 163, 175'],
      cosmic: ['167, 139, 250', '109, 40, 217'],
    };
    const [head, body] = colors[skin] || colors.classic;
    
    if (index === 0) return { bg: `rgba(${head}, ${opacity})`, shadow: `0 0 10px rgba(${head}, 0.7)` };
    return { bg: `rgba(${body}, ${opacity})`, shadow: 'none' };
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const getModeLabel = () => {
    if (isMultiplayer) {
      if (multiplayerType === 'zen') return '🌀 Zen Multiplayer';
      return multiplayerType === 'bot' ? '🤖 vs Bot' : '👥 vs Player';
    }
    if (mode === 'timed') return '⏱️ Timed';
    if (mode === 'zen') return '🧘 Zen';
    return '🐍 Classic';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 via-slate-50 to-white'} flex flex-col items-center p-2 md:p-4 select-none`}>
      {/* Top Bar */}
      <div className="w-full max-w-lg flex items-center justify-between mb-2">
        <button onClick={onBack} className={`px-3 py-1.5 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'} rounded-lg text-sm border`}>
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {player.equippedTitle && (
            <span className={`text-[10px] ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} hidden md:inline`}>
              {TITLES.find(ti => ti.id === player.equippedTitle)?.icon} {TITLES.find(ti => ti.id === player.equippedTitle)?.name}
            </span>
          )}
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} uppercase`}>{getModeLabel()}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
            difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
            difficulty === 'hard' ? 'bg-red-900/50 text-red-400' :
            'bg-purple-900/50 text-purple-400'
          }`}>{difficulty}</span>
          <button
            onClick={() => {
              audioManager.playClickSound();
              const muted = audioManager.toggleMute();
              setIsMuted(muted);
            }}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
            } border`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <button
            onClick={toggleTheme}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border-gray-700/50' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
            } border`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Score Bar */}
      <div className={`w-full max-w-lg flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white border-gray-200 shadow-sm'} rounded-xl px-3 py-2 mb-2 border`}>
        <div className="text-center">
          <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{isMultiplayer ? 'P1' : 'Score'}</div>
          <div className="text-lg font-bold text-green-400">{score}</div>
        </div>
        {mode === 'timed' && (
          <div className="text-center">
            <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Time</div>
            <div className={`text-lg font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatTime(timeLeft)}</div>
          </div>
        )}
        {mode === 'survival' && (
          <>
            <div className="text-center">
              <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Survived</div>
              <div className={`text-lg font-bold ${survivalTime >= 60 ? 'text-yellow-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{formatTime(survivalTime)}</div>
            </div>
            <div className="text-center">
              <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Speed</div>
              <div className={`text-lg font-bold ${survivalSpeed >= 5 ? 'text-red-400 animate-pulse' : survivalSpeed >= 3 ? 'text-orange-400' : theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>x{survivalSpeed}</div>
            </div>
          </>
        )}
        {combo > 2 && (
          <div className="text-center">
            <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Combo</div>
            <div className="text-lg font-bold text-orange-400">x{combo}</div>
          </div>
        )}
        {isMultiplayer && (
          <div className="text-center">
            <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{multiplayerType === 'bot' ? 'Bot' : 'P2'}</div>
            <div className="text-lg font-bold text-blue-400">{score2}</div>
          </div>
        )}
        {!isMultiplayer && mode !== 'timed' && (
          <div className="text-center">
            <div className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Length</div>
            <div className="text-lg font-bold text-green-400">{snake.length}</div>
          </div>
        )}
        {activeEffects.length > 0 && (
          <div className="flex gap-1">
            {activeEffects.map(e => (
              <span key={e} className="text-xs animate-pulse">
                {e === 'double' ? '✖️2' : e === 'speed' ? '⚡' : e === 'slow' ? '🐌' : e === 'time_slow' ? '⏱️' : e === 'coin_magnet' ? '🧲' : e === 'ghost_pass' ? '👻' : '💫'}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="relative w-full max-w-lg aspect-square">
        <div className={`absolute inset-0 bg-gray-900/90 rounded-2xl border-2 overflow-hidden shadow-2xl ${mode === 'zen' || multiplayerType === 'zen' ? 'border-purple-500/40 shadow-purple-500/20' : 'border-gray-700/60'}`}>
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

          {/* Overlays */}
          {gameState === 'IDLE' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in">
              <div className="text-4xl mb-3">
                {isMultiplayer 
                  ? (multiplayerType === 'zen' ? '🌀' : multiplayerType === 'bot' ? '🤖' : '👥') 
                  : mode === 'timed' ? '⏱️' : mode === 'zen' ? '🧘' : '🐍'}
              </div>
              <h2 className="text-lg font-bold text-white mb-1">
                {isMultiplayer 
                  ? (multiplayerType === 'zen' ? 'Zen Multiplayer!' : multiplayerType === 'bot' ? 'vs Bot!' : 'vs Player!') 
                  : mode === 'timed' ? 'Timed Challenge' : mode === 'zen' ? 'Zen Mode' : 'Ready?'}
              </h2>
              {(mode === 'zen' || multiplayerType === 'zen') && <p className="text-purple-300 text-xs mb-2">Pass through walls freely!</p>}
              {isMultiplayer && multiplayerType === 'player' && <p className="text-gray-400 text-xs mb-2">P1: WASD/Arrows • P2: IJKL</p>}
              {isMultiplayer && multiplayerType === 'bot' && <p className="text-gray-400 text-xs mb-2">Use WASD/Arrows to compete!</p>}
              {isMultiplayer && multiplayerType === 'zen' && <p className="text-gray-400 text-xs mb-2">vs Bot • No walls!</p>}
              <button onClick={() => { audioManager.playClickSound(); startGame(); }} className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30">
                ▶ Start
              </button>
            </div>
          )}

          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in">
              <div className="text-4xl mb-3">⏸️</div>
              <h2 className="text-xl font-bold text-white mb-3">Paused</h2>
              <div className="flex gap-2">
                <button onClick={() => setGameState('PLAYING')} className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all">▶ Resume</button>
                <button onClick={onBack} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all">← Quit</button>
              </div>
            </div>
          )}

          {gameState === 'GAME_OVER' && showResult && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in overflow-y-auto p-4">
              <div className="text-3xl mb-2">
                {isMultiplayer && score > score2 ? '🏆' : score >= (player.highScores[difficulty] || 0) ? '🎉' : '💀'}
              </div>
              <h2 className="text-xl font-bold text-red-400 mb-1">
                {isMultiplayer ? (score > score2 ? 'You Win!' : score2 > score ? ((multiplayerType === 'bot' || multiplayerType === 'zen') ? 'Bot Wins!' : 'Player 2 Wins!') : 'Tie!') : 'Game Over!'}
              </h2>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-gray-400">{player.avatar} {player.username}</span>
                {player.equippedTitle && (
                  <span className="text-[10px] text-indigo-300">
                    {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-800/80 rounded-xl p-3 mb-3 w-full max-w-[250px] border border-gray-700/50">
                {mode === 'survival' ? (
                  <>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Survived</span>
                      <span className="text-white font-bold">{formatTime(finalScore)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Max Speed</span>
                      <span className="text-orange-400 font-bold">x{survivalSpeed}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Score</span>
                      <span className="text-green-400 font-bold">{score}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Your Score</span>
                      <span className="text-white font-bold">{finalScore}</span>
                    </div>
                    {isMultiplayer && (
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{(multiplayerType === 'bot' || multiplayerType === 'zen') ? 'Bot' : 'P2'} Score</span>
                        <span className="text-blue-400 font-bold">{score2}</span>
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

      {/* Touch Controls - Responsive D-Pad */}
      <div className="mt-4 w-full max-w-lg">
        {/* D-Pad Container */}
        <div className={`${theme === 'dark' ? 'bg-gray-800/60 border-gray-700/50' : 'bg-white/80 border-gray-200'} rounded-2xl p-4 border backdrop-blur-sm shadow-lg`}>
          {/* D-Pad Grid */}
          <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48 mx-auto">
            {/* Up Button */}
            <div />
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDir('UP'); }}
              onClick={() => changeDir('UP')}
              className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-green-600 active:to-green-700 border-gray-600/50 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-50 hover:to-gray-100 active:from-green-500 active:to-green-600 border-gray-300 text-gray-700'} rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all duration-150 transform active:scale-95 shadow-md`}
              aria-label="Move Up"
            >
              ▲
            </button>
            <div />

            {/* Left Button */}
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDir('LEFT'); }}
              onClick={() => changeDir('LEFT')}
              className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-green-600 active:to-green-700 border-gray-600/50 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-50 hover:to-gray-100 active:from-green-500 active:to-green-600 border-gray-300 text-gray-700'} rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all duration-150 transform active:scale-95 shadow-md`}
              aria-label="Move Left"
            >
              ◀
            </button>

            {/* Center - Pause Button */}
            <button
              onClick={() => {
                audioManager.playClickSound();
                if (gameState === 'PLAYING') setGameState('PAUSED');
                else if (gameState === 'PAUSED') setGameState('PLAYING');
              }}
              className={`${theme === 'dark' ? 'bg-gradient-to-br from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 border-purple-600/50 text-white' : 'bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-50 hover:to-purple-100 border-purple-300 text-purple-700'} rounded-xl flex items-center justify-center text-xl font-bold border-2 transition-all duration-150 transform active:scale-95 shadow-md`}
              aria-label="Pause/Resume"
            >
              {gameState === 'PAUSED' ? '▶' : '⏸'}
            </button>

            {/* Right Button */}
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDir('RIGHT'); }}
              onClick={() => changeDir('RIGHT')}
              className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-green-600 active:to-green-700 border-gray-600/50 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-50 hover:to-gray-100 active:from-green-500 active:to-green-600 border-gray-300 text-gray-700'} rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all duration-150 transform active:scale-95 shadow-md`}
              aria-label="Move Right"
            >
              ▶
            </button>

            {/* Down Button */}
            <div />
            <button
              onTouchStart={(e) => { e.preventDefault(); changeDir('DOWN'); }}
              onClick={() => changeDir('DOWN')}
              className={`${theme === 'dark' ? 'bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 active:from-green-600 active:to-green-700 border-gray-600/50 text-white' : 'bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-50 hover:to-gray-100 active:from-green-500 active:to-green-600 border-gray-300 text-gray-700'} rounded-xl flex items-center justify-center text-2xl font-bold border-2 transition-all duration-150 transform active:scale-95 shadow-md`}
              aria-label="Move Down"
            >
              ▼
            </button>
            <div />
          </div>

          {/* Control Info */}
          <div className={`mt-3 text-center text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {isMultiplayer && multiplayerType === 'player' ? (
              <span>
                <span className="font-semibold">P1:</span> Touch controls or WASD • <span className="font-semibold">P2:</span> IJKL keys
              </span>
            ) : (
              <span>
                Touch controls or <kbd className={`px-1.5 py-0.5 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded text-[10px] font-mono`}>↑↓←→</kbd> / <kbd className={`px-1.5 py-0.5 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded text-[10px] font-mono`}>WASD</kbd> to move
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
