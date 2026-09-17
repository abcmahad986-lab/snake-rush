import { useState, useEffect, useCallback, useRef } from 'react';
import { Theme, Position, Direction } from '../types';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;
const GRID = 20;
const LUDO_SIZE = 15;

// ============ PROFESSIONAL LUDO MASTER GAME ============
// Real Ludo board game with proper mechanics
export function LudoMasterGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [tokens, setTokens] = useState<number[][]>([
    [-1, -1, -1, -1], // Red: -1 = home, 0-51 = path, 52-57 = home stretch
    [-1, -1, -1, -1], // Blue
    [-1, -1, -1, -1], // Green
    [-1, -1, -1, -1], // Yellow
  ]);
  const [winner, setWinner] = useState<number | null>(null);
  const [message, setMessage] = useState('Roll the dice to start!');
  const [canMove, setCanMove] = useState(false);

  const playerColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
  const playerNames = ['Red', 'Blue', 'Green', 'Yellow'];
  const startPositions = [0, 13, 26, 39]; // Starting positions for each player

  const rollDice = () => {
    if (rolling || winner !== null || canMove) return;
    setRolling(true);
    audioManager.playClickSound();
    
    let count = 0;
    const interval = setInterval(() => {
      setDice(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalDice = Math.floor(Math.random() * 6) + 1;
        setDice(finalDice);
        setRolling(false);
        setCanMove(true);
        setMessage(`${playerNames[currentPlayer]} rolled ${finalDice}! Select a token to move.`);
      }
    }, 80);
  };

  const moveToken = (tokenIndex: number) => {
    if (!canMove || winner !== null) return;
    
    const playerTokens = [...tokens[currentPlayer]];
    const currentPos = playerTokens[tokenIndex];
    
    // Can't move if token is home and didn't roll 6
    if (currentPos === -1 && dice !== 6) {
      setMessage('Need a 6 to move token out of home!');
      return;
    }
    
    let newPos = currentPos;
    if (currentPos === -1) {
      newPos = startPositions[currentPlayer];
    } else if (currentPos < 52) {
      newPos = currentPos + dice;
      // Check if entering home stretch
      if (newPos >= 52 + startPositions[currentPlayer] && newPos <= 57 + startPositions[currentPlayer]) {
        newPos = newPos; // In home stretch
      } else if (newPos > 57 + startPositions[currentPlayer]) {
        newPos = 57 + startPositions[currentPlayer]; // Reached home
      }
    } else {
      newPos = Math.min(currentPos + dice, 57 + startPositions[currentPlayer]);
    }
    
    playerTokens[tokenIndex] = newPos;
    const newTokens = [...tokens];
    newTokens[currentPlayer] = playerTokens;
    
    // Check for captures
    for (let p = 0; p < 4; p++) {
      if (p === currentPlayer) continue;
      for (let t = 0; t < 4; t++) {
        if (newTokens[p][t] === newPos && newPos < 52) {
          newTokens[p][t] = -1; // Send back home
          setMessage(`${playerNames[currentPlayer]} captured ${playerNames[p]}'s token!`);
        }
      }
    }
    
    setTokens(newTokens);
    audioManager.playClickSound();
    
    // Check win condition
    if (playerTokens.every(pos => pos >= 57 + startPositions[currentPlayer])) {
      setWinner(currentPlayer);
      setMessage(`${playerNames[currentPlayer]} wins! 🏆`);
      audioManager.playSuccessSound();
      return;
    }
    
    // Next turn (roll 6 = extra turn)
    if (dice !== 6) {
      setCurrentPlayer((currentPlayer + 1) % 4);
      setCanMove(false);
      setMessage(`${playerNames[(currentPlayer + 1) % 4]}'s turn. Roll the dice!`);
    } else {
      setCanMove(false);
      setMessage(`${playerNames[currentPlayer]} rolled 6! Roll again!`);
    }
  };

  const restart = () => {
    setCurrentPlayer(0);
    setDice(0);
    setTokens([
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
    ]);
    setWinner(null);
    setMessage('Roll the dice to start!');
    setCanMove(false);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>🎲 Ludo Master</h2>
          <div className="w-16" />
        </div>

        {/* Board */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4 mb-3`}>
          {/* Player Status */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {playerColors.map((color, i) => (
              <div key={i} className={`text-center p-2 rounded-lg border-2 ${currentPlayer === i ? 'opacity-100 scale-105' : 'opacity-50'} transition-all`} style={{ borderColor: color }}>
                <div className="text-xs font-bold" style={{ color }}>{playerNames[i]}</div>
                <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>
                  {tokens[i].filter(p => p >= 57 + startPositions[i]).length}/4
                </div>
              </div>
            ))}
          </div>

          {/* Dice */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl flex items-center justify-center text-4xl font-black ${t(theme, 'text-white', 'text-black')} ${rolling ? 'animate-bounce' : ''}`}>
              {dice > 0 ? ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice - 1] : '?'}
            </div>
          </div>

          {/* Message */}
          <div className={`text-center text-sm font-bold mb-3 ${t(theme, 'text-white', 'text-black')}`} style={{ color: playerColors[currentPlayer] }}>
            {message}
          </div>

          {/* Roll Button */}
          {!winner && !canMove && (
            <button onClick={rollDice} disabled={rolling} className={`w-full py-3 font-bold rounded-xl border-2 ${t(theme, 'bg-black text-white border-white hover:bg-gray-900', 'bg-white text-black border-black hover:bg-gray-100')} disabled:opacity-50`}>
              {rolling ? '🎲 Rolling...' : `🎲 ${playerNames[currentPlayer]}'s Turn - Roll!`}
            </button>
          )}

          {/* Token Selection */}
          {canMove && !winner && (
            <div className="grid grid-cols-4 gap-2">
              {tokens[currentPlayer].map((pos, i) => (
                <button
                  key={i}
                  onClick={() => moveToken(i)}
                  className={`p-3 rounded-lg border-2 ${t(theme, 'border-white', 'border-black')} hover:scale-105 transition-all`}
                  style={{ backgroundColor: playerColors[currentPlayer] + '20' }}
                >
                  <div className="text-xs font-bold" style={{ color: playerColors[currentPlayer] }}>
                    Token {i + 1}
                  </div>
                  <div className={`text-sm ${t(theme, 'text-white', 'text-black')}`}>
                    {pos === -1 ? '🏠 Home' : pos >= 57 + startPositions[currentPlayer] ? '🏆 Done' : `Pos ${pos}`}
                  </div>
                </button>
              ))}
            </div>
          )}

          {winner !== null && (
            <div className="text-center">
              <div className="text-2xl font-black mb-3" style={{ color: playerColors[winner] }}>🏆 {playerNames[winner]} Wins!</div>
              <button onClick={restart} className={`px-6 py-3 font-bold rounded-xl border-2 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')}`}>Play Again</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ PROFESSIONAL SNAKE LEADER (2 PLAYER) ============
// Two-player competitive snake game - Player 1 (WASD) vs Player 2 (Arrow Keys)
export function SnakeLeaderGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [snake1, setSnake1] = useState<Position[]>([{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }]);
  const [snake2, setSnake2] = useState<Position[]>([{ x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [dir1, setDir1] = useState<Direction>('RIGHT');
  const [dir2, setDir2] = useState<Direction>('LEFT');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const dir1Ref = useRef<Direction>('RIGHT');
  const dir2Ref = useRef<Direction>('LEFT');

  useEffect(() => { dir1Ref.current = dir1; }, [dir1]);
  useEffect(() => { dir2Ref.current = dir2; }, [dir2]);

  const spawnFood = useCallback((snakes: Position[][]) => {
    let f: Position;
    const allSegments = snakes.flat();
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (allSegments.some(s => s.x === f.x && s.y === f.y));
    return f;
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      // Move Player 1
      setSnake1(prev => {
        const head = prev[0];
        const d = dir1Ref.current;
        const newHead = { ...head };
        if (d === 'UP') newHead.y--;
        else if (d === 'DOWN') newHead.y++;
        else if (d === 'LEFT') newHead.x--;
        else newHead.x++;

        // Wall wrap
        if (newHead.x < 0) newHead.x = GRID - 1;
        if (newHead.x >= GRID) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID - 1;
        if (newHead.y >= GRID) newHead.y = 0;

        // Self collision
        if (prev.slice(1).some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          setWinner(2);
          audioManager.playGameOverSound();
          return prev;
        }

        // Collision with Player 2
        if (snake2.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          setWinner(2);
          audioManager.playGameOverSound();
          return prev;
        }

        const newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          audioManager.playEatSound();
          setScore1(s => s + 10);
          setFood(spawnFood([newSnake, snake2]));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });

      // Move Player 2
      setSnake2(prev => {
        const head = prev[0];
        const d = dir2Ref.current;
        const newHead = { ...head };
        if (d === 'UP') newHead.y--;
        else if (d === 'DOWN') newHead.y++;
        else if (d === 'LEFT') newHead.x--;
        else newHead.x++;

        // Wall wrap
        if (newHead.x < 0) newHead.x = GRID - 1;
        if (newHead.x >= GRID) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID - 1;
        if (newHead.y >= GRID) newHead.y = 0;

        // Self collision
        if (prev.slice(1).some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          setWinner(1);
          audioManager.playGameOverSound();
          return prev;
        }

        // Collision with Player 1
        if (snake1.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          setWinner(1);
          audioManager.playGameOverSound();
          return prev;
        }

        const newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          audioManager.playEatSound();
          setScore2(s => s + 10);
          setFood(spawnFood([snake1, newSnake]));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [started, gameOver, food, spawnFood, snake1, snake2]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const opp: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
      
      // Player 1: WASD
      const p1Map: Record<string, Direction> = { w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT' };
      if (p1Map[e.key.toLowerCase()]) {
        const newDir = p1Map[e.key.toLowerCase()];
        if (opp[newDir] !== dir1Ref.current) {
          setDir1(newDir);
          dir1Ref.current = newDir;
        }
      }
      
      // Player 2: Arrow Keys
      const p2Map: Record<string, Direction> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT' };
      if (p2Map[e.key]) {
        const newDir = p2Map[e.key];
        if (opp[newDir] !== dir2Ref.current) {
          setDir2(newDir);
          dir2Ref.current = newDir;
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const restart = () => {
    setSnake1([{ x: 5, y: 10 }, { x: 4, y: 10 }, { x: 3, y: 10 }]);
    setSnake2([{ x: 15, y: 10 }, { x: 16, y: 10 }, { x: 17, y: 10 }]);
    setFood({ x: 10, y: 10 });
    setDir1('RIGHT');
    setDir2('LEFT');
    dir1Ref.current = 'RIGHT';
    dir2Ref.current = 'LEFT';
    setScore1(0);
    setScore2(0);
    setGameOver(false);
    setWinner(null);
    setStarted(true);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>👑 Snake Battle 2P</h2>
          <div className="w-16" />
        </div>

        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-2 mb-3 flex justify-between`}>
          <div className="text-center">
            <div className="text-xs font-bold text-green-400">Player 1 (WASD)</div>
            <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>{score1}</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-blue-400">Player 2 (Arrows)</div>
            <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>{score2}</div>
          </div>
        </div>

        <div className={`relative aspect-square ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl overflow-hidden`}>
          {/* Food */}
          <div className="absolute w-[5%] h-[5%] bg-red-500 rounded-full animate-pulse" style={{ left: `${(food.x / GRID) * 100}%`, top: `${(food.y / GRID) * 100}%` }} />
          
          {/* Player 1 - Green */}
          {snake1.map((seg, i) => (
            <div key={`p1-${i}`} className="absolute rounded-sm" style={{
              left: `${(seg.x / GRID) * 100}%`, top: `${(seg.y / GRID) * 100}%`,
              width: `${100 / GRID}%`, height: `${100 / GRID}%`, padding: '1px', zIndex: 10
            }}>
              <div className="w-full h-full rounded-sm" style={{ backgroundColor: i === 0 ? '#22c55e' : '#16a34a' }} />
            </div>
          ))}

          {/* Player 2 - Blue */}
          {snake2.map((seg, i) => (
            <div key={`p2-${i}`} className="absolute rounded-sm" style={{
              left: `${(seg.x / GRID) * 100}%`, top: `${(seg.y / GRID) * 100}%`,
              width: `${100 / GRID}%`, height: `${100 / GRID}%`, padding: '1px', zIndex: 10
            }}>
              <div className="w-full h-full rounded-sm" style={{ backgroundColor: i === 0 ? '#3b82f6' : '#2563eb' }} />
            </div>
          ))}

          {!started && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-white text-sm mb-2">P1: WASD | P2: Arrow Keys</div>
              <button onClick={() => { audioManager.playClickSound(); setStarted(true); }} className="px-6 py-3 bg-white text-black font-bold rounded-xl">▶ Start Battle</button>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white mb-2">
                {winner === 1 ? '🟢 Player 1 Wins!' : '🔵 Player 2 Wins!'}
              </div>
              <div className="text-white mb-3">P1: {score1} | P2: {score2}</div>
              <button onClick={restart} className="px-6 py-3 bg-white text-black font-bold rounded-xl">↺ Rematch</button>
            </div>
          )}
        </div>

        <div className={`mt-3 text-center text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
          Player 1: WASD | Player 2: Arrow Keys | Eat food, avoid collisions!
        </div>
      </div>
    </div>
  );
}

// ============ PROFESSIONAL SNAKE PUZZLE GAME ============
// Pre-designed puzzle levels with increasing difficulty
export function SnakePuzzleGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [level, setLevel] = useState(1);
  const [snake, setSnake] = useState<Position[]>([{ x: 1, y: 1 }]);
  const [foods, setFoods] = useState<Position[]>([]);
  const [walls, setWalls] = useState<Position[]>([]);
  const [dir, setDir] = useState<Direction>('RIGHT');
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const dirRef = useRef<Direction>('RIGHT');

  // Pre-designed levels
  const levels = [
    // Level 1: Simple introduction
    { walls: [], foods: [{ x: 5, y: 5 }, { x: 10, y: 10 }, { x: 15, y: 5 }], start: { x: 1, y: 1 } },
    // Level 2: Basic walls
    { walls: [{ x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }], foods: [{ x: 3, y: 8 }, { x: 10, y: 10 }, { x: 15, y: 3 }], start: { x: 1, y: 1 } },
    // Level 3: Corridor
    { walls: [{ x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 3, y: 7 }, { x: 3, y: 8 }], foods: [{ x: 8, y: 5 }, { x: 15, y: 10 }], start: { x: 1, y: 1 } },
    // Level 4: Maze-like
    { walls: [{ x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 }, { x: 15, y: 2 }, { x: 15, y: 3 }], foods: [{ x: 8, y: 8 }, { x: 12, y: 12 }, { x: 18, y: 5 }], start: { x: 1, y: 1 } },
    // Level 5: Complex
    { walls: [{ x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 15, y: 12 }, { x: 16, y: 12 }, { x: 17, y: 12 }], foods: [{ x: 8, y: 2 }, { x: 14, y: 6 }, { x: 18, y: 15 }, { x: 3, y: 15 }], start: { x: 1, y: 1 } },
  ];

  const loadLevel = useCallback((lvl: number) => {
    const levelData = levels[Math.min(lvl - 1, levels.length - 1)];
    setWalls(levelData.walls);
    setFoods(levelData.foods);
    setSnake([levelData.start]);
    setDir('RIGHT');
    dirRef.current = 'RIGHT';
    setMoves(0);
    setGameOver(false);
    setWon(false);
    setStarted(false);
    setShowLevelSelect(false);
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || won || !started) return;
    
    setSnake(prev => {
      const head = prev[0];
      const d = dirRef.current;
      const newHead = { ...head };
      if (d === 'UP') newHead.y--;
      else if (d === 'DOWN') newHead.y++;
      else if (d === 'LEFT') newHead.x--;
      else newHead.x++;

      // Check bounds
      if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
        setGameOver(true);
        audioManager.playGameOverSound();
        return prev;
      }

      // Check walls
      if (walls.some(w => w.x === newHead.x && w.y === newHead.y)) {
        setGameOver(true);
        audioManager.playGameOverSound();
        return prev;
      }

      // Check self
      if (prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
        setGameOver(true);
        audioManager.playGameOverSound();
        return prev;
      }

      const newSnake = [newHead, ...prev];
      
      // Check food
      const foodIdx = foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      if (foodIdx !== -1) {
        audioManager.playEatSound();
        const newFoods = [...foods];
        newFoods.splice(foodIdx, 1);
        setFoods(newFoods);
        if (newFoods.length === 0) {
          setWon(true);
          audioManager.playSuccessSound();
        }
      } else {
        newSnake.pop();
      }
      
      setMoves(m => m + 1);
      return newSnake;
    });
  }, [gameOver, won, started, walls, foods]);

  useEffect(() => {
    if (!started || gameOver || won) return;
    const interval = setInterval(moveSnake, 300);
    return () => clearInterval(interval);
  }, [started, gameOver, won, moveSnake]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT' };
      const newDir = map[e.key];
      if (newDir) {
        const opp: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (opp[newDir] !== dirRef.current) {
          setDir(newDir);
          dirRef.current = newDir;
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const nextLevel = () => {
    if (level < levels.length) {
      setLevel(level + 1);
      loadLevel(level + 1);
    } else {
      setShowLevelSelect(true);
    }
  };

  if (showLevelSelect) {
    return (
      <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
        <div className="w-full max-w-lg">
          <div className="flex justify-between items-center mb-3">
            <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
            <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>🧩 Snake Puzzle</h2>
            <div className="w-16" />
          </div>

          <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4`}>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-4 text-center`}>Select Level</h3>
            <div className="grid grid-cols-3 gap-3">
              {levels.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setLevel(idx + 1); loadLevel(idx + 1); }}
                  className={`p-4 rounded-xl border-2 ${t(theme, 'border-white hover:bg-gray-900', 'border-black hover:bg-gray-100')} transition-all`}
                >
                  <div className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>Level {idx + 1}</div>
                  <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mt-1`}>
                    {levels[idx].foods.length} foods
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => setShowLevelSelect(true)} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Levels</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>🧩 Level {level}</h2>
          <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>{moves} moves</div>
        </div>

        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-2 mb-3 flex justify-between`}>
          <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>Food: {foods.length}</span>
          <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>Moves: {moves}</span>
        </div>

        <div className={`relative aspect-square ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl overflow-hidden`}>
          {/* Walls */}
          {walls.map((w, i) => (
            <div key={`w${i}`} className="absolute bg-gray-600" style={{ left: `${(w.x / GRID) * 100}%`, top: `${(w.y / GRID) * 100}%`, width: `${100 / GRID}%`, height: `${100 / GRID}%` }} />
          ))}
          
          {/* Foods */}
          {foods.map((f, i) => (
            <div key={`f${i}`} className="absolute w-[80%] h-[80%] bg-red-500 rounded-full animate-pulse" style={{ left: `${(f.x / GRID) * 100 + 10}%`, top: `${(f.y / GRID) * 100 + 10}%` }} />
          ))}
          
          {/* Snake */}
          {snake.map((s, i) => (
            <div key={`s${i}`} className="absolute rounded-sm" style={{ left: `${(s.x / GRID) * 100}%`, top: `${(s.y / GRID) * 100}%`, width: `${100 / GRID}%`, height: `${100 / GRID}%`, padding: '1px' }}>
              <div className="w-full h-full rounded-sm" style={{ backgroundColor: i === 0 ? '#22c55e' : '#16a34a' }} />
            </div>
          ))}

          {!started && !gameOver && !won && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <button onClick={() => { audioManager.playClickSound(); setStarted(true); }} className="px-6 py-3 bg-white text-black font-bold rounded-xl">▶ Start</button>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white mb-2">Stuck!</div>
              <button onClick={() => loadLevel(level)} className="px-6 py-3 bg-white text-black font-bold rounded-xl mb-2">↺ Retry</button>
            </div>
          )}
          {won && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-green-400 mb-2">🎉 Level Complete!</div>
              <div className="text-white mb-3">Moves: {moves}</div>
              <button onClick={nextLevel} className="px-6 py-3 bg-white text-black font-bold rounded-xl">
                {level < levels.length ? 'Next Level →' : 'Back to Levels'}
              </button>
            </div>
          )}
        </div>

        {/* Touch Controls */}
        <div className="mt-3 grid grid-cols-3 gap-2 w-40 h-40 mx-auto">
          <div />
          <button onClick={() => { if (dirRef.current !== 'DOWN') { setDir('UP'); dirRef.current = 'UP'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▲</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'RIGHT') { setDir('LEFT'); dirRef.current = 'LEFT'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>◀</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'LEFT') { setDir('RIGHT'); dirRef.current = 'RIGHT'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▶</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'UP') { setDir('DOWN'); dirRef.current = 'DOWN'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▼</button>
          <div />
        </div>
      </div>
    </div>
  );
}

// ============ PROFESSIONAL SNAKE RUNNER GAME ============
// Endless runner with jump mechanics, power-ups, and increasing difficulty
export function SnakeRunnerGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [snakeY, setSnakeY] = useState(5);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState<{ x: number; y: number; type: 'low' | 'high' | 'full' }[]>([]);
  const [coins, setCoins] = useState<{ x: number; y: number }[]>([]);
  const [powerUps, setPowerUps] = useState<{ x: number; y: number; type: 'shield' | 'magnet' | 'slow' }[]>([]);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-runner-highscore');
    return saved ? parseInt(saved) : 0;
  });
  const [speed, setSpeed] = useState(8);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const snakeYRef = useRef(5);
  const jumpVelocityRef = useRef(0);

  useEffect(() => { snakeYRef.current = snakeY; }, [snakeY]);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-runner-highscore', score.toString());
    }
  }, [score, highScore]);

  // Power-up timer
  useEffect(() => {
    if (activePowerUp && powerUpTimer > 0) {
      const timer = setTimeout(() => {
        setPowerUpTimer(powerUpTimer - 1);
        if (powerUpTimer <= 1) {
          setActivePowerUp(null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [activePowerUp, powerUpTimer]);

  // Jump physics
  useEffect(() => {
    if (!isJumping) return;
    const jumpInterval = setInterval(() => {
      jumpVelocityRef.current -= 0.5;
      setSnakeY(y => {
        const newY = y + jumpVelocityRef.current;
        if (newY <= 5) {
          setIsJumping(false);
          jumpVelocityRef.current = 0;
          return 5;
        }
        return newY;
      });
    }, 50);
    return () => clearInterval(jumpInterval);
  }, [isJumping]);

  // Main game loop
  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      // Move obstacles
      setObstacles(prev => {
        const moved = prev.map(o => ({ ...o, x: o.x - 1 })).filter(o => o.x > -2);
        // Spawn new obstacles
        if (Math.random() < 0.02 + (speed * 0.002)) {
          const types: ('low' | 'high' | 'full')[] = ['low', 'high', 'full'];
          const type = types[Math.floor(Math.random() * types.length)];
          const y = type === 'low' ? 8 : type === 'high' ? 2 : 5;
          moved.push({ x: 20, y, type });
        }
        return moved;
      });

      // Move coins
      setCoins(prev => {
        const moved = prev.map(c => ({ x: c.x - 1, y: c.y })).filter(c => c.x > -1);
        if (Math.random() < 0.05) {
          moved.push({ x: 20, y: Math.floor(Math.random() * 8) + 2 });
        }
        return moved;
      });

      // Move power-ups
      setPowerUps(prev => {
        const moved = prev.map(p => ({ x: p.x - 1, y: p.y, type: p.type })).filter(p => p.x > -1);
        if (Math.random() < 0.005) {
          const types: ('shield' | 'magnet' | 'slow')[] = ['shield', 'magnet', 'slow'];
          const type = types[Math.floor(Math.random() * types.length)];
          moved.push({ x: 20, y: Math.floor(Math.random() * 8) + 2, type });
        }
        return moved;
      });

      // Check collisions
      const currentY = snakeYRef.current;
      
      // Obstacle collision (unless shield active)
      if (activePowerUp !== 'shield') {
        if (obstacles.some(o => {
          if (o.x !== 3) return false;
          if (o.type === 'low') return currentY >= 8;
          if (o.type === 'high') return currentY <= 3;
          return currentY >= 4 && currentY <= 6;
        })) {
          setGameOver(true);
          audioManager.playGameOverSound();
          return;
        }
      }

      // Coin collection (with magnet range)
      setCoins(prev => {
        const magnetRange = activePowerUp === 'magnet' ? 3 : 0;
        const remaining = prev.filter(c => {
          if (c.x === 3 && Math.abs(c.y - currentY) <= magnetRange) {
            audioManager.playEatSound();
            setScore(s => s + 10);
            return false;
          }
          return c.x > 2;
        });
        return remaining;
      });

      // Power-up collection
      setPowerUps(prev => {
        const remaining: typeof prev = [];
        prev.forEach(p => {
          if (p.x === 3 && p.y === currentY) {
            audioManager.playSuccessSound();
            setActivePowerUp(p.type);
            setPowerUpTimer(5);
            if (p.type === 'slow') {
              setSpeed(s => Math.max(4, s - 3));
              setTimeout(() => setSpeed(s => s + 3), 5000);
            }
          } else if (p.x > 2) {
            remaining.push(p);
          }
        });
        return remaining;
      });

      setDistance(d => d + 1);
      setScore(s => s + 1);
      setSpeed(sp => Math.min(sp + 0.01, 20));
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [started, gameOver, speed, obstacles, activePowerUp]);

  const jump = () => {
    if (!isJumping && !gameOver && started) {
      setIsJumping(true);
      jumpVelocityRef.current = 3;
      audioManager.playClickSound();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isJumping, gameOver, started]);

  const restart = () => {
    setSnakeY(5);
    setIsJumping(false);
    jumpVelocityRef.current = 0;
    setObstacles([]);
    setCoins([]);
    setPowerUps([]);
    setActivePowerUp(null);
    setPowerUpTimer(0);
    setScore(0);
    setDistance(0);
    setSpeed(8);
    setGameOver(false);
    setStarted(true);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>🏃 Snake Runner</h2>
          <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>🏆 {highScore}</div>
        </div>

        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-2 mb-3 flex justify-between`}>
          <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>Score: {score}</span>
          <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>Distance: {distance}m</span>
          {activePowerUp && (
            <span className={`text-sm font-bold ${t(theme, 'text-yellow-400', 'text-yellow-600')}`}>
              {activePowerUp === 'shield' ? '🛡️' : activePowerUp === 'magnet' ? '🧲' : '🐌'} {powerUpTimer}s
            </span>
          )}
        </div>

        <div className={`relative aspect-[2/1] ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl overflow-hidden`}>
          {/* Ground line */}
          <div className={`absolute bottom-0 left-0 right-0 h-[10%] ${t(theme, 'bg-gray-800', 'bg-gray-200')}`} />

          {/* Obstacles */}
          {obstacles.map((o, i) => (
            <div key={`o${i}`} className={`absolute ${o.type === 'low' ? 'bg-red-600' : o.type === 'high' ? 'bg-orange-600' : 'bg-purple-600'}`} style={{
              left: `${(o.x / 20) * 100}%`, top: `${(o.y / 10) * 100}%`,
              width: '5%', height: o.type === 'full' ? '30%' : '20%'
            }} />
          ))}

          {/* Coins */}
          {coins.map((c, i) => (
            <div key={`c${i}`} className="absolute w-[3%] h-[3%] bg-yellow-400 rounded-full animate-pulse" style={{
              left: `${(c.x / 20) * 100}%`, top: `${(c.y / 10) * 100}%`
            }} />
          ))}

          {/* Power-ups */}
          {powerUps.map((p, i) => (
            <div key={`p${i}`} className="absolute w-[4%] h-[4%] rounded-full flex items-center justify-center text-xs" style={{
              left: `${(p.x / 20) * 100}%`, top: `${(p.y / 10) * 100}%`,
              backgroundColor: p.type === 'shield' ? '#3b82f6' : p.type === 'magnet' ? '#a855f7' : '#22c55e'
            }}>
              {p.type === 'shield' ? '🛡️' : p.type === 'magnet' ? '🧲' : '🐌'}
            </div>
          ))}

          {/* Snake */}
          <div className={`absolute w-[5%] h-[10%] rounded-sm ${activePowerUp === 'shield' ? 'bg-blue-400' : 'bg-green-500'}`} style={{
            left: '15%', top: `${(snakeY / 10) * 100}%`,
            transition: 'top 0.05s linear'
          }} />

          {!started && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-white text-sm mb-3">Space/↑ to jump | Avoid obstacles!</div>
              <button onClick={() => { audioManager.playClickSound(); setStarted(true); }} className="px-6 py-3 bg-white text-black font-bold rounded-xl">▶ Start Running</button>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white mb-2">Game Over!</div>
              <div className="text-white mb-1">Score: {score}</div>
              <div className="text-white mb-3">Distance: {distance}m</div>
              {score > highScore && <div className="text-yellow-400 font-bold mb-3">🏆 New High Score!</div>}
              <button onClick={restart} className="px-6 py-3 bg-white text-black font-bold rounded-xl">↺ Run Again</button>
            </div>
          )}
        </div>

        {/* Jump Button */}
        <div className="mt-3 flex justify-center">
          <button onClick={jump} className={`w-32 h-16 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-xl font-bold active:scale-95 transition-transform`}>
            ⬆️ JUMP
          </button>
        </div>

        <div className={`mt-2 text-center text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
          Press Space or ↑ to jump | Collect coins and power-ups!
        </div>
      </div>
    </div>
  );
}

// ============ SNAKE BATTLE GAME ============
// Battle against AI snakes
export function SnakeBattleGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [player, setPlayer] = useState<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [enemies, setEnemies] = useState<{ path: Position[]; color: string; dir: Direction }[]>([]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [dir, setDir] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const dirRef = useRef<Direction>('RIGHT');
  const playerRef = useRef(player);

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { playerRef.current = player; }, [player]);

  // Initialize enemies
  useEffect(() => {
    if (started && enemies.length === 0) {
      setEnemies([
        { path: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }], color: '#ef4444', dir: 'RIGHT' },
        { path: [{ x: 15, y: 5 }, { x: 14, y: 5 }, { x: 13, y: 5 }], color: '#3b82f6', dir: 'LEFT' },
        { path: [{ x: 5, y: 15 }, { x: 4, y: 15 }, { x: 3, y: 15 }], color: '#a855f7', dir: 'UP' },
      ]);
    }
  }, [started, enemies.length]);

  const spawnFood = useCallback(() => {
    let f: Position;
    const allSnakes = [player, ...enemies.map(e => e.path)];
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (allSnakes.some(s => s.some(seg => seg.x === f.x && seg.y === f.y)));
    return f;
  }, [player, enemies]);

  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      // Move player
      setPlayer(prev => {
        const head = prev[0];
        const d = dirRef.current;
        const newHead = { ...head };
        if (d === 'UP') newHead.y--;
        else if (d === 'DOWN') newHead.y++;
        else if (d === 'LEFT') newHead.x--;
        else newHead.x++;

        if (newHead.x < 0) newHead.x = GRID - 1;
        if (newHead.x >= GRID) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID - 1;
        if (newHead.y >= GRID) newHead.y = 0;

        // Self collision
        if (prev.slice(1).some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          audioManager.playGameOverSound();
          return prev;
        }

        // Enemy collision
        if (enemies.some(e => e.path.some(s => s.x === newHead.x && s.y === newHead.y))) {
          setGameOver(true);
          audioManager.playGameOverSound();
          return prev;
        }

        const newPlayer = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          audioManager.playEatSound();
          setScore(s => s + 10);
          setFood(spawnFood());
        } else {
          newPlayer.pop();
        }
        return newPlayer;
      });

      // Move enemies (simple AI)
      setEnemies(prev => prev.map(enemy => {
        const head = enemy.path[0];
        const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        const opp: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        
        // Try to move toward food
        let bestDir = enemy.dir;
        let bestDist = Infinity;
        
        for (const d of dirs) {
          if (d === opp[enemy.dir]) continue;
          const newHead = { ...head };
          if (d === 'UP') newHead.y--;
          else if (d === 'DOWN') newHead.y++;
          else if (d === 'LEFT') newHead.x--;
          else newHead.x++;

          if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) continue;
          
          const dist = Math.abs(newHead.x - food.x) + Math.abs(newHead.y - food.y);
          if (dist < bestDist) {
            bestDist = dist;
            bestDir = d;
          }
        }

        const newHead = { ...head };
        if (bestDir === 'UP') newHead.y--;
        else if (bestDir === 'DOWN') newHead.y++;
        else if (bestDir === 'LEFT') newHead.x--;
        else newHead.x++;

        if (newHead.x < 0) newHead.x = GRID - 1;
        if (newHead.x >= GRID) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID - 1;
        if (newHead.y >= GRID) newHead.y = 0;

        const newPath = [newHead, ...enemy.path];
        if (newPath.length > 5) newPath.pop();
        return { ...enemy, path: newPath, dir: bestDir };
      }));
    }, 200);
    return () => clearInterval(interval);
  }, [started, gameOver, food, spawnFood, enemies]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT' };
      const newDir = map[e.key];
      if (newDir) {
        const opp: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (opp[newDir] !== dirRef.current) {
          setDir(newDir);
          dirRef.current = newDir;
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const restart = () => {
    setPlayer([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setEnemies([]);
    setFood({ x: 15, y: 15 });
    setDir('RIGHT');
    dirRef.current = 'RIGHT';
    setScore(0);
    setGameOver(false);
    setStarted(true);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>⚔️ Snake Battle</h2>
          <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>🪙 {score}</div>
        </div>

        <div className={`relative aspect-square ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl overflow-hidden`}>
          {/* Food */}
          <div className="absolute w-[5%] h-[5%] bg-red-500 rounded-full animate-pulse" style={{ left: `${(food.x / GRID) * 100}%`, top: `${(food.y / GRID) * 100}%` }} />
          
          {/* Enemies */}
          {enemies.map((enemy, ei) => (
            enemy.path.map((seg, si) => (
              <div key={`e${ei}-${si}`} className="absolute rounded-sm" style={{
                left: `${(seg.x / GRID) * 100}%`, top: `${(seg.y / GRID) * 100}%`,
                width: `${100 / GRID}%`, height: `${100 / GRID}%`, padding: '1px'
              }}>
                <div className="w-full h-full rounded-sm" style={{ backgroundColor: enemy.color, opacity: 1 - si * 0.15 }} />
              </div>
            ))
          ))}

          {/* Player */}
          {player.map((seg, i) => (
            <div key={`p${i}`} className="absolute rounded-sm" style={{
              left: `${(seg.x / GRID) * 100}%`, top: `${(seg.y / GRID) * 100}%`,
              width: `${100 / GRID}%`, height: `${100 / GRID}%`, padding: '1px', zIndex: 10
            }}>
              <div className="w-full h-full rounded-sm" style={{ backgroundColor: i === 0 ? '#22c55e' : '#16a34a' }} />
            </div>
          ))}

          {!started && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <button onClick={() => { audioManager.playClickSound(); setStarted(true); }} className="px-6 py-3 bg-white text-black font-bold rounded-xl">▶ Start Battle</button>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white mb-2">Defeated!</div>
              <div className="text-white mb-3">Score: {score}</div>
              <button onClick={restart} className="px-6 py-3 bg-white text-black font-bold rounded-xl">↺ Fight Again</button>
            </div>
          )}
        </div>

        {/* Touch Controls */}
        <div className="mt-3 grid grid-cols-3 gap-2 w-40 h-40 mx-auto">
          <div />
          <button onClick={() => { if (dirRef.current !== 'DOWN') { setDir('UP'); dirRef.current = 'UP'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▲</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'RIGHT') { setDir('LEFT'); dirRef.current = 'LEFT'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>◀</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'LEFT') { setDir('RIGHT'); dirRef.current = 'RIGHT'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▶</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'UP') { setDir('DOWN'); dirRef.current = 'DOWN'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▼</button>
          <div />
        </div>
      </div>
    </div>
  );
}

// ============ SNAKE MAZE GAME ============
// Navigate through procedurally generated mazes
export function SnakeMazeGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [snake, setSnake] = useState<Position[]>([{ x: 1, y: 1 }, { x: 0, y: 1 }]);
  const [maze, setMaze] = useState<boolean[][]>([]);
  const [exit, setExit] = useState<Position>({ x: GRID - 2, y: GRID - 2 });
  const [dir, setDir] = useState<Direction>('RIGHT');
  const [level, setLevel] = useState(1);
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [time, setTime] = useState(0);
  const dirRef = useRef<Direction>('RIGHT');

  useEffect(() => { dirRef.current = dir; }, [dir]);

  const generateMaze = useCallback((lvl: number) => {
    // Create maze grid
    const newMaze: boolean[][] = Array(GRID).fill(null).map(() => Array(GRID).fill(false));
    
    // Border walls
    for (let i = 0; i < GRID; i++) {
      newMaze[0][i] = true;
      newMaze[GRID - 1][i] = true;
      newMaze[i][0] = true;
      newMaze[i][GRID - 1] = true;
    }
    
    // Add internal walls based on level
    const wallCount = 20 + lvl * 10;
    for (let i = 0; i < wallCount; i++) {
      const x = Math.floor(Math.random() * (GRID - 2)) + 1;
      const y = Math.floor(Math.random() * (GRID - 2)) + 1;
      const horizontal = Math.random() > 0.5;
      const length = Math.floor(Math.random() * 4) + 2;
      
      for (let j = 0; j < length; j++) {
        const wx = horizontal ? Math.min(x + j, GRID - 2) : x;
        const wy = horizontal ? y : Math.min(y + j, GRID - 2);
        if (wx > 0 && wx < GRID - 1 && wy > 0 && wy < GRID - 1) {
          if (!(wx === 1 && wy === 1) && !(wx === GRID - 2 && wy === GRID - 2)) {
            newMaze[wy][wx] = true;
          }
        }
      }
    }
    
    // Ensure start and exit are clear
    newMaze[1][1] = false;
    newMaze[1][2] = false;
    newMaze[2][1] = false;
    newMaze[GRID - 2][GRID - 2] = false;
    newMaze[GRID - 3][GRID - 2] = false;
    newMaze[GRID - 2][GRID - 3] = false;
    
    setMaze(newMaze);
    setSnake([{ x: 1, y: 1 }, { x: 0, y: 1 }]);
    setExit({ x: GRID - 2, y: GRID - 2 });
    setDir('RIGHT');
    dirRef.current = 'RIGHT';
    setWon(false);
    setGameOver(false);
    setTime(0);
  }, []);

  useEffect(() => { generateMaze(level); }, [level, generateMaze]);

  // Timer
  useEffect(() => {
    if (!started || won || gameOver) return;
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, won, gameOver]);

  useEffect(() => {
    if (!started || won || gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = prev[0];
        const d = dirRef.current;
        const newHead = { ...head };
        if (d === 'UP') newHead.y--;
        else if (d === 'DOWN') newHead.y++;
        else if (d === 'LEFT') newHead.x--;
        else newHead.x++;

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID || maze[newHead.y]?.[newHead.x]) {
          setGameOver(true);
          audioManager.playGameOverSound();
          return prev;
        }

        // Check self collision
        if (prev.some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          audioManager.playGameOverSound();
          return prev;
        }

        const newSnake = [newHead, ...prev];
        
        // Check exit
        if (newHead.x === exit.x && newHead.y === exit.y) {
          setWon(true);
          audioManager.playSuccessSound();
          return newSnake;
        }
        
        newSnake.pop();
        return newSnake;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [started, won, gameOver, maze, exit]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = { ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT' };
      const newDir = map[e.key];
      if (newDir) {
        const opp: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (opp[newDir] !== dirRef.current) {
          setDir(newDir);
          dirRef.current = newDir;
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const nextLevel = () => {
    setLevel(l => l + 1);
    setStarted(false);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>🌀 Snake Maze</h2>
          <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>Lv.{level} | {time}s</div>
        </div>

        <div className={`relative aspect-square ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl overflow-hidden`}>
          {/* Maze walls */}
          {maze.map((row, y) => row.map((wall, x) => wall ? (
            <div key={`w${x}-${y}`} className="absolute bg-gray-600" style={{
              left: `${(x / GRID) * 100}%`, top: `${(y / GRID) * 100}%`,
              width: `${100 / GRID}%`, height: `${100 / GRID}%`
            }} />
          ) : null))}
          
          {/* Exit */}
          <div className="absolute bg-green-500 animate-pulse" style={{
            left: `${(exit.x / GRID) * 100}%`, top: `${(exit.y / GRID) * 100}%`,
            width: `${100 / GRID}%`, height: `${100 / GRID}%`
          }}>
            <div className="w-full h-full flex items-center justify-center text-xs">🏁</div>
          </div>
          
          {/* Snake */}
          {snake.map((s, i) => (
            <div key={`s${i}`} className="absolute rounded-sm" style={{
              left: `${(s.x / GRID) * 100}%`, top: `${(s.y / GRID) * 100}%`,
              width: `${100 / GRID}%`, height: `${100 / GRID}%`, padding: '1px', zIndex: 10
            }}>
              <div className="w-full h-full rounded-sm" style={{ backgroundColor: i === 0 ? '#22c55e' : '#16a34a' }} />
            </div>
          ))}

          {!started && !won && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <button onClick={() => { audioManager.playClickSound(); setStarted(true); }} className="px-6 py-3 bg-white text-black font-bold rounded-xl">▶ Start</button>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white mb-2">Stuck!</div>
              <button onClick={() => generateMaze(level)} className="px-6 py-3 bg-white text-black font-bold rounded-xl mb-2">↺ Retry</button>
            </div>
          )}
          {won && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-green-400 mb-2">🎉 Maze Complete!</div>
              <div className="text-white mb-3">Time: {time}s</div>
              <button onClick={nextLevel} className="px-6 py-3 bg-white text-black font-bold rounded-xl">Next Level →</button>
            </div>
          )}
        </div>

        {/* Touch Controls */}
        <div className="mt-3 grid grid-cols-3 gap-2 w-40 h-40 mx-auto">
          <div />
          <button onClick={() => { if (dirRef.current !== 'DOWN') { setDir('UP'); dirRef.current = 'UP'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▲</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'RIGHT') { setDir('LEFT'); dirRef.current = 'LEFT'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>◀</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'LEFT') { setDir('RIGHT'); dirRef.current = 'RIGHT'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▶</button>
          <div />
          <button onClick={() => { if (dirRef.current !== 'UP') { setDir('DOWN'); dirRef.current = 'DOWN'; } }} className={`${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▼</button>
          <div />
        </div>
      </div>
    </div>
  );
}
