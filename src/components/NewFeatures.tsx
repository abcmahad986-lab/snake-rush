import { useState, useEffect } from 'react';
import { Player, Theme, ACHIEVEMENTS, SPIN_WHEEL_SEGMENTS, VISUAL_THEMES, VisualTheme } from '../types';
import { savePlayer } from '../store';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// ============ ACHIEVEMENTS SCREEN ============
export function AchievementsScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const [filter, setFilter] = useState<string>('all');
  const categories = ['all', 'gameplay', 'collection', 'social', 'special'];
  
  const filtered = filter === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === filter);
  const unlocked = player.unlockedAchievements.length;

  const rarityColors: Record<string, string> = {
    bronze: 'from-amber-700 to-amber-900 border-amber-600/30',
    silver: 'from-gray-400 to-gray-600 border-gray-400/30',
    gold: 'from-yellow-500 to-yellow-700 border-yellow-400/30',
    platinum: 'from-cyan-400 to-cyan-600 border-cyan-400/30',
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>
        
        <div className="text-center mb-4">
          <h2 className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>🏅 Achievements</h2>
          <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>{unlocked}/{ACHIEVEMENTS.length} Unlocked</p>
        </div>

        {/* Progress */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-3 mb-4 border`}>
          <div className={`h-3 ${t(theme, 'bg-gray-900', 'bg-gray-200')} rounded-full overflow-hidden`}>
            <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 rounded-full transition-all" style={{ width: `${(unlocked / ACHIEVEMENTS.length) * 100}%` }} />
          </div>
          <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mt-1 text-center`}>{Math.floor((unlocked / ACHIEVEMENTS.length) * 100)}% Complete</div>
        </div>

        {/* Filter */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === c ? 'bg-green-600 text-white' : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')}`}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievement List */}
        <div className="space-y-2">
          {filtered.map(achievement => {
            const isUnlocked = player.unlockedAchievements.includes(achievement.id);
            return (
              <div key={achievement.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isUnlocked ? `bg-gradient-to-r ${rarityColors[achievement.rarity]}` : t(theme, 'bg-gray-800/40 border-gray-700/30 opacity-60', 'bg-gray-100 border-gray-300 opacity-60')}`}>
                <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{achievement.name}</div>
                  <div className={`text-[10px] ${t(theme, 'text-gray-400', 'text-gray-600')}`}>{achievement.description}</div>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[10px] text-yellow-400">+{achievement.xpReward} XP</span>
                    <span className="text-[10px] text-yellow-500">+{achievement.coinReward} 🪙</span>
                  </div>
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full ${
                  achievement.rarity === 'bronze' ? 'bg-amber-900/50 text-amber-400' :
                  achievement.rarity === 'silver' ? 'bg-gray-600/50 text-gray-300' :
                  achievement.rarity === 'gold' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-cyan-900/50 text-cyan-400'
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

// ============ SPIN WHEEL SCREEN ============
export function SpinWheelScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [showReward, setShowReward] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const canSpin = player.dailySpin.lastSpinDate !== today;

  const spin = () => {
    if (!canSpin || spinning) return;

    audioManager.playClickSound();
    setSpinning(true);
    setShowReward(false);
    setSelectedSegment(null);

    // Random segment (weighted by rarity)
    const weights = SPIN_WHEEL_SEGMENTS.map(s => 
      s.rarity === 'common' ? 40 : s.rarity === 'rare' ? 30 : s.rarity === 'epic' ? 20 : 10
    );
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    // Calculate rotation (5 full spins + offset to selected segment)
    const segmentAngle = 360 / SPIN_WHEEL_SEGMENTS.length;
    const targetRotation = rotation + (5 * 360) + (360 - (selectedIndex * segmentAngle));
    
    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      setSelectedSegment(selectedIndex);
      setShowReward(true);
      
      // Apply reward
      const segment = SPIN_WHEEL_SEGMENTS[selectedIndex];
      const updated = { ...player };
      
      if (segment.type === 'coins') {
        updated.coins += segment.amount;
      } else if (segment.type === 'gems') {
        updated.gems += segment.amount;
      } else if (segment.type === 'xp') {
        let newXp = updated.xp + segment.amount;
        let newLevel = updated.level;
        let xpToNext = updated.xpToNext;
        
        while (newXp >= xpToNext) {
          newXp -= xpToNext;
          newLevel++;
          xpToNext = Math.floor(xpToNext * 1.5);
        }
        
        updated.xp = newXp;
        updated.level = newLevel;
        updated.xpToNext = xpToNext;
      }
      
      updated.dailySpin = {
        lastSpinDate: today,
        spinsToday: 1,
        totalSpins: player.dailySpin.totalSpins + 1,
      };
      
      audioManager.playSuccessSound();
      setPlayer(updated);
      savePlayer(updated);
    }, 4000);
  };

  const segmentAngle = 360 / SPIN_WHEEL_SEGMENTS.length;

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>
        
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>🎰 Daily Spin Wheel</h2>
          <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Spin once per day for rewards!</p>
        </div>

        {/* Wheel */}
        <div className="relative w-80 h-80 mx-auto mb-6">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 text-4xl">
            ▼
          </div>
          
          {/* Wheel */}
          <div 
            className="w-full h-full rounded-full border-4 border-yellow-500 relative overflow-hidden transition-transform duration-4000 ease-out"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? '4s' : '0s'
            }}
          >
            {SPIN_WHEEL_SEGMENTS.map((segment, i) => {
              const startAngle = i * segmentAngle;
              const endAngle = (i + 1) * segmentAngle;
              const largeRadius = 200;
              
              const x1 = 160 + largeRadius * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 160 + largeRadius * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 160 + largeRadius * Math.cos((endAngle - 90) * Math.PI / 180);
              const y2 = 160 + largeRadius * Math.sin((endAngle - 90) * Math.PI / 180);
              
              const pathData = `M 160 160 L ${x1} ${y1} A ${largeRadius} ${largeRadius} 0 0 1 ${x2} ${y2} Z`;
              
              const midAngle = (startAngle + endAngle) / 2;
              const textRadius = 100;
              const textX = 160 + textRadius * Math.cos((midAngle - 90) * Math.PI / 180);
              const textY = 160 + textRadius * Math.sin((midAngle - 90) * Math.PI / 180);
              
              return (
                <g key={segment.id}>
                  <svg viewBox="0 0 320 320" className="absolute inset-0 w-full h-full">
                    <path d={pathData} fill={segment.color} stroke="white" strokeWidth="2" />
                    <text 
                      x={textX} 
                      y={textY} 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                      className="text-xs font-bold fill-white"
                      style={{ fontSize: '12px' }}
                    >
                      {segment.icon}
                    </text>
                  </svg>
                </g>
              );
            })}
          </div>
        </div>

        {/* Spin Button */}
        <button
          onClick={spin}
          disabled={!canSpin || spinning}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            canSpin && !spinning
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white transform hover:scale-105 active:scale-95'
              : t(theme, 'bg-gray-700 text-gray-500 cursor-not-allowed', 'bg-gray-300 text-gray-500 cursor-not-allowed')
          }`}
        >
          {spinning ? '🎰 Spinning...' : canSpin ? '🎯 SPIN NOW!' : '✅ Come Back Tomorrow'}
        </button>

        {/* Reward Modal */}
        {showReward && selectedSegment !== null && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${t(theme, 'bg-gray-800 border-gray-700', 'bg-white border-gray-300')} rounded-2xl p-6 max-w-sm w-full border text-center`}>
              <div className="text-6xl mb-4 animate-bounce">
                {SPIN_WHEEL_SEGMENTS[selectedSegment].icon}
              </div>
              <h3 className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>
                You Won!
              </h3>
              <p className={`text-lg ${t(theme, 'text-gray-300', 'text-gray-700')} mb-4`}>
                {SPIN_WHEEL_SEGMENTS[selectedSegment].label}
              </p>
              <button
                onClick={() => setShowReward(false)}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ VISUAL THEMES SCREEN ============
export function VisualThemesScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const buyTheme = (themeId: VisualTheme) => {
    const themeConfig = VISUAL_THEMES.find(t => t.id === themeId);
    if (!themeConfig) return;
    
    if (player.ownedVisualThemes.includes(themeId)) {
      // Equip
      const updated = { ...player, activeVisualTheme: themeId };
      setPlayer(updated);
      savePlayer(updated);
      audioManager.playClickSound();
      return;
    }

    const currency = themeConfig.currency;
    if (player[currency] < themeConfig.price) return;

    audioManager.playSuccessSound();

    const updated = { 
      ...player, 
      [currency]: player[currency] - themeConfig.price,
      ownedVisualThemes: [...player.ownedVisualThemes, themeId],
      activeVisualTheme: themeId,
    };
    
    setPlayer(updated);
    savePlayer(updated);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>
        
        <div className="text-center mb-4">
          <h2 className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>🎨 Visual Themes</h2>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-sm text-yellow-400">🪙 {player.coins}</span>
            <span className="text-sm text-purple-400">💎 {player.gems}</span>
          </div>
        </div>

        <div className="space-y-3">
          {VISUAL_THEMES.map(themeConfig => {
            const isOwned = player.ownedVisualThemes.includes(themeConfig.id);
            const isActive = player.activeVisualTheme === themeConfig.id;
            const canAfford = themeConfig.currency === 'coins' ? player.coins >= themeConfig.price : player.gems >= themeConfig.price;

            return (
              <div key={themeConfig.id} className={`relative overflow-hidden rounded-xl border-2 ${isActive ? 'ring-2 ring-green-500' : ''} ${t(theme, 'border-gray-700/50', 'border-gray-300')}`}>
                {/* Preview */}
                <div className={`h-32 bg-gradient-to-br ${themeConfig.backgroundGradient} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">{themeConfig.icon}</div>
                  </div>
                  {/* Particle preview */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    {themeConfig.particleColors.map((color, i) => (
                      <div key={i} className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: color, animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>

                {/* Info */}
                <div className={`${t(theme, 'bg-gray-800/60', 'bg-white')} p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{themeConfig.name}</div>
                      <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>{themeConfig.description}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => buyTheme(themeConfig.id)}
                    disabled={!isOwned && !canAfford}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive ? 'bg-green-600/30 text-green-400 border border-green-500/30' :
                      isOwned ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30 hover:bg-blue-600/50' :
                      canAfford ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-600/50' :
                      t(theme, 'bg-gray-700/30 text-gray-500 border border-gray-600/30 cursor-not-allowed', 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed')
                    } border`}
                  >
                    {isActive ? '✓ Active' : isOwned ? 'Equip' : `${themeConfig.currency === 'coins' ? '🪙' : '💎'} ${themeConfig.price}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
