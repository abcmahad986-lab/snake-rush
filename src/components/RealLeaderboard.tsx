import { useState, useEffect } from 'react';
import { Player, Theme, Difficulty, GameMode } from '../types';
import { getAllUsers } from '../store';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// Global player database (simulated)
interface GlobalPlayer {
  id: string;
  username: string;
  avatar: string;
  level: number;
  country: string;
  flag: string;
  scores: Record<string, Record<Difficulty, number>>;
  gamesPlayed: number;
  wins: number;
  joinDate: string;
}

// Generate realistic global players
const generateGlobalPlayers = (): GlobalPlayer[] => {
  const countries = [
    { name: 'USA', flag: '🇺🇸' },
    { name: 'UK', flag: '🇬🇧' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'France', flag: '🇫🇷' },
    { name: 'Brazil', flag: '🇧🇷' },
    { name: 'India', flag: '🇮🇳' },
    { name: 'Canada', flag: '🇨🇦' },
    { name: 'Australia', flag: '🇦🇺' },
    { name: 'South Korea', flag: '🇰🇷' },
    { name: 'Spain', flag: '🇪🇸' },
    { name: 'Italy', flag: '🇮🇹' },
    { name: 'Mexico', flag: '🇲🇽' },
    { name: 'Russia', flag: '🇷🇺' },
    { name: 'China', flag: '🇨🇳' },
    { name: 'Netherlands', flag: '🇳🇱' },
    { name: 'Sweden', flag: '🇸🇪' },
    { name: 'Norway', flag: '🇳🇴' },
    { name: 'Poland', flag: '🇵🇱' },
    { name: 'Argentina', flag: '🇦🇷' },
  ];

  const avatars = ['🐍', '🐉', '🦊', '🐺', '🦁', '🐯', '🦅', '🐬', '🦄', '🐙', '🦈', '🐊', '🦖', '🐢', '🦂', '🐝', '🦋', '🐞', '🐌', '🦗'];
  
  const names = [
    'SnakeMaster', 'PythonKing', 'ViperStrike', 'CobraCommander', 'MambaKing',
    'NeonSlither', 'PixelSnake', 'CyberSerpent', 'DigitalDragon', 'ByteSnake',
    'QuantumSnake', 'NovaSerpent', 'StellarSnake', 'CosmicCobra', 'GalacticViper',
    'ThunderSnake', 'LightningBolt', 'StormSerpent', 'BlazeSnake', 'InfernoViper',
    'FrostBite', 'IceVenom', 'CrystalSnake', 'DiamondFang', 'ShadowStrike',
    'PhantomSnake', 'GhostViper', 'SpiritSerpent', 'MysticSnake', 'EnchantedViper',
    'RoyalCobra', 'ImperialSnake', 'NobleSerpent', 'EliteViper', 'SupremeSnake',
    'AlphaPython', 'BetaSerpent', 'GammaViper', 'DeltaSnake', 'OmegaCobra',
    'VenomQueen', 'ToxicKing', 'PoisonFang', 'AcidSnake', 'VenomStrike',
    'RapidFire', 'SpeedDemon', 'QuickStrike', 'FlashSnake', 'TurboViper',
    'StealthSnake', 'NinjaViper', 'SilentStrike', 'ShadowFang', 'DarkSerpent',
    'GoldenSnake', 'SilverViper', 'BronzeCobra', 'PlatinumSnake', 'DiamondViper',
    'EmeraldSnake', 'RubyViper', 'SapphireCobra', 'TopazSnake', 'AmethystViper',
    'PhoenixRise', 'DragonFire', 'UnicornMagic', 'GriffinWing', 'PegasusFlight',
    'KrakenDeep', 'Leviathan', 'HydraHeads', 'ChimeraBeast', 'SphinxRiddle',
    'TitanForce', 'AtlasStrong', 'ZeusThunder', 'PoseidonWave', 'HadesDark',
    'ApolloLight', 'ArtemisBow', 'AthenaWise', 'AresWar', 'HermesSpeed',
    'OdinWisdom', 'ThorHammer', 'LokiTrick', 'FreyaLove', 'TyrJustice',
    'RagnarokEnd', 'ValhallaHall', 'AsgardRealm', 'MidgardEarth', 'NiflheimIce',
  ];

  const players: GlobalPlayer[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 100; i++) {
    let username = names[Math.floor(Math.random() * names.length)];
    if (usedNames.has(username)) {
      username = username + Math.floor(Math.random() * 999);
    }
    usedNames.add(username);

    const country = countries[Math.floor(Math.random() * countries.length)];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    const level = Math.floor(Math.random() * 80) + 1;
    const gamesPlayed = Math.floor(Math.random() * 500) + 10;
    const wins = Math.floor(gamesPlayed * (Math.random() * 0.6 + 0.2));

    // Generate scores for each mode and difficulty
    const scores: Record<string, Record<Difficulty, number>> = {
      classic: { easy: 0, medium: 0, hard: 0, insane: 0 },
      timed: { easy: 0, medium: 0, hard: 0, insane: 0 },
      zen: { easy: 0, medium: 0, hard: 0, insane: 0 },
    };

    // Higher level players have higher scores
    const baseScore = level * 15 + Math.floor(Math.random() * 200);
    
    Object.keys(scores).forEach(mode => {
      (['easy', 'medium', 'hard', 'insane'] as Difficulty[]).forEach((diff, idx) => {
        const difficultyMultiplier = [1.5, 1.2, 1.0, 0.8][idx];
        const modeMultiplier = mode === 'timed' ? 0.7 : mode === 'zen' ? 1.3 : 1.0;
        scores[mode][diff] = Math.floor(baseScore * difficultyMultiplier * modeMultiplier * (Math.random() * 0.3 + 0.85));
      });
    });

    const joinDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString();

    players.push({
      id: `global_${i}_${Date.now()}`,
      username,
      avatar,
      level,
      country: country.name,
      flag: country.flag,
      scores,
      gamesPlayed,
      wins,
      joinDate,
    });
  }

  return players;
};

