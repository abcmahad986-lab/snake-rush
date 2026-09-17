import { useState } from 'react';
import { Player, Screen, Difficulty, GameMode, TROPHIES, TITLES, SNAKE_SKINS, SNAKE_TRAILS, AVATARS, generateDailyEvents, generateBotLeaderboard, DAILY_REWARDS, DIFFICULTY_LABELS, Theme } from '../types';
import type { ShopItem } from '../types';
import { savePlayer, claimDailyReward, getLoginReward } from '../store';
import { audioManager } from '../audio';
import { SimpleClassicIcon, SimpleTimedIcon, SimpleMultiplayerIcon, SimpleZenIcon, SimpleSurvivalIcon, SimpleEasyIcon, SimpleMediumIcon, SimpleHardIcon, SimpleInsaneIcon } from './SimpleIcons';

// Theme helper
const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// Theme toggle button component
function ThemeToggle({ theme, toggleTheme }: { theme: Theme; toggleTheme: () => void }) {
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-yellow-400', 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300')}`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

// ============ LOGIN SCREEN ============
export function LoginScreen({ onLogin, theme, toggleTheme }: { onLogin: (username: string) => void; theme: Theme; toggleTheme: () => void }) {
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} flex items-center justify-center p-4`}>
      <div className="w-full max-w-sm animate-fade-in">
        {/* Theme toggle */}
        <div className="flex justify-end mb-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce-subtle">🐍</div>
          <h1 className={`text-3xl font-bold ${t(theme, 'text-green-400', 'text-green-600')} tracking-wider`}>SNAKE</h1>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')} text-sm mt-1`}>The Ultimate Challenge</p>
        </div>

        <div className={`${t(theme, 'bg-gray-800/80 border-gray-700/50', 'bg-white border-gray-200')} rounded-2xl p-5 border shadow-xl`}>
          <h2 className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-4 text-center`}>Welcome Back!</h2>
          
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
            <label className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} uppercase tracking-wide mb-1 block`}>Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && username.trim()) onLogin(username.trim()); }}
              placeholder="Enter your name..."
              maxLength={16}
              className={`w-full px-4 py-2.5 ${t(theme, 'bg-gray-900/60 border-gray-600/50 text-white placeholder-gray-500', 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400')} border rounded-xl focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all`}
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

        <p className={`text-center ${t(theme, 'text-gray-600', 'text-gray-500')} text-xs mt-4`}>Progress saved locally • No account needed</p>
      </div>
    </div>
  );
}

