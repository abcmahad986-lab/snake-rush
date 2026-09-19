import { useState, useEffect } from 'react';
import { Player, Theme, Difficulty } from '../types';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// Generate random room code
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

interface LobbyPlayer {
  id: string;
  name: string;
  avatar: string;
  level: number;
  isReady: boolean;
  isHost: boolean;
}

export function LobbyScreen({ 
  player, 
  onBack, 
  onStartGame,
  theme 
}: {
  player: Player;
  onBack: () => void;
  onStartGame: (players: LobbyPlayer[], difficulty: Difficulty) => void;
  theme: Theme;
}) {
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(true);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [players, setPlayers] = useState<LobbyPlayer[]>([
    {
      id: player.id,
      name: player.username,
      avatar: player.avatar,
      level: player.level,
      isReady: true,
      isHost: true,
    }
  ]);
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  // Simulate players joining (for demo)
  useEffect(() => {
    if (!isCreating || players.length >= maxPlayers) return;

    const botNames = ['SnakeMaster', 'ProGamer', 'NoodleKing', 'SpeedDemon', 'ViperStrike'];
    const botAvatars = ['🐍', '🎮', '🍜', '⚡', '🐉'];
    
    const interval = setInterval(() => {
      if (players.length < maxPlayers && Math.random() > 0.7) {
        const botIndex = players.length - 1;
        const newPlayer: LobbyPlayer = {
          id: `bot_${Date.now()}`,
          name: botNames[botIndex % botNames.length],
          avatar: botAvatars[botIndex % botAvatars.length],
          level: Math.floor(Math.random() * 20) + 5,
          isReady: Math.random() > 0.3,
          isHost: false,
        };
        setPlayers(prev => [...prev, newPlayer]);
        audioManager.playClickSound();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isCreating, players.length, maxPlayers]);

  // Simulate bots becoming ready
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayers(prev => prev.map(p => {
        if (!p.isHost && !p.isReady && Math.random() > 0.5) {
          return { ...p, isReady: true };
        }
        return p;
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateRoom = () => {
    audioManager.playClickSound();
    const code = generateRoomCode();
    setRoomCode(code);
    setIsCreating(true);
  };

  const handleJoinRoom = () => {
    if (joinCode.length === 6) {
      audioManager.playClickSound();
      setRoomCode(joinCode.toUpperCase());
      setIsCreating(false);
      // Simulate joining existing room
      setPlayers([
        {
          id: 'host_123',
          name: 'RoomHost',
          avatar: '👑',
          level: 15,
          isReady: true,
          isHost: true,
        },
        {
          id: player.id,
          name: player.username,
          avatar: player.avatar,
          level: player.level,
          isReady: true,
          isHost: false,
        }
      ]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    audioManager.playClickSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = () => {
    audioManager.playClickSound();
    setPlayers(prev => prev.map(p => 
      p.isHost ? { ...p, isReady: !p.isReady } : p
    ));
  };

  const handleKickPlayer = (playerId: string) => {
    audioManager.playClickSound();
    setPlayers(prev => prev.filter(p => p.id !== playerId));
  };

  const handleStartGame = () => {
    const allReady = players.every(p => p.isReady);
    if (allReady && players.length >= 2) {
      audioManager.playSuccessSound();
      onStartGame(players, difficulty);
    }
  };

  const allReady = players.every(p => p.isReady);
  const canStart = allReady && players.length >= 2 && players[0].isHost;

  // Room creation/join screen
  if (!roomCode) {
    return (
      <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={onBack}
            className={`mb-6 px-4 py-2 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300', 'bg-white hover:bg-gray-100 text-gray-700')} rounded-lg font-bold border-2 ${t(theme, 'border-gray-700', 'border-gray-300')}`}
          >
            ← Back
          </button>

          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className={`text-3xl font-black ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>
              Multiplayer Lobby
            </h2>
            <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              Create or join a room to play with friends!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room */}
            <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-2xl p-6 border-2`}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🎮</div>
                <h3 className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                  Create Room
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-bold ${t(theme, 'text-gray-300', 'text-gray-700')} mb-2 block`}>
                    Max Players
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMaxPlayers(2)}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                        maxPlayers === 2
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : t(theme, 'bg-gray-700 text-gray-400', 'bg-gray-200 text-gray-600')
                      }`}
                    >
                      2 Players
                    </button>
                    <button
                      onClick={() => setMaxPlayers(3)}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                        maxPlayers === 3
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : t(theme, 'bg-gray-700 text-gray-400', 'bg-gray-200 text-gray-600')
                      }`}
                    >
                      3 Players
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-sm font-bold ${t(theme, 'text-gray-300', 'text-gray-700')} mb-2 block`}>
                    Difficulty
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`py-2 rounded-lg font-bold text-sm transition-all ${
                          difficulty === d
                            ? d === 'easy' ? 'bg-green-600 text-white' :
                              d === 'medium' ? 'bg-yellow-600 text-white' :
                              d === 'hard' ? 'bg-red-600 text-white' :
                              'bg-purple-600 text-white'
                            : t(theme, 'bg-gray-700 text-gray-400', 'bg-gray-200 text-gray-600')
                        }`}
                      >
                        {d.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                >
                  🎮 Create Room
                </button>
              </div>
            </div>

            {/* Join Room */}
            <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-2xl p-6 border-2`}>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🚪</div>
                <h3 className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                  Join Room
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-bold ${t(theme, 'text-gray-300', 'text-gray-700')} mb-2 block`}>
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="ABC123"
                    maxLength={6}
                    className={`w-full px-4 py-3 ${t(theme, 'bg-gray-900 border-gray-700 text-white placeholder-gray-500', 'bg-white border-gray-300 text-gray-900 placeholder-gray-400')} border-2 rounded-xl text-center text-2xl font-mono font-bold tracking-widest focus:outline-none focus:border-green-500`}
                  />
                </div>

                <button
                  onClick={handleJoinRoom}
                  disabled={joinCode.length !== 6}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none"
                >
                  🚪 Join Room
                </button>

                <div className={`${t(theme, 'bg-blue-900/20 border-blue-500/30', 'bg-blue-50 border-blue-300')} rounded-xl p-4 border-2`}>
                  <div className="flex items-start gap-2">
                    <div className="text-xl">ℹ️</div>
                    <div className="flex-1">
                      <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>
                        How to Join
                      </div>
                      <div className={`text-xs ${t(theme, 'text-gray-300', 'text-gray-700')}`}>
                        Ask your friend for their 6-character room code and enter it above to join their game!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Lobby waiting room
  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={onBack}
            className={`px-4 py-2 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300', 'bg-white hover:bg-gray-100 text-gray-700')} rounded-lg font-bold border-2 ${t(theme, 'border-gray-700', 'border-gray-300')}`}
          >
            ← Leave
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-gray-900')}`}>
            🏠 Game Lobby
          </h2>
          <div className="w-24"></div>
        </div>

        {/* Room Info */}
        <div className={`${t(theme, 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/50', 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-400')} rounded-2xl p-6 mb-6 border-2`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1`}>Room Code</div>
              <div className={`text-4xl font-black font-mono ${t(theme, 'text-white', 'text-gray-900')} tracking-widest`}>
                {roomCode}
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className={`px-6 py-3 ${copied ? 'bg-green-600' : t(theme, 'bg-gray-700 hover:bg-gray-600', 'bg-gray-200 hover:bg-gray-300')} ${t(theme, 'text-white', 'text-gray-900')} font-bold rounded-xl transition-all`}
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </button>
          </div>
          <div className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')}`}>
            Share this code with your friends to invite them!
          </div>
        </div>

        {/* Players List */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-2xl p-6 mb-6 border-2`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
              Players ({players.length}/{maxPlayers})
            </h3>
            <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              {allReady ? '✓ All Ready!' : 'Waiting for players...'}
            </div>
          </div>

          <div className="space-y-3">
            {players.map((p, index) => (
              <div
                key={p.id}
                className={`${t(theme, 'bg-gray-900/60 border-gray-700/50', 'bg-gray-50 border-gray-200')} rounded-xl p-4 border-2 flex items-center gap-4 ${
                  p.isReady ? t(theme, 'border-green-500/50', 'border-green-400') : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <div className="text-4xl">{p.avatar}</div>
                  {p.isHost && (
                    <div className="absolute -top-1 -right-1 text-lg">👑</div>
                  )}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>
                    {p.name}
                    {p.isHost && <span className="text-xs ml-2 text-yellow-400">(Host)</span>}
                  </div>
                  <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                    Level {p.level} • Player {index + 1}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    p.isReady
                      ? 'bg-green-600 text-white'
                      : t(theme, 'bg-gray-700 text-gray-400', 'bg-gray-200 text-gray-600')
                  }`}>
                    {p.isReady ? '✓ Ready' : '⏳ Not Ready'}
                  </div>
                  {p.isHost && players.length > 1 && (
                    <button
                      onClick={() => handleKickPlayer(p.id)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
              <div
                key={`empty_${i}`}
                className={`${t(theme, 'bg-gray-900/30 border-gray-700/30', 'bg-gray-100 border-gray-200')} rounded-xl p-4 border-2 border-dashed flex items-center justify-center`}
              >
                <div className={`text-sm ${t(theme, 'text-gray-500', 'text-gray-400')}`}>
                  ⏳ Waiting for player {players.length + i + 1}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Settings */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-2xl p-6 mb-6 border-2`}>
          <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-4`}>
            ⚙️ Game Settings
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`text-sm font-bold ${t(theme, 'text-gray-300', 'text-gray-700')} mb-2 block`}>
                Max Players
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMaxPlayers(2)}
                  disabled={!players[0].isHost}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    maxPlayers === 2
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : t(theme, 'bg-gray-700 text-gray-400', 'bg-gray-200 text-gray-600')
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  2 Players
                </button>
                <button
                  onClick={() => setMaxPlayers(3)}
                  disabled={!players[0].isHost}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    maxPlayers === 3
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                      : t(theme, 'bg-gray-700 text-gray-400', 'bg-gray-200 text-gray-600')
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  3 Players
                </button>
              </div>
            </div>

            <div>
              <label className={`text-sm font-bold ${t(theme, 'text-gray-300', 'text-gray-700')} mb-2 block`}>
                Difficulty
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    disabled={!players[0].isHost}
                    className={`py-2 rounded-lg font-bold text-sm transition-all ${
                      difficulty === d
                        ? d === 'easy' ? 'bg-green-600 text-white' :
                          d === 'medium' ? 'bg-yellow-600 text-white' :
                          d === 'hard' ? 'bg-red-600 text-white' :
                          'bg-purple-600 text-white'
                        : t(theme, 'bg-gray-700 text-gray-400', 'bg-gray-200 text-gray-600')
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {d.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {players[0].isHost ? (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className={`flex-1 py-4 font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                canStart
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canStart ? '🎮 Start Game!' : `⏳ Waiting (${players.filter(p => p.isReady).length}/${players.length} ready)`}
            </button>
          ) : (
            <button
              onClick={handleToggleReady}
              className={`flex-1 py-4 font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
                players[0].isReady
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
              }`}
            >
              {players[0].isReady ? '⏳ Cancel Ready' : '✓ Ready!'}
            </button>
          )}
        </div>

        {/* Waiting Animation */}
        {!canStart && players[0].isHost && (
          <div className={`mt-6 text-center ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
            <div className="text-4xl mb-2 animate-bounce">⏳</div>
            <div className="text-sm">Waiting for all players to be ready...</div>
          </div>
        )}
      </div>
    </div>
  );
}
