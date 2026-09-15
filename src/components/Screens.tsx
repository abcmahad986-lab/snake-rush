import { useState } from 'react';
import { Player, Screen, Difficulty, GameMode, TROPHIES, TITLES, SNAKE_SKINS, SNAKE_TRAILS, AVATARS, generateDailyEvents, generateBotLeaderboard, DAILY_REWARDS, DIFFICULTY_LABELS } from '../types';
import type { ShopItem } from '../types';
import { savePlayer, claimDailyReward, getLoginReward } from '../store';

// ============ LOGIN SCREEN ============
export function LoginScreen({ onLogin }: { onLogin: (username: string) => void }) {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce-subtle">🐍</div>
          <h1 className="text-3xl font-bold text-green-400 tracking-wider">SNAKE</h1>
          <p className="text-gray-400 text-sm mt-1">The Ultimate Challenge</p>
        </div>

        <div className="bg-gray-800/80 rounded-2xl p-5 border border-gray-700/50 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-4 text-center">Welcome Back!</h2>
          
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-3xl border-2 border-green-500/50 hover:border-green-400 transition-all">
              {selectedAvatar}
            </button>
          </div>

          {showAvatarPicker && (
            <div className="grid grid-cols-8 gap-1 mb-4 bg-gray-900/50 rounded-xl p-2">
              {AVATARS.map(a => (
                <button key={a} onClick={() => { setSelectedAvatar(a); setShowAvatarPicker(false); }} className={`text-xl p-1 rounded ${selectedAvatar === a ? 'bg-green-600/30 ring-1 ring-green-500' : 'hover:bg-gray-700'}`}>
                  {a}
                </button>
              ))}
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && username.trim()) onLogin(username.trim()); }}
              placeholder="Enter your name..."
              maxLength={16}
              className="w-full px-4 py-2.5 bg-gray-900/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
            />
          </div>

          <button
            onClick={() => { if (username.trim()) onLogin(username.trim()); }}
            disabled={!username.trim()}
            className="w-full py-3 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:text-gray-400 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-green-500/20 disabled:shadow-none"
          >
            🎮 Play Now
          </button>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4">Progress saved locally • No account needed</p>
      </div>
    </div>
  );
}