// Get or create global leaderboard
const getGlobalLeaderboard = (): GlobalPlayer[] => {
  const stored = localStorage.getItem('snake-global-leaderboard');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      const players = generateGlobalPlayers();
      localStorage.setItem('snake-global-leaderboard', JSON.stringify(players));
      return players;
    }
  }
  const players = generateGlobalPlayers();
  localStorage.setItem('snake-global-leaderboard', JSON.stringify(players));
  return players;
};

// Get local leaderboard (from all users on this device)
const getLocalLeaderboard = (): GlobalPlayer[] => {
  const users = getAllUsers();
  return users.map(user => ({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    level: user.level,
    country: 'Local',
    flag: '🏠',
    scores: {
      classic: user.highScores,
      timed: user.timedHighScores,
      zen: { easy: 0, medium: 0, hard: 0, insane: 0 },
    },
    gamesPlayed: user.gamesPlayed,
    wins: user.gamesWon,
    joinDate: user.createdAt,
  }));
};

export function RealLeaderboardScreen({ player, onBack, theme }: {
  player: Player;
  onBack: () => void;
  theme: Theme;
}) {
  const [scope, setScope] = useState<'global' | 'local'>('global');
  const [mode, setMode] = useState<GameMode>('classic');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [globalPlayers, setGlobalPlayers] = useState<GlobalPlayer[]>([]);
  const [localPlayers, setLocalPlayers] = useState<GlobalPlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setGlobalPlayers(getGlobalLeaderboard());
    setLocalPlayers(getLocalLeaderboard());
  }, []);

  // Add current player to local leaderboard
  const currentPlayerEntry: GlobalPlayer = {
    id: player.id,
    username: player.username,
    avatar: player.avatar,
    level: player.level,
    country: 'Local',
    flag: '🏠',
    scores: {
      classic: player.highScores,
      timed: player.timedHighScores,
      zen: { easy: 0, medium: 0, hard: 0, insane: 0 },
    },
    gamesPlayed: player.gamesPlayed,
    wins: player.gamesWon,
    joinDate: player.createdAt,
  };

  // Combine and sort leaderboard
  const getLeaderboard = () => {
    let board: GlobalPlayer[];
    
    if (scope === 'global') {
      board = [...globalPlayers, currentPlayerEntry];
    } else {
      const localWithoutCurrent = localPlayers.filter(p => p.id !== player.id);
      board = [...localWithoutCurrent, currentPlayerEntry];
    }

    // Filter by search query
    if (searchQuery) {
      board = board.filter(p => 
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by score
    return board.sort((a, b) => {
      const scoreA = a.scores[mode]?.[difficulty] || 0;
      const scoreB = b.scores[mode]?.[difficulty] || 0;
      return scoreB - scoreA;
    });
  };

  const leaderboard = getLeaderboard();
  const playerRank = leaderboard.findIndex(p => p.id === player.id) + 1;
  const playerScore = currentPlayerEntry.scores[mode]?.[difficulty] || 0;

  // Get top 3 for podium
  const top3 = leaderboard.slice(0, 3);

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Leaderboard</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Compete with players worldwide!</p>
        </div>

        {/* Your Rank Card */}
        <div className={`${t(theme, 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30', 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300')} rounded-xl p-4 mb-4 border`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Your Rank</div>
              <div className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>#{playerRank}</div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Your Score</div>
              <div className={`text-2xl font-bold ${t(theme, 'text-yellow-400', 'text-yellow-600')}`}>{playerScore}</div>
            </div>
            <div className="text-center">
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Games Played</div>
              <div className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.gamesPlayed}</div>
            </div>
          </div>
        </div>

        {/* Scope Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setScope('global')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              scope === 'global'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => setScope('local')}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              scope === 'local'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            }`}
          >
            🏠 Local
          </button>
        </div>

        {/* Mode Filter */}
        <div className="mb-4">
          <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-2`}>Game Mode</div>
          <div className="flex gap-2">
            {(['classic', 'timed', 'zen'] as GameMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
                }`}
              >
                {m === 'classic' ? '🐍 Classic' : m === 'timed' ? '⏱️ Timed' : '🧘 Zen'}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-4">
          <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-2`}>Difficulty</div>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  difficulty === d
                    ? d === 'easy' ? 'bg-green-600 text-white' :
                      d === 'medium' ? 'bg-yellow-600 text-white' :
                      d === 'hard' ? 'bg-red-600 text-white' :
                      'bg-purple-600 text-white'
                    : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
                }`}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className={`w-full px-4 py-2 ${t(theme, 'bg-gray-800 border-gray-700 text-white placeholder-gray-500', 'bg-white border-gray-300 text-gray-900 placeholder-gray-400')} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
          />
        </div>

        {/* Top 3 Podium */}
        {top3.length === 3 && !searchQuery && (
          <div className="mb-6">
            <div className="flex items-end justify-center gap-3">
              {/* 2nd Place */}
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">{top3[1].avatar}</div>
                <div className={`w-20 h-28 ${t(theme, 'bg-gradient-to-t from-gray-400 to-gray-300', 'bg-gradient-to-t from-gray-300 to-gray-200')} rounded-t-xl flex flex-col items-center justify-start pt-3 relative`}>
                  <div className="text-2xl mb-1">🥈</div>
                  <div className={`text-xs font-bold ${t(theme, 'text-gray-800', 'text-gray-900')} truncate w-full text-center px-1`}>{top3[1].username}</div>
                  <div className={`text-sm font-bold ${t(theme, 'text-gray-700', 'text-gray-800')}`}>{top3[1].scores[mode]?.[difficulty] || 0}</div>
                  <div className={`text-xs ${t(theme, 'text-gray-600', 'text-gray-700')}`}>{top3[1].flag}</div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center">
                <div className="text-5xl mb-2 animate-bounce">{top3[0].avatar}</div>
                <div className={`w-24 h-36 ${t(theme, 'bg-gradient-to-t from-yellow-600 to-yellow-400', 'bg-gradient-to-t from-yellow-400 to-yellow-300')} rounded-t-xl flex flex-col items-center justify-start pt-3 relative shadow-lg shadow-yellow-500/50`}>
                  <div className="text-3xl mb-1">🥇</div>
                  <div className={`text-sm font-bold ${t(theme, 'text-gray-900', 'text-gray-800')} truncate w-full text-center px-1`}>{top3[0].username}</div>
                  <div className={`text-lg font-bold ${t(theme, 'text-gray-800', 'text-gray-900')}`}>{top3[0].scores[mode]?.[difficulty] || 0}</div>
                  <div className={`text-xs ${t(theme, 'text-gray-700', 'text-gray-800')}`}>{top3[0].flag}</div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">{top3[2].avatar}</div>
                <div className={`w-20 h-24 ${t(theme, 'bg-gradient-to-t from-amber-700 to-amber-600', 'bg-gradient-to-t from-amber-600 to-amber-500')} rounded-t-xl flex flex-col items-center justify-start pt-3 relative`}>
                  <div className="text-2xl mb-1">🥉</div>
                  <div className={`text-xs font-bold ${t(theme, 'text-white', 'text-gray-900')} truncate w-full text-center px-1`}>{top3[2].username}</div>
                  <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-800')}`}>{top3[2].scores[mode]?.[difficulty] || 0}</div>
                  <div className={`text-xs ${t(theme, 'text-white/80', 'text-gray-700')}`}>{top3[2].flag}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard List */}
        <div className="space-y-2">
          {leaderboard.slice(searchQuery ? 0 : 3).map((entry, i) => {
            const rank = searchQuery ? i + 1 : i + 4;
            const isPlayer = entry.id === player.id;
            const winRate = entry.gamesPlayed > 0 ? Math.floor((entry.wins / entry.gamesPlayed) * 100) : 0;

            return (
              <div
                key={entry.id}
                className={`${
                  isPlayer
                    ? t(theme, 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/50', 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400')
                    : t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')
                } rounded-xl p-3 border transition-all ${isPlayer ? 'ring-2 ring-green-500' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                    rank <= 10
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
                      : rank <= 50
                      ? t(theme, 'bg-gray-700 text-gray-300', 'bg-gray-200 text-gray-700')
                      : t(theme, 'bg-gray-800 text-gray-500', 'bg-gray-100 text-gray-500')
                  }`}>
                    #{rank}
                  </div>

                  {/* Avatar */}
                  <div className="text-3xl">{entry.avatar}</div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`font-bold truncate ${isPlayer ? t(theme, 'text-green-400', 'text-green-600') : t(theme, 'text-white', 'text-gray-900')}`}>
                        {entry.username}
                        {isPlayer && ' (You)'}
                      </div>
                      <span className="text-sm">{entry.flag}</span>
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                      <span>Lvl {entry.level}</span>
                      <span>•</span>
                      <span>{entry.gamesPlayed} games</span>
                      <span>•</span>
                      <span className="text-green-400">{winRate}% win</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className={`text-xl font-bold ${t(theme, 'text-yellow-400', 'text-yellow-600')}`}>
                      {entry.scores[mode]?.[difficulty] || 0}
                    </div>
                    <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-400')}`}>points</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-xl p-4 mt-4 border`}>
          <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>📊 Leaderboard Stats</div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Total Players</div>
              <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{leaderboard.length}</div>
            </div>
            <div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Your Position</div>
              <div className={`text-lg font-bold ${t(theme, 'text-green-400', 'text-green-600')}`}>#{playerRank}</div>
            </div>
            <div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Top Score</div>
              <div className={`text-lg font-bold ${t(theme, 'text-yellow-400', 'text-yellow-600')}`}>{leaderboard[0]?.scores[mode]?.[difficulty] || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
