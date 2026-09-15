import { useState, useEffect, useCallback, useRef } from 'react';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
type Difficulty = 'easy' | 'medium' | 'hard';

const GRID_SIZE = 20;
const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  easy: 180,
  medium: 120,
  hard: 70,
};

const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

function getRandomFood(snake: Position[]): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
  return food;
}

function App() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(() => getRandomFood(INITIAL_SNAKE));
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snake-high-score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [showControls, setShowControls] = useState(false);
  const [ateFood, setAteFood] = useState(false);

  const directionRef = useRef<Direction>('RIGHT');
  const gameStateRef = useRef<GameState>('IDLE');
  const snakeRef = useRef<Position[]>(INITIAL_SNAKE);
  const foodRef = useRef<Position>(food);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastMoveTimeRef = useRef<number>(0);

  // Detect mobile
  useEffect(() => {
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) 
      || window.innerWidth < 768;
    setShowControls(isMobile);
  }, []);

  // Sync refs
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    snakeRef.current = snake;
  }, [snake]);

  useEffect(() => {
    foodRef.current = food;
  }, [food]);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snake-high-score', score.toString());
    }
  }, [score, highScore]);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    snakeRef.current = INITIAL_SNAKE;
    const newFood = getRandomFood(INITIAL_SNAKE);
    setFood(newFood);
    foodRef.current = newFood;
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setGameState('IDLE');
    setAteFood(false);
  }, []);

  const startGame = useCallback(() => {
    if (gameState === 'GAME_OVER' || gameState === 'IDLE') {
      setSnake(INITIAL_SNAKE);
      snakeRef.current = INITIAL_SNAKE;
      const newFood = getRandomFood(INITIAL_SNAKE);
      setFood(newFood);
      foodRef.current = newFood;
      setDirection('RIGHT');
      directionRef.current = 'RIGHT';
      setScore(0);
      setAteFood(false);
      setTimeout(() => setGameState('PLAYING'), 50);
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  }, [gameState]);

  const togglePause = useCallback(() => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  }, [gameState]);

  const changeDirection = useCallback((newDir: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN',
      DOWN: 'UP',
      LEFT: 'RIGHT',
      RIGHT: 'LEFT',
    };
    if (opposites[newDir] !== directionRef.current) {
      setDirection(newDir);
      directionRef.current = newDir;
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'IDLE' || gameStateRef.current === 'GAME_OVER') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          startGame();
          return;
        }
      }

      if (e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        togglePause();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetGame();
        return;
      }

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'UP',
        ArrowDown: 'DOWN',
        ArrowLeft: 'LEFT',
        ArrowRight: 'RIGHT',
        w: 'UP',
        W: 'UP',
        s: 'DOWN',
        S: 'DOWN',
        a: 'LEFT',
        A: 'LEFT',
        d: 'RIGHT',
        D: 'RIGHT',
      };

      const newDir = keyMap[e.key];
      if (newDir && gameStateRef.current === 'PLAYING') {
        e.preventDefault();
        changeDirection(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, startGame, togglePause, resetGame]);

  // Touch controls (swipe)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      if (gameStateRef.current !== 'PLAYING') return;
      
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const minSwipe = 30;

      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        changeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
      touchStartRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [changeDirection]);

  // Game loop using setInterval for consistent timing
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      return;
    }

    const speed = DIFFICULTY_SPEEDS[difficulty];

    const interval = setInterval(() => {
      if (gameStateRef.current !== 'PLAYING') return;

      const currentSnake = snakeRef.current;
      const currentFood = foodRef.current;
      const head = currentSnake[0];
      const dir = directionRef.current;
      let newHead: Position;

      switch (dir) {
        case 'UP':
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case 'DOWN':
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case 'LEFT':
          newHead = { x: head.x - 1, y: head.y };
          break;
        case 'RIGHT':
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setGameState('GAME_OVER');
        return;
      }

      // Check self collision (exclude tail since it will move)
      const willEat = newHead.x === currentFood.x && newHead.y === currentFood.y;
      const bodyToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
      if (bodyToCheck.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setGameState('GAME_OVER');
        return;
      }

      // Move snake
      const newSnake = [newHead, ...currentSnake];
      
      if (willEat) {
        // Don't remove tail - snake grows
        setScore(s => s + 10);
        const nextFood = getRandomFood(newSnake);
        setFood(nextFood);
        foodRef.current = nextFood;
        setAteFood(true);
        setTimeout(() => setAteFood(false), 300);
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
      snakeRef.current = newSnake;
    }, speed);

    return () => clearInterval(interval);
  }, [gameState, difficulty]);

  const getSegmentStyle = (index: number, total: number) => {
    const ratio = index / Math.max(total - 1, 1);
    const opacity = 1 - ratio * 0.5;
    if (index === 0) {
      return {
        backgroundColor: `rgba(74, 222, 128, ${opacity})`,
        boxShadow: '0 0 10px rgba(74, 222, 128, 0.7)',
        borderRadius: '5px',
        transform: 'scale(1.05)',
      };
    }
    return {
      backgroundColor: `rgba(34, 197, 94, ${opacity})`,
      borderRadius: '4px',
      transform: `scale(${1 - ratio * 0.15})`,
    };
  };

  const getHeadEyes = () => {
    switch (direction) {
      case 'UP':
        return (
          <div className="absolute inset-0 flex justify-around items-start pt-[15%]">
            <div className="w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-gray-900 rounded-full" />
            </div>
            <div className="w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-gray-900 rounded-full" />
            </div>
          </div>
        );
      case 'DOWN':
        return (
          <div className="absolute inset-0 flex justify-around items-end pb-[15%]">
            <div className="w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-gray-900 rounded-full" />
            </div>
            <div className="w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-gray-900 rounded-full" />
            </div>
          </div>
        );
      case 'LEFT':
        return (
          <div className="absolute inset-0 flex flex-col justify-around items-start pl-[15%]">
            <div className="w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-gray-900 rounded-full" />
            </div>
            <div className="w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-gray-900 rounded-full" />
            </div>
          </div>
        );
      case 'RIGHT':
        return (
          <div className="absolute inset-0 flex flex-col justify-around items-end pr-[15%]">
            <div className="w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-gray-900 rounded-full" />
            </div>
            <div className="w-[20%] h-[20%] bg-white rounded-full flex items-center justify-center">
              <div className="w-[50%] h-[50%] bg-gray-900 rounded-full" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex flex-col items-center justify-center p-3 md:p-4 select-none overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-md md:max-w-lg mb-3 md:mb-4">
        <h1 className="text-2xl md:text-4xl font-bold text-center text-green-400 mb-2 tracking-wider drop-shadow-lg">
          🐍 SNAKE
        </h1>
        
        {/* Score Panel */}
        <div className="flex justify-between items-center bg-gray-800/80 backdrop-blur-sm rounded-xl px-4 py-2.5 md:py-3 border border-gray-700/50 shadow-lg">
          <div className="text-center flex-1">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">Score</div>
            <div className={`text-xl md:text-2xl font-bold text-white transition-all duration-200 ${ateFood ? 'scale-125 text-green-400' : ''}`}>
              {score}
            </div>
          </div>
          <div className="text-center flex-1 border-x border-gray-700/50">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">Best</div>
            <div className="text-xl md:text-2xl font-bold text-yellow-400">
              {highScore}
            </div>
          </div>
          <div className="text-center flex-1">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wide">Length</div>
            <div className="text-xl md:text-2xl font-bold text-green-400">{snake.length}</div>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative w-full max-w-md md:max-w-lg aspect-square">
        <div className="absolute inset-0 bg-gray-900/90 rounded-2xl border-2 border-gray-700/60 overflow-hidden shadow-2xl shadow-green-900/20">
          {/* Grid background */}
          <div className="absolute inset-0 grid grid-cols-20 grid-rows-20">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isEven = (x + y) % 2 === 0;
              return (
                <div
                  key={i}
                  className={`${isEven ? 'bg-gray-800/40' : 'bg-gray-800/20'}`}
                />
              );
            })}
          </div>

          {/* Food */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: `${(food.x / GRID_SIZE) * 100}%`,
              top: `${(food.y / GRID_SIZE) * 100}%`,
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              transition: 'left 0.1s, top 0.1s',
            }}
          >
            <div className="w-[75%] h-[75%] bg-red-500 rounded-full shadow-lg shadow-red-500/60 animate-bounce-subtle" />
          </div>

          {/* Snake */}
          {snake.map((segment, index) => (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className="absolute"
              style={{
                left: `${(segment.x / GRID_SIZE) * 100}%`,
                top: `${(segment.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                padding: '1px',
                zIndex: snake.length - index,
                transition: 'left 0.08s linear, top 0.08s linear',
              }}
            >
              <div
                className="w-full h-full relative transition-all duration-75"
                style={getSegmentStyle(index, snake.length)}
              >
                {index === 0 && getHeadEyes()}
              </div>
            </div>
          ))}

          {/* Overlays */}
          {gameState === 'IDLE' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in">
              <div className="text-5xl md:text-6xl mb-4 animate-bounce">🐍</div>
              <h2 className="text-lg md:text-xl font-bold text-white mb-2">Ready to Play?</h2>
              <p className="text-gray-300 text-xs md:text-sm mb-4 text-center px-6">
                Use arrow keys, WASD, or swipe to control
              </p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30"
              >
                ▶ Start Game
              </button>
              <p className="text-gray-500 text-xs mt-3">or press Space / Enter</p>
            </div>
          )}

          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in">
              <div className="text-4xl md:text-5xl mb-3">⏸️</div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Paused</h2>
              <button
                onClick={() => setGameState('PLAYING')}
                className="px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                ▶ Resume
              </button>
              <p className="text-gray-500 text-xs mt-3">or press Space</p>
            </div>
          )}

          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-50 animate-fade-in">
              <div className="text-4xl md:text-5xl mb-3">💀</div>
              <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2">Game Over!</h2>
              <p className="text-white text-base md:text-lg mb-1">
                Score: <span className="font-bold text-green-400">{score}</span>
              </p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 text-sm mb-2 animate-pulse font-medium">🏆 New High Score!</p>
              )}
              <button
                onClick={startGame}
                className="mt-3 px-6 py-3 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30"
              >
                ↺ Play Again
              </button>
              <p className="text-gray-500 text-xs mt-3">or press Space / Enter</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md md:max-w-lg mt-3 md:mt-4 space-y-2 md:space-y-3">
        {/* Difficulty & Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {/* Difficulty Selector */}
          <div className="flex bg-gray-800/80 rounded-xl border border-gray-700/50 overflow-hidden">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-2 text-[10px] md:text-xs font-medium uppercase tracking-wide transition-all duration-200 ${
                  difficulty === d
                    ? d === 'easy'
                      ? 'bg-green-600 text-white shadow-inner'
                      : d === 'medium'
                      ? 'bg-yellow-600 text-white shadow-inner'
                      : 'bg-red-600 text-white shadow-inner'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <button
            onClick={togglePause}
            disabled={gameState === 'IDLE' || gameState === 'GAME_OVER'}
            className="px-3 md:px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs md:text-sm font-medium"
          >
            {gameState === 'PAUSED' ? '▶ Resume' : '⏸ Pause'}
          </button>
          <button
            onClick={resetGame}
            className="px-3 md:px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl border border-gray-700/50 transition-all duration-200 text-xs md:text-sm font-medium"
          >
            ↺ Restart
          </button>
        </div>

        {/* Mobile D-Pad Controls */}
        {showControls && (
          <div className="flex justify-center mt-2">
            <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-36 h-36 md:w-40 md:h-40">
              <div />
              <button
                onTouchStart={(e) => { e.preventDefault(); changeDirection('UP'); }}
                onClick={() => changeDirection('UP')}
                className="bg-gray-700/80 hover:bg-gray-600 active:bg-green-600 active:scale-95 rounded-xl flex items-center justify-center text-white text-lg transition-all duration-100 border border-gray-600/50 shadow-md"
              >
                ▲
              </button>
              <div />
              <button
                onTouchStart={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
                onClick={() => changeDirection('LEFT')}
                className="bg-gray-700/80 hover:bg-gray-600 active:bg-green-600 active:scale-95 rounded-xl flex items-center justify-center text-white text-lg transition-all duration-100 border border-gray-600/50 shadow-md"
              >
                ◀
              </button>
              <div className="bg-gray-800/40 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-600 rounded-full" />
              </div>
              <button
                onTouchStart={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
                onClick={() => changeDirection('RIGHT')}
                className="bg-gray-700/80 hover:bg-gray-600 active:bg-green-600 active:scale-95 rounded-xl flex items-center justify-center text-white text-lg transition-all duration-100 border border-gray-600/50 shadow-md"
              >
                ▶
              </button>
              <div />
              <button
                onTouchStart={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
                onClick={() => changeDirection('DOWN')}
                className="bg-gray-700/80 hover:bg-gray-600 active:bg-green-600 active:scale-95 rounded-xl flex items-center justify-center text-white text-lg transition-all duration-100 border border-gray-600/50 shadow-md"
              >
                ▼
              </button>
              <div />
            </div>
          </div>
        )}

        {/* Keyboard hints - desktop only */}
        <div className="text-center text-gray-500 text-[10px] md:text-xs hidden md:block">
          <span className="inline-flex gap-1 items-center flex-wrap justify-center">
            <kbd className="px-1.5 py-0.5 bg-gray-700/80 rounded text-gray-300 border border-gray-600/50">↑↓←→</kbd>
            <span>or</span>
            <kbd className="px-1.5 py-0.5 bg-gray-700/80 rounded text-gray-300 border border-gray-600/50">WASD</kbd>
            <span>Move</span>
            <span className="mx-1">•</span>
            <kbd className="px-1.5 py-0.5 bg-gray-700/80 rounded text-gray-300 border border-gray-600/50">Space</kbd>
            <span>Pause</span>
            <span className="mx-1">•</span>
            <kbd className="px-1.5 py-0.5 bg-gray-700/80 rounded text-gray-300 border border-gray-600/50">R</kbd>
            <span>Restart</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
