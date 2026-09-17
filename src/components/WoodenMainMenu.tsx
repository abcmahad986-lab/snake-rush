import { useState } from 'react';
import { Player, Screen, Difficulty, GameMode, TROPHIES, TITLES, Theme } from '../types';
import { getLoginReward } from '../store';
import { audioManager } from '../audio';
import { ClassicIcon, TimedIcon, MultiplayerIcon, ZenIcon, PlayArrowIcon, TrophyIcon, TitleIcon, HeroIcon, ChestIcon, ShopIcon, EventsIcon, RanksIcon, PassIcon, AchieveIcon, SpinIcon, ThemesIcon, PremiumIcon, MapsIcon } from './WoodenIcons';

// Wooden UI Main Menu Component
export function WoodenMainMenu({ player, onSelectMode, onNavigate, theme, toggleTheme }: {
  player: Player;
  onSelectMode: (mode: GameMode, difficulty: Difficulty) => void;
  onNavigate: (screen: Screen) => void;
  theme: Theme;
  toggleTheme: () => void;
}) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('medium');

  const modes: { id: GameMode; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'classic', name: 'CLASSIC', desc: 'Endless snake fun', icon: <ClassicIcon className="w-20 h-20" /> },
    { id: 'timed', name: 'TIMED', desc: 'Score in 60 seconds', icon: <TimedIcon className="w-20 h-20" /> },
    { id: 'multiplayer', name: 'MULTIPLAYER', desc: 'vs Bot or vs Player', icon: <MultiplayerIcon className="w-20 h-20" /> },
    { id: 'zen', name: 'ZEN', desc: 'Pass through walls!', icon: <ZenIcon className="w-20 h-20" /> },
  ];

  const dailyReward = getLoginReward(player);

  const handleGoPro = () => {
    if (player.googleAccount) {
      import('../lib/lemonsqueezy').then(({ openLemonSqueezyCheckout, PRODUCT_IDS }) => {
        openLemonSqueezyCheckout(PRODUCT_IDS.SNAKE_PASS_PREMIUM, {
          userId: player.id,
          userEmail: player.googleAccount!,
          username: player.username,
        });
      });
    } else {
      onNavigate('google');
    }
  };

  const featureButtons = [
    { screen: 'trophies' as Screen, icon: <TrophyIcon className="w-8 h-8" />, label: 'Trophies' },
    { screen: 'titles' as Screen, icon: <TitleIcon className="w-8 h-8" />, label: 'Titles' },
    { screen: 'characters' as Screen, icon: <HeroIcon className="w-8 h-8" />, label: 'Heroes' },
    { screen: 'chests' as Screen, icon: <ChestIcon className="w-8 h-8" />, label: 'Chests' },
    { screen: 'shop' as Screen, icon: <ShopIcon className="w-8 h-8" />, label: 'Shop' },
    { screen: 'events' as Screen, icon: <EventsIcon className="w-8 h-8" />, label: 'Events' },
    { screen: 'leaderboard' as Screen, icon: <RanksIcon className="w-8 h-8" />, label: 'Ranks' },
    { screen: 'battlepass' as Screen, icon: <PassIcon className="w-8 h-8" />, label: 'Pass' },
    { screen: 'achievements' as Screen, icon: <AchieveIcon className="w-8 h-8" />, label: 'Achieve' },
  ];

  const difficultyPips = (level: number) => {
    const pips = [];
    for (let i = 0; i < level; i++) {
      pips.push(<div key={i} className="w-2 h-2 bg-current rounded-sm" />);
    }
    return <div className="flex gap-1">{pips}</div>;
  };

  return (
    <div className="min-h-screen bg-[#2d1b4e] flex flex-col items-center p-3 sm:p-4 md:p-6 relative">
      {/* Main Container - Stacks on mobile, 3 columns on desktop */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 md:gap-6">
        
        {/* Left Column - Player Profile */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 order-1">
          <div className="wood-panel wood-snake-scales p-4 sm:p-6 mb-4">
            <div className="text-center mb-4">
              <div className="text-5xl sm:text-6xl mb-2 sm:mb-3">{player.avatar}</div>
              <h2 className="text-xl sm:text-2xl font-bold wood-text-light mb-1 truncate">{player.username}</h2>
              <p className="text-xs sm:text-sm wood-text-light opacity-80 truncate">
                RANK {player.level} | {TITLES.find(ti => ti.id === player.equippedTitle)?.name || 'Newbie'}
              </p>
            </div>

            {/* XP Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] sm:text-xs wood-text-light mb-2">
                <span>XP PROGRESS</span>
                <span>{player.xp}/{player.xpToNext}</span>
              </div>
              <div className="h-5 sm:h-6 wood-panel-dark rounded-full overflow-hidden border-2 border-[#4A3728]">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 relative"
                  style={{ width: `${(player.xp / player.xpToNext) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Currency Counters */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="wood-button p-2 sm:p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold wood-text-light">{player.coins}</div>
                <div className="text-[10px] sm:text-xs wood-text-light opacity-80">COINS</div>
              </div>
              <div className="wood-button p-2 sm:p-3 text-center">
                <div className="text-xl sm:text-2xl font-bold wood-text-light">{player.gems}</div>
                <div className="text-[10px] sm:text-xs wood-text-light opacity-80">GEMS</div>
              </div>
            </div>
          </div>

          {/* Daily Reward */}
          {dailyReward && (
            <button 
              onClick={() => onNavigate('rewards')}
              className="wood-panel wood-snake-scales p-3 sm:p-4 w-full hover:scale-105 transition-transform mb-4 lg:mb-0"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl">🎁</span>
                <div className="text-left flex-1">
                  <div className="text-xs sm:text-sm font-bold wood-text-light">Daily Reward Ready!</div>
                  <div className="text-[10px] sm:text-xs wood-text-light opacity-80">Day {player.dailyStreak + 1} streak</div>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Center Column - Game Modes & Actions */}
        <div className="flex-1 order-2">
          {/* Game Mode Selection */}
          <div className="wood-panel wood-snake-scales p-4 sm:p-6 mb-4">
            <h3 className="text-sm sm:text-lg font-bold wood-text-light mb-3 sm:mb-4 text-center">SELECT GAME MODE</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    audioManager.playClickSound();
                    setSelectedMode(m.id);
                  }}
                  className={`wood-button p-3 sm:p-6 transition-all ${
                    selectedMode === m.id ? 'wood-button-selected scale-105' : ''
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`mb-2 sm:mb-3 ${selectedMode === m.id ? 'text-white' : 'wood-text-light'}`}>
                      <div className="w-12 h-12 sm:w-20 sm:h-20">{m.icon}</div>
                    </div>
                    <div className={`text-xs sm:text-lg font-bold mb-1 ${selectedMode === m.id ? 'text-white' : 'wood-text-light'}`}>
                      {m.name}
                    </div>
                    <div className="text-[9px] sm:text-xs wood-text-light opacity-80 hidden sm:block">
                      {m.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="wood-panel wood-snake-scales p-4 sm:p-6 mb-4">
            <h3 className="text-sm sm:text-lg font-bold wood-text-light mb-3 sm:mb-4 text-center">DIFFICULTY</h3>
            <div className="flex gap-2 sm:gap-3">
              {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map((d, idx) => (
                <button
                  key={d}
                  onClick={() => {
                    audioManager.playClickSound();
                    setSelectedDiff(d);
                  }}
                  className={`flex-1 wood-button py-2 sm:py-4 transition-all ${
                    selectedDiff === d ? 'wood-button-selected scale-105' : ''
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2">
                    <div className={selectedDiff === d ? 'text-white' : 'wood-text-light'}>
                      {difficultyPips(idx + 1)}
                    </div>
                    <div className={`text-[10px] sm:text-xs font-bold uppercase ${selectedDiff === d ? 'text-white' : 'wood-text-light'}`}>
                      {d}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={() => {
              audioManager.playClickSound();
              onSelectMode(selectedMode, selectedDiff);
            }}
            className="wood-button wood-snake-scales w-full py-4 sm:py-6 mb-4 hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <PlayArrowIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              <span className="text-lg sm:text-2xl font-bold wood-text-light">PLAY NOW</span>
            </div>
          </button>

          {/* Go Pro Button */}
          {!player.isPremium && (
            <button
              onClick={handleGoPro}
              className="wood-panel wood-purple wood-snake-scales w-full py-3 sm:py-4 mb-4 hover:scale-105 transition-transform"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl sm:text-2xl">⭐</span>
                <span className="text-sm sm:text-lg font-bold wood-text-light">GO PRO - UNLOCK ALL</span>
              </div>
            </button>
          )}
        </div>

        {/* Right Column - Feature Grid */}
        <div className="w-full lg:w-80 lg:flex-shrink-0 order-3">
          <div className="wood-panel wood-snake-scales p-4 sm:p-6 mb-4">
            <h3 className="text-sm sm:text-lg font-bold wood-text-light mb-3 sm:mb-4 text-center">FEATURES</h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {featureButtons.map(item => (
                <button
                  key={item.screen}
                  onClick={() => {
                    audioManager.playClickSound();
                    onNavigate(item.screen);
                  }}
                  className="wood-circle w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center gap-1 hover:scale-110 transition-transform"
                >
                  <div className="wood-text-light scale-75 sm:scale-100">{item.icon}</div>
                  <div className="text-[8px] sm:text-[10px] wood-text-light font-bold">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Controls */}
          <div className="wood-panel wood-snake-scales p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => onNavigate('settings')}
                className="wood-button py-2 sm:py-3 hover:scale-105 transition-transform"
              >
                <div className="text-[10px] sm:text-xs font-bold wood-text-light">⚙️ Settings</div>
              </button>
              <button 
                onClick={() => onNavigate('profile')}
                className="wood-button py-2 sm:py-3 hover:scale-105 transition-transform"
              >
                <div className="text-[10px] sm:text-xs font-bold wood-text-light">👤 Profile</div>
              </button>
              <button 
                onClick={() => onNavigate('spinwheel')}
                className="wood-button py-2 sm:py-3 hover:scale-105 transition-transform"
              >
                <div className="text-[10px] sm:text-xs font-bold wood-text-light">🎰 Spin</div>
              </button>
              <button 
                onClick={() => onNavigate('visualthemes')}
                className="wood-button py-2 sm:py-3 hover:scale-105 transition-transform"
              >
                <div className="text-[10px] sm:text-xs font-bold wood-text-light">🎨 Themes</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary at Bottom */}
      <div className="w-full max-w-6xl mt-4 sm:mt-6">
        <div className="wood-panel wood-snake-scales p-3 sm:p-4">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold wood-text-light">{player.gamesPlayed}</div>
              <div className="text-[9px] sm:text-xs wood-text-light opacity-80">GAMES</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-3xl font-bold wood-text-light">{player.totalScore}</div>
              <div className="text-[9px] sm:text-xs wood-text-light opacity-80">SCORE</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-3xl font-bold wood-text-light">{player.trophies.length}/{TROPHIES.length}</div>
              <div className="text-[9px] sm:text-xs wood-text-light opacity-80">TROPHIES</div>
            </div>
            <div className="text-center">
              <div className="text-sm sm:text-3xl font-bold wood-text-light">{player.titles.length}/{TITLES.length}</div>
              <div className="text-[9px] sm:text-xs wood-text-light opacity-80">TITLES</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