// ============ MAIN MENU ============
export function MainMenu({ player, onSelectMode, onNavigate, theme, toggleTheme }: {
  player: Player;
  onSelectMode: (mode: GameMode, difficulty: Difficulty) => void;
  onNavigate: (screen: Screen) => void;
  theme: Theme;
  toggleTheme: () => void;
}) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('medium');

  const modes: { id: GameMode; icon: React.ReactNode; name: string; desc: string }[] = [
    { 
      id: 'classic', 
      icon: <SimpleClassicIcon className="w-12 h-12" />, 
      name: 'Classic', 
      desc: 'Endless snake fun'
    },
    { 
      id: 'timed', 
      icon: <SimpleTimedIcon className="w-12 h-12" />, 
      name: 'Timed', 
      desc: 'Score in 60 seconds'
    },
    { 
      id: 'multiplayer', 
      icon: <SimpleMultiplayerIcon className="w-12 h-12" />, 
      name: 'Multiplayer', 
      desc: 'vs Bot or vs Player'
    },
    { 
      id: 'zen', 
      icon: <SimpleZenIcon className="w-12 h-12" />, 
      name: 'Zen', 
      desc: 'Pass through walls!'
    },
    { 
      id: 'survival', 
      icon: <SimpleSurvivalIcon className="w-12 h-12" />, 
      name: 'Survival', 
      desc: 'Speed increases, survive!'
    },
  ];

  const dailyReward = getLoginReward(player);

  const handleGoPro = () => {
    if (player.googleAccount) {
      // User is authenticated, open Lemon Squeezy checkout
      import('../lib/lemonsqueezy').then(({ openLemonSqueezyCheckout, PRODUCT_IDS }) => {
        openLemonSqueezyCheckout(PRODUCT_IDS.SNAKE_PASS_PREMIUM, {
          userId: player.id,
          userEmail: player.googleAccount!,
          username: player.username,
        });
      });
    } else {
      // User not authenticated, navigate to Google login
      onNavigate('google');
    }
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]', 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50')} flex flex-col items-center p-4 md:p-6 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Player Bar */}
      <div className={`w-full max-w-2xl flex items-center justify-between ${t(theme, 'bg-gray-900/80 border-gray-700', 'bg-white border-gray-300')} rounded-2xl px-4 py-3 mb-4 border-2 relative z-10`}>
        <button onClick={() => onNavigate('profile')} className={`flex items-center gap-3 ${t(theme, 'hover:bg-gray-800', 'hover:bg-gray-100')} rounded-xl px-3 py-2 transition-all`}>
          <div className="relative">
            <span className="text-3xl">{player.avatar}</span>
          </div>
          <div>
            <div className={`text-base font-bold ${t(theme, 'text-white', 'text-gray-900')} leading-tight`}>{player.username}</div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${t(theme, 'text-gray-300', 'text-gray-600')}`}>Lvl {player.level}</span>
              {player.equippedTitle && (
                <>
                  <span className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-400')}`}>•</span>
                  <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} font-semibold`}>
                    {TITLES.find(ti => ti.id === player.equippedTitle)?.icon} {TITLES.find(ti => ti.id === player.equippedTitle)?.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>🪙 {player.coins}</div>
          </div>
          <div className="text-center">
            <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>💎 {player.gems}</div>
          </div>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>

      {/* XP Bar */}
      <div className="w-full max-w-2xl mb-4 relative z-10">
        <div className={`flex justify-between text-xs ${t(theme, 'text-gray-300', 'text-gray-600')} mb-1 font-semibold`}>
          <span>XP Progress</span>
          <span>{player.xp}/{player.xpToNext}</span>
        </div>
        <div className={`h-3 ${t(theme, 'bg-gray-800/50 border-purple-500/30', 'bg-gray-200 border-purple-300')} rounded-full overflow-hidden border-2 backdrop-blur-sm`}>
          <div className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full transition-all duration-500 animate-gradient-shift" style={{ width: `${(player.xp / player.xpToNext) * 100}%` }} />
        </div>
      </div>

      {/* Daily Reward Notification */}
      {dailyReward && (
        <button onClick={() => onNavigate('rewards')} className={`w-full max-w-2xl mb-4 ${t(theme, 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/50 hover:from-yellow-500/30 hover:to-orange-500/30', 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400 hover:from-yellow-200 hover:to-orange-200')} border-2 rounded-3xl px-4 py-3 flex items-center justify-between animate-pulse transition-all backdrop-blur-xl shadow-xl relative z-10`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce">🎁</span>
            <div className="text-left">
              <div className={`text-sm font-bold ${t(theme, 'text-yellow-300', 'text-yellow-700')}`}>Daily Reward Ready!</div>
              <div className={`text-xs ${t(theme, 'text-yellow-400', 'text-yellow-600')} font-semibold`}>Day {player.dailyStreak + 1} streak</div>
            </div>
          </div>
          <span className={`text-2xl ${t(theme, 'text-yellow-400', 'text-yellow-600')} animate-bounce`}>→</span>
        </button>
      )}

      {/* Game Mode Selection */}
      <div className="w-full max-w-2xl mb-4 relative z-10">
        <h3 className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-600')} uppercase tracking-wider mb-3 font-bold text-center`}>Choose Your Mode</h3>
        <div className="grid grid-cols-2 gap-3">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMode(m.id)}
              className={`p-5 rounded-2xl border-2 transition-all duration-200 text-center min-h-[140px] flex flex-col items-center justify-center ${
                selectedMode === m.id
                  ? t(theme, 'bg-gray-800 border-gray-600', 'bg-gray-100 border-gray-400')
                  : t(theme, 'bg-gray-900/60 border-gray-700/50 hover:border-gray-600', 'bg-white border-gray-200 hover:border-gray-400')
              }`}
            >
              <div className={`mb-3 ${selectedMode === m.id ? t(theme, 'text-white', 'text-gray-900') : t(theme, 'text-gray-400', 'text-gray-600')}`}>
                {m.icon}
              </div>
              <div className={`text-lg font-bold mb-1 ${selectedMode === m.id ? t(theme, 'text-white', 'text-gray-900') : t(theme, 'text-gray-300', 'text-gray-700')}`}>
                {m.name}
              </div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                {m.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="w-full max-w-2xl mb-4 relative z-10">
        <h3 className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-600')} uppercase tracking-wider mb-3 font-bold text-center`}>Difficulty</h3>
        <div className="grid grid-cols-4 gap-2">
          {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map((d, idx) => {
            const icons = [
              <SimpleEasyIcon className="w-5 h-5" />,
              <SimpleMediumIcon className="w-5 h-5" />,
              <SimpleHardIcon className="w-5 h-5" />,
              <SimpleInsaneIcon className="w-5 h-5" />
            ];
            return (
              <button
                key={d}
                onClick={() => setSelectedDiff(d)}
                className={`py-3 px-2 rounded-xl text-sm font-bold transition-all duration-200 min-h-[60px] flex flex-col items-center justify-center gap-1 ${
                  selectedDiff === d
                    ? t(theme, 'bg-gray-800 border-gray-600 text-white', 'bg-gray-200 border-gray-400 text-gray-900')
                    : t(theme, 'bg-gray-900/60 text-gray-400 border-gray-700/50 hover:border-gray-600', 'bg-white text-gray-600 border-gray-200 hover:border-gray-400')
                } border-2`}
              >
                <div>{icons[idx]}</div>
                <div>{d.charAt(0).toUpperCase() + d.slice(1)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Play Button */}
      <button
        onClick={() => onSelectMode(selectedMode, selectedDiff)}
        className="w-full max-w-2xl py-6 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 hover:from-green-300 hover:via-emerald-400 hover:to-green-500 text-white font-black text-2xl rounded-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl shadow-green-500/50 mb-4 animate-gradient-shift border-4 border-green-300/50 relative z-10"
      >
        <span className="flex items-center justify-center gap-3">
          <span className="text-3xl animate-bounce">▶</span>
          <span>PLAY NOW</span>
        </span>
      </button>

      {/* Go Pro Button */}
      {!player.isPremium && (
        <button
          onClick={handleGoPro}
          className="w-full max-w-2xl py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-400 hover:via-pink-400 hover:to-purple-500 text-white font-bold text-lg rounded-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl shadow-purple-500/50 mb-4 animate-gradient-shift border-4 border-purple-300/50 relative z-10"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-2xl">⭐</span>
            <span>GO PRO - UNLOCK ALL</span>
          </span>
        </button>
      )}

      {/* Navigation - Primary */}
      <div className="w-full max-w-2xl mb-4 relative z-10">
        <h3 className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-600')} uppercase tracking-wider mb-3 font-bold text-center`}>Collections</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { screen: 'trophies' as Screen, icon: '🏆', label: 'Trophies', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-400/50 hover:border-yellow-400' },
            { screen: 'titles' as Screen, icon: '🎖️', label: 'Titles', color: 'from-purple-500/20 to-pink-500/20 border-purple-400/50 hover:border-purple-400' },
            { screen: 'characters' as Screen, icon: '🎭', label: 'Heroes', color: 'from-cyan-500/20 to-blue-500/20 border-cyan-400/50 hover:border-cyan-400' },
            { screen: 'chests' as Screen, icon: '🎁', label: 'Chests', color: 'from-red-500/20 to-pink-500/20 border-red-400/50 hover:border-red-400' },
            { screen: 'shop' as Screen, icon: '🛒', label: 'Shop', color: 'from-green-500/20 to-emerald-500/20 border-green-400/50 hover:border-green-400' },
          ].map(item => (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex flex-col items-center justify-center gap-2 py-4 bg-gradient-to-br ${item.color} border-2 rounded-2xl transition-all duration-300 backdrop-blur-xl hover:scale-105 shadow-lg min-h-[100px]`}
            >
              <span className="text-3xl">{item.icon}</span>
              <span className={`text-xs font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Navigation - Secondary */}
      <div className="w-full max-w-2xl mb-4 relative z-10">
        <h3 className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-600')} uppercase tracking-wider mb-3 font-bold text-center`}>Features</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { screen: 'events' as Screen, icon: '🎯', label: 'Events' },
            { screen: 'leaderboard' as Screen, icon: '📊', label: 'Ranks' },
            { screen: 'battlepass' as Screen, icon: '🎫', label: 'Pass' },
            { screen: 'achievements' as Screen, icon: '🏆', label: 'Achieve' },
            { screen: 'spinwheel' as Screen, icon: '🎰', label: 'Spin' },
            { screen: 'visualthemes' as Screen, icon: '🎨', label: 'Themes' },
            { screen: 'realmoney' as Screen, icon: '💎', label: 'Premium' },
            { screen: 'maps' as Screen, icon: '🗺️', label: 'Maps' },
            { screen: 'settings' as Screen, icon: '⚙️', label: 'Settings' },
          ].map(item => (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex flex-col items-center justify-center gap-2 py-3 ${t(theme, 'bg-gray-900/60 hover:bg-gray-800/60 border-gray-700/50 hover:border-purple-500/50', 'bg-white hover:bg-gray-50 border-gray-200 hover:border-purple-400 shadow-md')} border-2 rounded-2xl transition-all duration-300 backdrop-blur-xl hover:scale-105 min-h-[90px]`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`text-xs font-bold ${t(theme, 'text-gray-300', 'text-gray-600')}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Premium Features */}
      <div className="w-full max-w-2xl mb-4 relative z-10">
        <h3 className={`text-xs ${t(theme, 'text-gray-300', 'text-gray-600')} uppercase tracking-wider mb-2 font-bold text-center`}>Premium Features</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('subscription')}
            className={`flex items-center gap-2 p-3 ${
              player.isPremium 
                ? t(theme, 'bg-gray-800 border-gray-600', 'bg-gray-100 border-gray-400')
                : t(theme, 'bg-gray-900/60 border-gray-700/50 hover:border-gray-600', 'bg-white border-gray-200 hover:border-gray-400')
            } border-2 rounded-lg transition-all duration-200 min-h-[70px]`}
          >
            <div className="text-2xl flex-shrink-0">{player.isPremium ? '⭐' : '🎫'}</div>
            <div className="text-left flex-1 min-w-0">
              <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} truncate`}>
                {player.isPremium ? 'Premium Active' : 'Snake Pass'}
              </div>
              <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                {player.isPremium ? 'All features unlocked' : 'Unlock all premium features'}
              </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('battlepass')}
            className={`flex items-center gap-2 p-3 ${t(theme, 'bg-gray-900/60 border-gray-700/50 hover:border-gray-600', 'bg-white border-gray-200 hover:border-gray-400')} border-2 rounded-lg transition-all duration-200 min-h-[70px]`}
          >
            <div className="text-2xl flex-shrink-0">🎖️</div>
            <div className="text-left flex-1 min-w-0">
              <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} truncate`}>Battle Pass</div>
              <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Season Level {player.battlePassLevel}</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('online')}
            className={`flex items-center gap-2 p-3 ${t(theme, 'bg-gray-900/60 border-gray-700/50 hover:border-gray-600', 'bg-white border-gray-200 hover:border-gray-400')} border-2 rounded-lg transition-all duration-200 min-h-[70px]`}
          >
            <div className="text-2xl flex-shrink-0">🌐</div>
            <div className="text-left flex-1 min-w-0">
              <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} truncate`}>Online Play</div>
              <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Compete with friends</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('google')}
            className={`flex items-center gap-2 p-3 ${t(theme, 'bg-gray-900/60 border-gray-700/50 hover:border-gray-600', 'bg-white border-gray-200 hover:border-gray-400')} border-2 rounded-lg transition-all duration-200 min-h-[70px]`}
          >
            <div className="text-2xl flex-shrink-0">{player.googleAccount ? '✅' : '🔐'}</div>
            <div className="text-left flex-1 min-w-0">
              <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} truncate`}>Cloud Save</div>
              <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                {player.googleAccount ? 'Synced to cloud' : 'Connect to save progress'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="w-full max-w-2xl relative z-10">
        <h3 className={`text-xs ${t(theme, 'text-gray-300', 'text-gray-600')} uppercase tracking-wider mb-2 font-bold text-center`}>Your Stats</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className={`${t(theme, 'bg-gray-900/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-lg p-2 text-center border-2 min-h-[60px] flex flex-col items-center justify-center`}>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.gamesPlayed}</div>
            <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')} font-semibold mt-0.5`}>Games</div>
          </div>
          <div className={`${t(theme, 'bg-gray-900/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-lg p-2 text-center border-2 min-h-[60px] flex flex-col items-center justify-center`}>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.totalScore}</div>
            <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')} font-semibold mt-0.5`}>Score</div>
          </div>
          <div className={`${t(theme, 'bg-gray-900/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-lg p-2 text-center border-2 min-h-[60px] flex flex-col items-center justify-center`}>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.trophies.length}/{TROPHIES.length}</div>
            <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')} font-semibold mt-0.5`}>Trophies</div>
          </div>
          <div className={`${t(theme, 'bg-gray-900/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-lg p-2 text-center border-2 min-h-[60px] flex flex-col items-center justify-center`}>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.titles.length}/{TITLES.length}</div>
            <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')} font-semibold mt-0.5`}>Titles</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PROFILE SCREEN ============
