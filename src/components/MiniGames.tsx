import { useState, useEffect, useCallback, useRef } from 'react';
import { Theme, Position, Direction } from '../types';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;
const GRID = 20;

// ============ SNAKE LEADER GAME ============
// Lead your snake army - followers follow the leader
export function SnakeLeaderGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [leader, setLeader] = useState<Position[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [followers, setFollowers] = useState<Position[][]>([]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [dir, setDir] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const dirRef = useRef<Direction>('RIGHT');
  const leaderRef = useRef(leader);
  const followersRef = useRef(followers);

  useEffect(() => { dirRef.current = dir; }, [dir]);
  useEffect(() => { leaderRef.current = leader; }, [leader]);
  useEffect(() => { followersRef.current = followers; }, [followers]);

  const spawnFood = useCallback((snake: Position[]) => {
    let f: Position;
    do {
      f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snake.some(s => s.x === f.x && s.y === f.y));
    return f;
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      setLeader(prev => {
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

        if (prev.slice(1).some(s => s.x === newHead.x && s.y === newHead.y)) {
          setGameOver(true);
          audioManager.playGameOverSound();
          return prev;
        }

        const newLeader = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          audioManager.playEatSound();
          setScore(s => s + 10);
          setFood(spawnFood(newLeader));
          // Every 50 points, add a follower
          const newScore = score + 10;
          if (newScore % 50 === 0) {
            const lastTail = newLeader[newLeader.length - 1];
            const newFollower: Position[] = [
              { x: lastTail.x, y: lastTail.y },
              { x: lastTail.x - 1, y: lastTail.y },
              { x: lastTail.x - 2, y: lastTail.y },
            ];
            setFollowers(prev => [...prev, newFollower]);
          }
        } else {
          newLeader.pop();
        }
        return newLeader;
      });

      // Move followers - they follow the leader's path
      setFollowers(prev => {
        if (prev.length === 0) return prev;
        const currentLeader = leaderRef.current;
        return prev.map((follower, idx) => {
          // Each follower follows the leader's tail with offset
          const offset = (idx + 1) * 4;
          const newPath: Position[] = [];
          for (let i = 0; i < follower.length; i++) {
            const leaderIdx = Math.min(offset + i, currentLeader.length - 1);
            if (leaderIdx < currentLeader.length) {
              newPath.push({ ...currentLeader[leaderIdx] });
            }
          }
          return newPath.length >= 2 ? newPath : follower;
        });
      });
    }, 150);
    return () => clearInterval(interval);
  }, [started, gameOver, food, spawnFood, score]);

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
    setLeader([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    setFollowers([]);
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
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>👑 Snake Leader</h2>
          <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>🪙 {score}</div>
        </div>

        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-2 mb-3`}>
          <div className="text-center text-xs font-bold mb-1">Army: {followers.length} followers</div>
          <div className={`text-center text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Eat 50 points to gain a follower!</div>
        </div>

        <div className={`relative aspect-square ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl overflow-hidden`}>
          {/* Food */}
          <div className="absolute w-[5%] h-[5%] bg-red-500 rounded-full animate-pulse" style={{ left: `${(food.x / GRID) * 100}%`, top: `${(food.y / GRID) * 100}%` }} />
          
          {/* Followers */}
          {followers.map((follower, fi) => (
            follower.map((seg, si) => (
              <div key={`f${fi}-${si}`} className="absolute rounded-sm" style={{
                left: `${(seg.x / GRID) * 100}%`, top: `${(seg.y / GRID) * 100}%`,
                width: `${100 / GRID}%`, height: `${100 / GRID}%`, padding: '1px'
              }}>
                <div className="w-full h-full rounded-sm" style={{ backgroundColor: `hsl(${200 + fi * 40}, 70%, ${50 - si * 2}%)` }} />
              </div>
            ))
          ))}

          {/* Leader */}
          {leader.map((seg, i) => (
            <div key={`l${i}`} className="absolute rounded-sm" style={{
              left: `${(seg.x / GRID) * 100}%`, top: `${(seg.y / GRID) * 100}%`,
              width: `${100 / GRID}%`, height: `${100 / GRID}%`, padding: '1px', zIndex: 10
            }}>
              <div className="w-full h-full rounded-sm" style={{ backgroundColor: i === 0 ? '#fbbf24' : '#f59e0b' }} />
            </div>
          ))}

          {!started && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <button onClick={() => { audioManager.playClickSound(); setStarted(true); }} className="px-6 py-3 bg-white text-black font-bold rounded-xl">▶ Start</button>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white mb-2">Game Over!</div>
              <div className="text-white mb-3">Score: {score} | Army: {followers.length}</div>
              <button onClick={restart} className="px-6 py-3 bg-white text-black font-bold rounded-xl">↺ Play Again</button>
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

// ============ LUDO MASTER GAME ============
// Simplified 4-player dice game
export function LudoMasterGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [dice, setDice] = useState(1);
  const [rolling, setRolling] = useState(false);
  const [positions, setPositions] = useState<number[][]>([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  const [winner, setWinner] = useState<number | null>(null);
  const [message, setMessage] = useState('Roll the dice!');
  const playerColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];
  const playerNames = ['Red', 'Blue', 'Green', 'Yellow'];

  const rollDice = () => {
    if (rolling || winner !== null) return;
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
        
        // Move a token
        const newPositions = positions.map(p => [...p]);
        const playerTokens = newPositions[currentPlayer];
        const movableToken = playerTokens.findIndex(t => t + finalDice <= 57 && t >= 0);
        
        if (movableToken !== -1) {
          playerTokens[movableToken] += finalDice;
          if (playerTokens[movableToken] === 57) {
            setMessage(`${playerNames[currentPlayer]} token reached home!`);
            if (playerTokens.every(t => t === 57)) {
              setWinner(currentPlayer);
              setMessage(`${playerNames[currentPlayer]} wins!`);
              audioManager.playSuccessSound();
            }
          } else {
            setMessage(`${playerNames[currentPlayer]} moved ${finalDice} steps`);
          }
        } else {
          setMessage(`No valid moves for ${playerNames[currentPlayer]}`);
        }
        
        setPositions(newPositions);
        if (finalDice !== 6 && winner === null) {
          setTimeout(() => setCurrentPlayer((currentPlayer + 1) % 4), 1000);
        }
      }
    }, 80);
  };

  const restart = () => {
    setCurrentPlayer(0);
    setDice(1);
    setPositions([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
    setWinner(null);
    setMessage('Roll the dice!');
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>🎲 Ludo Master</h2>
          <div className="w-16" />
        </div>

        {/* Board */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4 mb-3`}>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {playerColors.map((color, i) => (
              <div key={i} className={`text-center p-2 rounded-lg border-2 ${currentPlayer === i ? 'opacity-100' : 'opacity-50'}`} style={{ borderColor: color }}>
                <div className="text-xs font-bold" style={{ color }}>{playerNames[i]}</div>
                <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{positions[i].filter(p => p === 57).length}/4</div>
              </div>
            ))}
          </div>

          {/* Dice */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl flex items-center justify-center text-4xl font-black ${t(theme, 'text-white', 'text-black')} ${rolling ? 'animate-bounce' : ''}`}>
              {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][dice - 1]}
            </div>
          </div>

          {/* Message */}
          <div className={`text-center text-sm font-bold mb-3 ${t(theme, 'text-white', 'text-black')}`} style={{ color: playerColors[currentPlayer] }}>
            {message}
          </div>

          {/* Roll Button */}
          {!winner && (
            <button onClick={rollDice} disabled={rolling} className={`w-full py-3 font-bold rounded-xl border-2 ${t(theme, 'bg-black text-white border-white hover:bg-gray-900', 'bg-white text-black border-black hover:bg-gray-100')} disabled:opacity-50`}>
              {rolling ? '🎲 Rolling...' : `🎲 ${playerNames[currentPlayer]}'s Turn - Roll!`}
            </button>
          )}

          {winner !== null && (
            <div className="text-center">
              <div className="text-2xl font-black mb-3" style={{ color: playerColors[winner] }}>🏆 {playerNames[winner]} Wins!</div>
              <button onClick={restart} className={`px-6 py-3 font-bold rounded-xl border-2 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')}`}>Play Again</button>
            </div>
          )}

          {/* Token positions visualization */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {playerColors.map((color, pi) => (
              <div key={pi} className="space-y-1">
                {positions[pi].map((pos, ti) => (
                  <div key={ti} className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>{pos === 57 ? '🏠' : pos === 0 ? 'Start' : `${pos}/57`}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ SNAKE PUZZLE GAME ============
// Guide snake to eat all food without hitting walls
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
  const dirRef = useRef<Direction>('RIGHT');

  const generateLevel = useCallback((lvl: number) => {
    const newWalls: Position[] = [];
    const newFoods: Position[] = [];
    
    // Add walls based on level
    const wallCount = lvl * 3 + 5;
    for (let i = 0; i < wallCount; i++) {
      const w = { x: Math.floor(Math.random() * (GRID - 4)) + 2, y: Math.floor(Math.random() * (GRID - 4)) + 2 };
      if (!newWalls.some(ww => ww.x === w.x && ww.y === w.y) && !(w.x === 1 && w.y === 1)) {
        newWalls.push(w);
      }
    }
    
    // Add foods
    const foodCount = 3 + lvl;
    for (let i = 0; i < foodCount; i++) {
      let f: Position;
      do {
        f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
      } while (
        newWalls.some(w => w.x === f.x && w.y === f.y) ||
        newFoods.some(ff => ff.x === f.x && ff.y === f.y) ||
        (f.x === 1 && f.y === 1)
      );
      newFoods.push(f);
    }
    
    setWalls(newWalls);
    setFoods(newFoods);
    setSnake([{ x: 1, y: 1 }]);
    setDir('RIGHT');
    dirRef.current = 'RIGHT';
    setMoves(0);
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => { generateLevel(level); }, [level, generateLevel]);

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
    setLevel(l => l + 1);
    setStarted(false);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>🧩 Snake Puzzle</h2>
          <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>Lv.{level}</div>
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
            <div key={`f${i}`} className="absolute w-[80%] h-[80%] bg-red-500 rounded-full" style={{ left: `${(f.x / GRID) * 100 + 10}%`, top: `${(f.y / GRID) * 100 + 10}%` }} />
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
              <button onClick={() => generateLevel(level)} className="px-6 py-3 bg-white text-black font-bold rounded-xl mb-2">↺ Retry</button>
            </div>
          )}
          {won && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-green-400 mb-2">🎉 Level Complete!</div>
              <div className="text-white mb-3">Moves: {moves}</div>
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

// ============ SNAKE RUNNER GAME ============
// Auto-running snake, avoid obstacles
export function SnakeRunnerGame({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const [snakeY, setSnakeY] = useState(10);
  const [obstacles, setObstacles] = useState<{ x: number; y: number; h: number }[]>([]);
  const [foods, setFoods] = useState<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const snakeYRef = useRef(10);

  useEffect(() => { snakeYRef.current = snakeY; }, [snakeY]);

  useEffect(() => {
    if (!started || gameOver) return;
    const interval = setInterval(() => {
      // Move obstacles and food left
      setObstacles(prev => {
        const moved = prev.map(o => ({ ...o, x: o.x - 1 })).filter(o => o.x > -3);
        // Spawn new obstacles
        if (Math.random() < 0.15) {
          const h = Math.floor(Math.random() * 8) + 3;
          const y = Math.floor(Math.random() * (GRID - h));
          moved.push({ x: GRID, y, h });
        }
        return moved;
      });

      setFoods(prev => {
        const moved = prev.map(f => ({ x: f.x - 1, y: f.y })).filter(f => f.x > -1);
        if (Math.random() < 0.1) {
          moved.push({ x: GRID, y: Math.floor(Math.random() * GRID) });
        }
        return moved;
      });

      // Check collisions
      const currentY = snakeYRef.current;
      if (obstacles.some(o => o.x <= 3 && o.x >= 1 && currentY >= o.y && currentY < o.y + o.h)) {
        setGameOver(true);
        audioManager.playGameOverSound();
        return;
      }

      // Check food collection
      setFoods(prev => {
        const remaining = prev.filter(f => !(f.x <= 3 && f.x >= 1 && f.y === currentY));
        if (remaining.length < prev.length) {
          audioManager.playEatSound();
          setScore(s => s + 10);
        }
        return remaining;
      });

      setScore(s => s + 1);
      setSpeed(sp => Math.min(sp + 0.05, 15));
    }, 1000 / speed);
    return () => clearInterval(interval);
  }, [started, gameOver, speed, obstacles]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        setSnakeY(y => Math.max(0, y - 1));
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        setSnakeY(y => Math.min(GRID - 1, y + 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const restart = () => {
    setSnakeY(10);
    setObstacles([]);
    setFoods([]);
    setScore(0);
    setSpeed(5);
    setGameOver(false);
    setStarted(true);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4 flex flex-col items-center`}>
      <div className="w-full max-w-lg">
        <div className="flex justify-between items-center mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg text-sm font-bold`}>← Back</button>
          <h2 className={`text-xl font-black ${t(theme, 'text-white', 'text-black')}`}>🏃 Snake Runner</h2>
          <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')}`}>🪙 {score}</div>
        </div>

        <div className={`relative aspect-[2/1] ${t(theme, 'bg-gray-900 border-white', 'bg-gray-100 border-black')} border-2 rounded-xl overflow-hidden`}>
          {/* Obstacles */}
          {obstacles.map((o, i) => (
            <div key={`o${i}`} className="absolute bg-red-600" style={{
              left: `${(o.x / GRID) * 100}%`, top: `${(o.y / GRID) * 100}%`,
              width: `${100 / GRID}%`, height: `${(o.h / GRID) * 100}%`
            }} />
          ))}

          {/* Foods */}
          {foods.map((f, i) => (
            <div key={`f${i}`} className="absolute w-[4%] h-[4%] bg-yellow-400 rounded-full" style={{
              left: `${(f.x / GRID) * 100}%`, top: `${(f.y / GRID) * 100}%`
            }} />
          ))}

          {/* Snake */}
          <div className="absolute bg-green-500 rounded-sm" style={{
            left: `${(2 / GRID) * 100}%`, top: `${(snakeY / GRID) * 100}%`,
            width: `${100 / GRID}%`, height: `${100 / GRID}%`
          }} />

          {!started && !gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-white text-sm mb-3">↑↓ or Swipe to move</div>
              <button onClick={() => { audioManager.playClickSound(); setStarted(true); }} className="px-6 py-3 bg-white text-black font-bold rounded-xl">▶ Start</button>
            </div>
          )}
          {gameOver && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white mb-2">Game Over!</div>
              <div className="text-white mb-3">Score: {score}</div>
              <button onClick={restart} className="px-6 py-3 bg-white text-black font-bold rounded-xl">↺ Play Again</button>
            </div>
          )}
        </div>

        {/* Touch Controls */}
        <div className="mt-3 flex justify-center gap-4">
          <button onClick={() => setSnakeY(y => Math.max(0, y - 1))} className={`w-16 h-16 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▲</button>
          <button onClick={() => setSnakeY(y => Math.min(GRID - 1, y + 1))} className={`w-16 h-16 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-xl text-2xl font-bold`}>▼</button>
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