// ============ MAIN MENU ============
export function MainMenu({ player, onSelectMode, onNavigate }: {
  player: Player;
  onSelectMode: (mode: GameMode, difficulty: Difficulty) => void;
  onNavigate: (screen: Screen) => void;
}) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('medium');

  const modes: { id: GameMode; icon: string; name: string; desc: string; color: string }[] = [
    { id: 'classic', icon: '🐍', name: 'Classic', desc: 'Endless snake fun', color: 'from-green-600 to-green-800' },
    { id: 'timed', icon: '⏱️', name: 'Timed', desc: 'Score in 60 seconds', color: 'from-orange-600 to-red-800' },
    { id: 'multiplayer', icon: '👥', name: 'Multiplayer', desc: 'vs Bot or vs Player', color: 'from-blue-600 to-purple-800' },
    { id: 'zen', icon: '🧘', name: 'Zen', desc: 'Pass through walls!', color: 'from-teal-600 to-cyan-800' },
  ];

  const dailyReward = getLoginReward(player);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex flex-col items-center p-3 md:p-4">
      {/* Player Bar */}
      <div className="w-full max-w-md flex items-center justify-between bg-gray-800/80 rounded-xl px-3 py-2 mb-3 border border-gray-700/50">
        <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 hover:bg-gray-700/50 rounded-lg px-2 py-1 transition-all">
          <span className="text-2xl">{player.avatar}</span>
          <div>
            <div className="text-sm font-bold text-white leading-tight">{player.username}</div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-green-400">Lvl {player.level}</span>
              <span className="text-[10px] text-gray-500">•</span>
              <span className="text-[10px] text-indigo-300">
                {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name}
              </span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xs font-bold text-yellow-400">🪙 {player.coins}</div>
          </div>
          <div className="text-center">
            <div className="text-xs font-bold text-purple-400">💎 {player.gems}</div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="w-full max-w-md mb-3">
        <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
          <span>XP</span>
          <span>{player.xp}/{player.xpToNext}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700/50">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500" style={{ width: `${(player.xp / player.xpToNext) * 100}%` }} />
        </div>
      </div>

      {/* Daily Reward Notification */}
      {dailyReward && (
        <button onClick={() => onNavigate('rewards')} className="w-full max-w-md mb-3 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border border-yellow-600/30 rounded-xl px-3 py-2 flex items-center justify-between animate-pulse hover:from-yellow-900/60 hover:to-orange-900/60 transition-all">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <div className="text-left">
              <div className="text-xs font-bold text-yellow-300">Daily Reward Ready!</div>
              <div className="text-[10px] text-yellow-400/70">Day {player.dailyStreak + 1} streak</div>
            </div>
          </div>
          <span className="text-yellow-400">→</span>
        </button>
      )}

      {/* Game Mode Selection */}
      <div className="w-full max-w-md mb-3">
        <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Game Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className={`p-3 rounded-xl border transition-all text-left ${
                selectedMode === m.id
                  ? `bg-gradient-to-br ${m.color} border-white/20 shadow-lg scale-[1.02]`
                  : 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600'
              }`}
            >
              <div className="text-xl mb-1">{m.icon}</div>
              <div className="text-sm font-bold text-white">{m.name}</div>
              <div className="text-[10px] text-gray-300">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="w-full max-w-md mb-4">
        <h3 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Difficulty</h3>
        <div className="flex gap-1.5">
          {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDiff(d)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                selectedDiff === d
                  ? d === 'easy' ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' :
                    d === 'medium' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/30' :
                    d === 'hard' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' :
                    'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:border-gray-600'
              }`}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={() => onSelectMode(selectedMode, selectedDiff)}
        className="w-full max-w-md py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-green-500/30 mb-4"
      >
        ▶ PLAY
      </button>

      {/* Navigation */}
      <div className="w-full max-w-md grid grid-cols-5 gap-2">
        {[
          { screen: 'trophies' as Screen, icon: '🏆', label: 'Trophies' },
          { screen: 'titles' as Screen, icon: '🎖️', label: 'Titles' },
          { screen: 'shop' as Screen, icon: '🛒', label: 'Shop' },
          { screen: 'events' as Screen, icon: '🎯', label: 'Events' },
          { screen: 'leaderboard' as Screen, icon: '📊', label: 'Ranks' },
        ].map(item => (
          <button
            key={item.screen}
            onClick={() => onNavigate(item.screen)}
            className="flex flex-col items-center gap-1 py-2.5 bg-gray-800/60 hover:bg-gray-700/60 rounded-xl border border-gray-700/50 transition-all"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] text-gray-400">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="w-full max-w-md mt-4 grid grid-cols-4 gap-2">
        <div className="bg-gray-800/40 rounded-xl p-2 text-center border border-gray-700/30">
          <div className="text-lg font-bold text-white">{player.gamesPlayed}</div>
          <div className="text-[10px] text-gray-400">Games</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-2 text-center border border-gray-700/30">
          <div className="text-lg font-bold text-green-400">{player.totalScore}</div>
          <div className="text-[10px] text-gray-400">Score</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-2 text-center border border-gray-700/30">
          <div className="text-lg font-bold text-yellow-400">{player.trophies.length}/{TROPHIES.length}</div>
          <div className="text-[10px] text-gray-400">Trophies</div>
        </div>
        <div className="bg-gray-800/40 rounded-xl p-2 text-center border border-gray-700/30">
          <div className="text-lg font-bold text-indigo-400">{player.titles.length}/{TITLES.length}</div>
          <div className="text-[10px] text-gray-400">Titles</div>
        </div>
      </div>
    </div>
  );
}

// ============ PROFILE SCREEN ============
export function ProfileScreen({ player, setPlayer, onBack, onNavigate }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void; onNavigate?: (screen: Screen) => void }) {
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(player.username);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = () => {
    if (newUsername.trim()) {
      const updated = { ...player, username: newUsername.trim() };
      setPlayer(updated);
      savePlayer(updated);
    }
    setEditing(false);
  };

  const changeAvatar = (avatar: string) => {
    const updated = { ...player, avatar };
    setPlayer(updated);
    savePlayer(updated);
    setShowAvatarPicker(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700/50">← Back</button>
        
        {/* Profile Card */}
        <div className="bg-gray-800/80 rounded-2xl p-5 border border-gray-700/50 mb-4 text-center">
          <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-4xl border-3 border-green-500/50 mx-auto mb-3 hover:border-green-400 transition-all">
            {player.avatar}
          </button>
          
          {showAvatarPicker && (
            <div className="grid grid-cols-8 gap-1 mb-3 bg-gray-900/50 rounded-xl p-2">
              {AVATARS.map(a => (
                <button key={a} onClick={() => changeAvatar(a)} className={`text-lg p-0.5 rounded ${player.avatar === a ? 'bg-green-600/30 ring-1 ring-green-500' : 'hover:bg-gray-700'}`}>{a}</button>
              ))}
            </div>
          )}

          {editing ? (
            <div className="flex gap-2 justify-center">
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)} className="px-3 py-1 bg-gray-900 border border-gray-600 rounded-lg text-white text-center text-sm" maxLength={16} />
              <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm">✓</button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-white">{player.username}</h2>
              <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-white">Edit</button>
            </div>
          )}
          
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm font-medium">Level {player.level}</span>
            {onNavigate && (
              <button onClick={() => onNavigate('titles')} className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-full text-sm font-medium flex items-center gap-1 transition-all">
                {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name} →
              </button>
            )}
            {!onNavigate && (
              <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded-full text-sm font-medium flex items-center gap-1">
                {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name}
              </span>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className="bg-gray-800/60 rounded-xl p-3 mb-4 border border-gray-700/50">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Experience</span>
            <span>{player.xp} / {player.xpToNext} XP</span>
          </div>
          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all" style={{ width: `${(player.xp / player.xpToNext) * 100}%` }} />
          </div>
        </div>

        {/* Currency */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 text-center">
            <div className="text-2xl mb-1">🪙</div>
            <div className="text-xl font-bold text-yellow-400">{player.coins}</div>
            <div className="text-[10px] text-gray-400">Coins</div>
          </div>
          <div className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 text-center">
            <div className="text-2xl mb-1">💎</div>
            <div className="text-xl font-bold text-purple-400">{player.gems}</div>
            <div className="text-[10px] text-gray-400">Gems</div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50 mb-4">
          <h3 className="text-sm font-bold text-white mb-3">📊 Statistics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Games Played</span><span className="text-white font-medium">{player.gamesPlayed}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total Score</span><span className="text-white font-medium">{player.totalScore}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Food Eaten</span><span className="text-white font-medium">{player.totalFoodEaten}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Longest Snake</span><span className="text-white font-medium">{player.longestSnake}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Daily Streak</span><span className="text-white font-medium">{player.dailyStreak} 🔥</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Trophies</span><span className="text-white font-medium">{player.trophies.length}/{TROPHIES.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Titles</span><span className="text-indigo-400 font-medium">{player.titles.length}/{TITLES.length}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Bot Wins</span><span className="text-blue-400 font-medium">{player.gamesWonVsBot}</span></div>
          </div>
        </div>

        {/* High Scores */}
        <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
          <h3 className="text-sm font-bold text-white mb-3">🏅 High Scores</h3>
          <div className="space-y-2">
            {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
              <div key={d} className="flex justify-between items-center">
                <span className="text-xs text-gray-400">{DIFFICULTY_LABELS[d]}</span>
                <div className="flex gap-3">
                  <span className="text-xs text-green-400">Classic: {player.highScores[d]}</span>
                  <span className="text-xs text-orange-400">Timed: {player.timedHighScores[d]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TROPHIES SCREEN ============
export function TrophiesScreen({ player, onBack }: { player: Player; onBack: () => void }) {
  const [filter, setFilter] = useState<string>('all');
  const categories = ['all', 'gameplay', 'score', 'collection', 'special'];
  
  const filtered = filter === 'all' ? TROPHIES : TROPHIES.filter(t => t.category === filter);
  const unlocked = player.trophies.length;

  const rarityColors: Record<string, string> = {
    bronze: 'from-amber-800 to-amber-900 border-amber-600/30',
    silver: 'from-gray-400 to-gray-600 border-gray-400/30',
    gold: 'from-yellow-500 to-yellow-700 border-yellow-400/30',
    platinum: 'from-cyan-400 to-cyan-600 border-cyan-400/30',
    diamond: 'from-purple-400 to-pink-500 border-purple-400/30',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700/50">← Back</button>
        
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">🏆 Trophies</h2>
          <p className="text-sm text-gray-400">{unlocked}/{TROPHIES.length} Unlocked</p>
        </div>

        {/* Progress */}
        <div className="bg-gray-800/60 rounded-xl p-3 mb-4 border border-gray-700/50">
          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all" style={{ width: `${(unlocked / TROPHIES.length) * 100}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">{Math.floor((unlocked / TROPHIES.length) * 100)}% Complete</div>
        </div>

        {/* Filter */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === c ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Trophy List */}
        <div className="space-y-2">
          {filtered.map(trophy => {
            const isUnlocked = player.trophies.includes(trophy.id);
            return (
              <div key={trophy.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isUnlocked ? `bg-gradient-to-r ${rarityColors[trophy.rarity]} bg-opacity-20` : 'bg-gray-800/40 border-gray-700/30 opacity-60'}`}>
                <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>{trophy.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{trophy.name}</div>
                  <div className="text-[10px] text-gray-400">{trophy.description}</div>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[10px] text-yellow-400">+{trophy.xpReward} XP</span>
                    <span className="text-[10px] text-yellow-500">+{trophy.coinReward} 🪙</span>
                  </div>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${
                  trophy.rarity === 'bronze' ? 'bg-amber-900/50 text-amber-400' :
                  trophy.rarity === 'silver' ? 'bg-gray-600/50 text-gray-300' :
                  trophy.rarity === 'gold' ? 'bg-yellow-900/50 text-yellow-400' :
                  trophy.rarity === 'platinum' ? 'bg-cyan-900/50 text-cyan-400' :
                  'bg-purple-900/50 text-purple-400'
                }`}>
                  {isUnlocked ? '✓' : '🔒'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ SHOP SCREEN ============
export function ShopScreen({ player, setPlayer, onBack }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void }) {
  const [tab, setTab] = useState<'skins' | 'trails'>('skins');

  const buyItem = (item: ShopItem) => {
    const isOwned = item.type === 'skin' ? player.ownedSkins.includes(item.id) : player.ownedTrails.includes(item.id);
    if (isOwned) {
      // Equip
      const updated = item.type === 'skin' 
        ? { ...player, equippedSkin: item.id }
        : { ...player, equippedTrail: item.id };
      setPlayer(updated);
      savePlayer(updated);
      return;
    }

    const currency = item.currency === 'coins' ? 'coins' : 'gems';
    if (player[currency] < item.price) return;

    const updated = { ...player, [currency]: player[currency] - item.price };
    if (item.type === 'skin') {
      updated.ownedSkins = [...player.ownedSkins, item.id];
      updated.equippedSkin = item.id;
    } else {
      updated.ownedTrails = [...player.ownedTrails, item.id];
      updated.equippedTrail = item.id;
    }
    setPlayer(updated);
    savePlayer(updated);
  };

  const items = tab === 'skins' ? SNAKE_SKINS : SNAKE_TRAILS;
  const rarityBorder: Record<string, string> = {
    common: 'border-gray-600/30',
    rare: 'border-blue-500/30',
    epic: 'border-purple-500/30',
    legendary: 'border-yellow-500/40',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700/50">← Back</button>
        
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">🛒 Shop</h2>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-sm text-yellow-400">🪙 {player.coins}</span>
            <span className="text-sm text-purple-400">💎 {player.gems}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('skins')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'skins' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>🎨 Skins</button>
          <button onClick={() => setTab('trails')} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'trails' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>✨ Trails</button>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {items.map(item => {
            const isOwned = item.type === 'skin' ? player.ownedSkins.includes(item.id) : player.ownedTrails.includes(item.id);
            const isEquipped = item.type === 'skin' ? player.equippedSkin === item.id : player.equippedTrail === item.id;
            const canAfford = item.currency === 'coins' ? player.coins >= item.price : player.gems >= item.price;

            return (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border bg-gray-800/60 ${rarityBorder[item.rarity]} ${isEquipped ? 'ring-1 ring-green-500/50' : ''}`}>
                <div className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-900/50 rounded-lg">{item.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{item.name}</div>
                  <div className="text-[10px] text-gray-400">{item.description}</div>
                  <div className={`text-[10px] mt-0.5 ${
                    item.rarity === 'common' ? 'text-gray-400' :
                    item.rarity === 'rare' ? 'text-blue-400' :
                    item.rarity === 'epic' ? 'text-purple-400' :
                    'text-yellow-400'
                  }`}>{item.rarity.toUpperCase()}</div>
                </div>
                <button
                  onClick={() => buyItem(item)}
                  disabled={!isOwned && !canAfford}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isEquipped ? 'bg-green-600/30 text-green-400 border border-green-500/30' :
                    isOwned ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30 hover:bg-blue-600/50' :
                    canAfford ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-600/50' :
                    'bg-gray-700/30 text-gray-500 border border-gray-600/30 cursor-not-allowed'
                  }`}
                >
                  {isEquipped ? '✓ Equipped' : isOwned ? 'Equip' : `${item.currency === 'coins' ? '🪙' : '💎'} ${item.price}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ EVENTS SCREEN ============
export function EventsScreen({ player, setPlayer, onBack }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void }) {
  const events = generateDailyEvents();

  const claimEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const progress = player.eventProgress[eventId] || 0;
    if (progress < event.target) return;

    const updated = {
      ...player,
      coins: player.coins + event.reward.coins,
      gems: player.gems + event.reward.gems,
      eventProgress: { ...player.eventProgress, [eventId]: 0 },
    };
    setPlayer(updated);
    savePlayer(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700/50">← Back</button>
        
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">🎯 Daily Events</h2>
          <p className="text-xs text-gray-400">Resets daily at midnight</p>
        </div>

        <div className="space-y-3">
          {events.map(event => {
            const progress = player.eventProgress[event.id] || 0;
            const isComplete = progress >= event.target;
            const pct = Math.min(100, (progress / event.target) * 100);

            return (
              <div key={event.id} className={`bg-gray-800/80 rounded-xl p-4 border ${isComplete ? 'border-green-500/30' : 'border-gray-700/50'}`}>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{event.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white">{event.name}</h3>
                    <p className="text-xs text-gray-400">{event.description}</p>
                    
                    {/* Progress bar */}
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
                        <span>Progress</span>
                        <span>{Math.min(progress, event.target)}/{event.target}</span>
                      </div>
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2 text-[10px]">
                        <span className="text-yellow-400">🪙 {event.reward.coins}</span>
                        <span className="text-purple-400">💎 {event.reward.gems}</span>
                        <span className="text-green-400">+{event.reward.xp} XP</span>
                      </div>
                      {isComplete && (
                        <button onClick={() => claimEvent(event.id)} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-all">
                          Claim!
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-4 bg-gray-800/40 rounded-xl p-3 border border-gray-700/30">
          <p className="text-xs text-gray-400 text-center">💡 Play games to complete event objectives. Progress is tracked automatically!</p>
        </div>
      </div>
    </div>
  );
}

// ============ LEADERBOARD SCREEN ============
export function LeaderboardScreen({ player, onBack }: { player: Player; onBack: () => void }) {
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('medium');
  const botBoard = generateBotLeaderboard(selectedDiff);

  // Insert player into leaderboard
  const playerEntry = {
    username: player.username,
    avatar: player.avatar,
    score: player.highScores[selectedDiff],
    level: player.level,
    mode: 'classic' as GameMode,
    difficulty: selectedDiff,
    date: new Date().toISOString(),
  };

  const fullBoard = [...botBoard, playerEntry].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700/50">← Back</button>
        
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">📊 Leaderboard</h2>
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1 mb-4">
          {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
            <button key={d} onClick={() => setSelectedDiff(d)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedDiff === d ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-2 mb-4">
          {fullBoard.slice(0, 3).map((entry, i) => {
            const heights = ['h-24', 'h-20', 'h-16'];
            const colors = ['from-yellow-600 to-yellow-800', 'from-gray-400 to-gray-600', 'from-amber-700 to-amber-900'];
            const medals = ['🥇', '🥈', '🥉'];
            const order = [1, 0, 2];
            const idx = order[i];
            const e = fullBoard[idx];
            if (!e) return null;
            const isPlayer = e.username === player.username;

            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-xl mb-1">{e.avatar}</span>
                <div className={`w-16 ${heights[i]} bg-gradient-to-t ${colors[i]} rounded-t-xl flex flex-col items-center justify-start pt-2 ${isPlayer ? 'ring-2 ring-green-400' : ''}`}>
                  <span className="text-lg">{medals[idx]}</span>
                  <span className="text-[9px] text-white font-bold truncate w-full text-center px-1">{e.username}</span>
                  <span className="text-[10px] text-white/80">{e.score}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Full List */}
        <div className="space-y-1">
          {fullBoard.map((entry, i) => {
            const isPlayer = entry.username === player.username;
            const playerTitle = isPlayer ? TITLES.find(t => t.id === player.equippedTitle) : null;
            return (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isPlayer ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-800/40'}`}>
                <span className="text-xs text-gray-400 w-5 text-right font-mono">#{i + 1}</span>
                <span className="text-lg">{entry.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold truncate ${isPlayer ? 'text-green-400' : 'text-white'}`}>
                    {entry.username}{isPlayer && ' (You)'}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-500">Lvl {entry.level}</span>
                    {playerTitle && (
                      <>
                        <span className="text-[10px] text-gray-600">•</span>
                        <span className="text-[10px] text-indigo-300">{playerTitle.icon} {playerTitle.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-sm font-bold text-white">{entry.score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ REWARDS SCREEN ============
export function RewardsScreen({ player, setPlayer, onBack }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void }) {
  const reward = getLoginReward(player);
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    if (!reward) return;
    const updated = claimDailyReward(player);
    setPlayer(updated);
    savePlayer(updated);
    setClaimed(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700/50">← Back</button>
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">🎁 Daily Rewards</h2>
          <p className="text-xs text-gray-400 mt-1">Streak: {player.dailyStreak} days 🔥</p>
        </div>

        {/* Reward Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {DAILY_REWARDS.map((r, i) => {
            const isPast = i < (player.dailyStreak % 7);
            const isCurrent = i === (player.dailyStreak % 7) && !claimed;
            const isFuture = i > (player.dailyStreak % 7);
            
            return (
              <div key={i} className={`flex flex-col items-center p-2 rounded-xl border ${
                isPast ? 'bg-green-900/20 border-green-600/30' :
                isCurrent ? 'bg-yellow-900/30 border-yellow-500/50 animate-pulse' :
                'bg-gray-800/40 border-gray-700/30'
              }`}>
                <div className="text-[10px] text-gray-400 mb-0.5">Day {i + 1}</div>
                <div className="text-xl mb-0.5">{r.icon}</div>
                <div className="text-[8px] text-yellow-400">{r.coins}🪙</div>
                {r.gems > 0 && <div className="text-[8px] text-purple-400">{r.gems}💎</div>}
                {isPast && <div className="text-[10px] text-green-400">✓</div>}
              </div>
            );
          })}
        </div>

        {/* Claim Button */}
        {reward && !claimed ? (
          <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-2xl p-5 border border-yellow-600/30 text-center">
            <div className="text-4xl mb-3">🎁</div>
            <h3 className="text-lg font-bold text-yellow-300 mb-1">Day {reward.streakDay} Reward!</h3>
            <div className="flex justify-center gap-4 mb-4 text-sm">
              <span className="text-yellow-400">🪙 {reward.coins}</span>
              <span className="text-purple-400">💎 {reward.gems}</span>
              <span className="text-green-400">+{reward.xp} XP</span>
            </div>
            <button onClick={handleClaim} className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/30">
              Claim Reward! 🎉
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/60 rounded-2xl p-5 border border-gray-700/50 text-center">
            <div className="text-4xl mb-3">{claimed ? '✅' : '😴'}</div>
            <h3 className="text-lg font-bold text-white mb-1">{claimed ? 'Claimed!' : 'Come back tomorrow!'}</h3>
            <p className="text-xs text-gray-400">{claimed ? 'Your reward has been added.' : 'Your next reward will be available tomorrow.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SETTINGS SCREEN ============
export function SettingsScreen({ player, onBack, onLogout }: { player: Player; onBack: () => void; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700/50">← Back</button>
        
        <h2 className="text-2xl font-bold text-white text-center mb-6">⚙️ Settings</h2>

        <div className="space-y-3">
          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-white mb-2">Account</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{player.avatar}</span>
              <div>
                <div className="text-sm font-medium text-white">{player.username}</div>
                <div className="text-xs text-gray-400">Level {player.level} • ID: {player.id.slice(0, 8)}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-white mb-2">Game Info</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p>• Progress is saved locally in your browser</p>
              <p>• Use the same browser to continue your progress</p>
              <p>• Clearing browser data will reset your progress</p>
            </div>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-bold text-white mb-2">Controls</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <p>🖥️ <b>Desktop:</b> Arrow keys or WASD to move</p>
              <p>📱 <b>Mobile:</b> Swipe or use D-pad buttons</p>
              <p>👥 <b>Multiplayer:</b> P1: WASD, P2: IJKL</p>
              <p>⏸️ <b>Pause:</b> Space or Escape</p>
            </div>
          </div>

          <button onClick={onLogout} className="w-full py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-medium rounded-xl border border-red-700/30 transition-all">
            🚪 Switch Account
          </button>

          <div className="text-center text-gray-600 text-xs mt-4">
            <p>Snake Game v2.0</p>
            <p>Made with ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TITLES SCREEN ============
export function TitlesScreen({ player, setPlayer, onBack }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void }) {
  const [filter, setFilter] = useState<string>('all');
  const categories = ['all', 'beginner', 'score', 'collection', 'combat', 'special', 'legendary'];
  
  const filtered = filter === 'all' ? TITLES : TITLES.filter(t => t.category === filter);
  const unlocked = player.titles.length;

  const rarityColors: Record<string, string> = {
    common: 'from-gray-600 to-gray-800 border-gray-500/30',
    uncommon: 'from-green-700 to-green-900 border-green-500/30',
    rare: 'from-blue-700 to-blue-900 border-blue-500/30',
    epic: 'from-purple-700 to-purple-900 border-purple-500/30',
    legendary: 'from-yellow-600 to-orange-800 border-yellow-500/40',
  };

  const equipTitle = (titleId: string) => {
    const updated = { ...player, equippedTitle: titleId };
    setPlayer(updated);
    savePlayer(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="mb-3 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm border border-gray-700/50">← Back</button>
        
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white">🎖️ Titles</h2>
          <p className="text-sm text-gray-400">{unlocked}/{TITLES.length} Unlocked</p>
        </div>

        {/* Current Title */}
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-4 mb-4 border border-indigo-500/30 text-center">
          <div className="text-xs text-gray-400 mb-1">Currently Equipped</div>
          <div className="text-2xl mb-1">
            {TITLES.find(t => t.id === player.equippedTitle)?.icon || '🏷️'}
          </div>
          <div className="text-sm font-bold text-white">
            {TITLES.find(t => t.id === player.equippedTitle)?.name || 'None'}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-gray-800/60 rounded-xl p-3 mb-4 border border-gray-700/50">
          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${(unlocked / TITLES.length) * 100}%` }} />
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">{Math.floor((unlocked / TITLES.length) * 100)}% Complete</div>
        </div>

        {/* Filter */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === c ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Title List */}
        <div className="space-y-2">
          {filtered.map(title => {
            const isUnlocked = player.titles.includes(title.id);
            const isEquipped = player.equippedTitle === title.id;
            return (
              <div key={title.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isUnlocked ? `bg-gradient-to-r ${rarityColors[title.rarity]}` : 'bg-gray-800/40 border-gray-700/30 opacity-60'} ${isEquipped ? 'ring-2 ring-white/30' : ''}`}>
                <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>{title.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{title.name}</div>
                  <div className="text-[10px] text-gray-300">{title.description}</div>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[10px] text-yellow-400">+{title.coinReward} 🪙</span>
                    <span className={`text-[10px] ${
                      title.rarity === 'common' ? 'text-gray-400' :
                      title.rarity === 'uncommon' ? 'text-green-400' :
                      title.rarity === 'rare' ? 'text-blue-400' :
                      title.rarity === 'epic' ? 'text-purple-400' :
                      'text-yellow-400'
                    }`}>{title.rarity.toUpperCase()}</span>
                  </div>
                </div>
                {isUnlocked ? (
                  <button
                    onClick={() => equipTitle(title.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isEquipped ? 'bg-white/20 text-white border border-white/30' : 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/50'
                    }`}
                  >
                    {isEquipped ? '✓ Equipped' : 'Equip'}
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-gray-700/30">🔒</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