export function ProfileScreen({ player, setPlayer, onBack, onNavigate, theme, toggleTheme }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void; onNavigate?: (screen: Screen) => void; theme: Theme; toggleTheme: () => void }) {
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
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4`}>
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} className={`px-3 py-1.5 ${t(theme, 'bg-black hover:bg-gray-900 text-white border-white', 'bg-white hover:bg-gray-100 text-black border-black')} rounded-lg text-sm border-2`}>← Back</button>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>
        
        {/* Profile Card */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-2xl p-5 border-2 mb-4 text-center`}>
          <button onClick={() => setShowAvatarPicker(!showAvatarPicker)} className={`w-20 h-20 ${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-full flex items-center justify-center text-4xl border-2 mx-auto mb-3 hover:scale-105 transition-all`}>
            {player.avatar}
          </button>
          
          {showAvatarPicker && (
            <div className={`grid grid-cols-8 gap-1 mb-3 ${t(theme, 'bg-black', 'bg-white')} rounded-xl p-2 border-2 ${t(theme, 'border-white', 'border-black')}`}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => changeAvatar(a)} className={`text-lg p-0.5 rounded ${player.avatar === a ? t(theme, 'bg-white text-black', 'bg-black text-white') : t(theme, 'hover:bg-gray-900', 'hover:bg-gray-100')}`}>{a}</button>
              ))}
            </div>
          )}

          {editing ? (
            <div className="flex gap-2 justify-center">
              <input value={newUsername} onChange={e => setNewUsername(e.target.value)} className={`px-3 py-1 ${t(theme, 'bg-black border-white text-white', 'bg-white border-black text-black')} border-2 rounded-lg text-center text-sm`} maxLength={16} />
              <button onClick={handleSave} className={`px-3 py-1 ${t(theme, 'bg-white text-black', 'bg-black text-white')} rounded-lg text-sm font-bold`}>✓</button>
            </div>
          ) : (
            <div>
              <h2 className={`text-xl font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.username}</h2>
              <button onClick={() => setEditing(true)} className={`text-xs ${t(theme, 'text-gray-400 hover:text-white', 'text-gray-600 hover:text-black')}`}>Edit</button>
            </div>
          )}
          
          <div className="mt-2 flex flex-wrap gap-2 justify-center">
            <span className={`px-3 py-1 ${t(theme, 'bg-white text-black', 'bg-black text-white')} rounded-full text-sm font-bold`}>Level {player.level}</span>
            {player.equippedTitle && onNavigate && (
              <button onClick={() => onNavigate('titles')} className={`px-3 py-1 ${t(theme, 'bg-white text-black hover:bg-gray-200', 'bg-black text-white hover:bg-gray-800')} rounded-full text-sm font-bold flex items-center gap-1 transition-all`}>
                {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name} →
              </button>
            )}
            {player.equippedTitle && !onNavigate && (
              <span className={`px-3 py-1 ${t(theme, 'bg-white text-black', 'bg-black text-white')} rounded-full text-sm font-bold flex items-center gap-1`}>
                {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name}
              </span>
            )}
          </div>
        </div>

        {/* XP Bar */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-xl p-3 mb-4 border-2`}>
          <div className={`flex justify-between text-xs ${t(theme, 'text-white', 'text-black')} mb-1`}>
            <span>Experience</span>
            <span>{player.xp} / {player.xpToNext} XP</span>
          </div>
          <div className={`h-3 ${t(theme, 'bg-gray-900', 'bg-gray-200')} rounded-full overflow-hidden`}>
            <div className={`h-full ${t(theme, 'bg-white', 'bg-black')} rounded-full transition-all`} style={{ width: `${(player.xp / player.xpToNext) * 100}%` }} />
          </div>
        </div>

        {/* Currency */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-xl p-3 border-2 text-center`}>
            <div className="text-2xl mb-1">🪙</div>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.coins}</div>
            <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Coins</div>
          </div>
          <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-xl p-3 border-2 text-center`}>
            <div className="text-2xl mb-1">💎</div>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.gems}</div>
            <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Gems</div>
          </div>
        </div>

        {/* Stats */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-xl p-4 border-2 mb-4`}>
          <h3 className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')} mb-3`}>📊 Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Games Played</span>
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.gamesPlayed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Total Score</span>
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.totalScore}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Food Eaten</span>
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.totalFoodEaten}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Longest Snake</span>
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.longestSnake}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Daily Streak</span>
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.dailyStreak} 🔥</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Trophies</span>
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.trophies.length}/{TROPHIES.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Titles</span>
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.titles.length}/{TITLES.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Bot Wins</span>
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.gamesWonVsBot}</span>
            </div>
          </div>
        </div>

        {/* High Scores */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-xl p-4 border-2`}>
          <h3 className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')} mb-3`}>🏅 High Scores</h3>
          <div className="space-y-3">
            {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
              <div key={d} className="flex justify-between items-center">
                <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} font-medium`}>{DIFFICULTY_LABELS[d]}</span>
                <div className="flex gap-4">
                  <div className="text-right">
                    <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-500')}`}>Classic</div>
                    <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.highScores[d]}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-500')}`}>Timed</div>
                    <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.timedHighScores[d]}</div>
                  </div>
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
export function TrophiesScreen({ player, onBack, theme }: { player: Player; onBack: () => void; theme: Theme }) {
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
export function ShopScreen({ player, setPlayer, onBack, theme }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void; theme: Theme }) {
  const [tab, setTab] = useState<'skins' | 'trails'>('skins');

  const buyItem = (item: ShopItem) => {
    const isOwned = item.type === 'skin' ? player.ownedSkins.includes(item.id) : player.ownedTrails.includes(item.id);
    if (isOwned) {
      // Equip
      audioManager.playClickSound();
      const updated = item.type === 'skin' 
        ? { ...player, equippedSkin: item.id }
        : { ...player, equippedTrail: item.id };
      setPlayer(updated);
      savePlayer(updated);
      return;
    }

    const currency = item.currency === 'coins' ? 'coins' : 'gems';
    if (player[currency] < item.price) return;

    audioManager.playSuccessSound();

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
export function EventsScreen({ player, setPlayer, onBack, theme }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void; theme: Theme }) {
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
export function LeaderboardScreen({ player, onBack, theme }: { player: Player; onBack: () => void; theme: Theme }) {
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
            const playerTitle = isPlayer && player.equippedTitle ? TITLES.find(t => t.id === player.equippedTitle) : null;
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
export function RewardsScreen({ player, setPlayer, onBack, theme }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void; theme: Theme }) {
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
export function SettingsScreen({ player, onBack, onLogout, theme, toggleTheme }: { player: Player; onBack: () => void; onLogout: () => void; theme: Theme; toggleTheme: () => void }) {
  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>← Back</button>
        
        <h2 className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')} text-center mb-6`}>⚙️ Settings</h2>

        <div className="space-y-3">
          {/* Theme Toggle */}
          <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border`}>
            <h3 className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>🎨 Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${t(theme, 'text-white', 'text-gray-900')}`}>Theme</div>
                <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</div>
              </div>
              <button
                onClick={toggleTheme}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  theme === 'dark' 
                    ? 'bg-yellow-500 hover:bg-yellow-400 text-gray-900' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>

          <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border`}>
            <h3 className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Account</h3>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{player.avatar}</span>
              <div>
                <div className={`text-sm font-medium ${t(theme, 'text-white', 'text-gray-900')}`}>{player.username}</div>
                <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Level {player.level} • ID: {player.id.slice(0, 8)}</div>
              </div>
            </div>
          </div>

          <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border`}>
            <h3 className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Game Info</h3>
            <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} space-y-1`}>
              <p>• Progress is saved locally in your browser</p>
              <p>• Use the same browser to continue your progress</p>
              <p>• Clearing browser data will reset your progress</p>
            </div>
          </div>

          <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border`}>
            <h3 className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Controls</h3>
            <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} space-y-1`}>
              <p>🖥️ <b>Desktop:</b> Arrow keys or WASD to move</p>
              <p>📱 <b>Mobile:</b> Swipe or use D-pad buttons</p>
              <p>👥 <b>Multiplayer:</b> P1: WASD, P2: IJKL</p>
              <p>⏸️ <b>Pause:</b> Space or Escape</p>
            </div>
          </div>

          <button onClick={onLogout} className={`w-full py-3 ${t(theme, 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border-red-700/30', 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200')} font-medium rounded-xl border transition-all`}>
            🚪 Switch Account
          </button>

          <div className={`text-center ${t(theme, 'text-gray-600', 'text-gray-500')} text-xs mt-4`}>
            <p>Snake Game v2.0</p>
            <p>Made with ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TITLES SCREEN ============
export function TitlesScreen({ player, setPlayer, onBack, theme }: { player: Player; setPlayer: (p: Player) => void; onBack: () => void; theme: Theme }) {
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
            const isUnlocked = player.titles?.includes(title.id) || false;
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
