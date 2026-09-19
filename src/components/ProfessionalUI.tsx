import { useState, useEffect } from 'react';
import { Player, Theme } from '../types';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// ============ PROFESSIONAL SPLASH SCREEN ============
export function SplashScreen({ onFinish, theme }: { onFinish: () => void; theme: Theme }) {
  const [progress, setProgress] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    setShowLogo(true);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinish, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900', 'bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100')} flex flex-col items-center justify-center p-4`}>
      {/* Animated Logo */}
      <div className={`transition-all duration-1000 ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <div className="text-9xl mb-6 animate-bounce">🐍</div>
      </div>

      {/* Game Title */}
      <div className={`transition-all duration-1000 delay-300 ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <h1 className={`text-6xl font-black ${t(theme, 'text-white', 'text-gray-900')} mb-2 tracking-wider`}>
          SNAKE RUSH
        </h1>
        <p className={`text-xl ${t(theme, 'text-purple-200', 'text-purple-700')} font-semibold`}>
          The Ultimate Snake Experience
        </p>
      </div>

      {/* Loading Bar */}
      <div className={`mt-12 w-64 transition-all duration-1000 delay-500 ${showLogo ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`h-2 ${t(theme, 'bg-white/20', 'bg-gray-300')} rounded-full overflow-hidden`}>
          <div 
            className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={`text-center mt-3 text-sm ${t(theme, 'text-white/60', 'text-gray-600')}`}>
          Loading... {progress}%
        </div>
      </div>

      {/* Version Info */}
      <div className={`absolute bottom-8 text-xs ${t(theme, 'text-white/40', 'text-gray-500')}`}>
        Version 3.0.0 • © 2026 Snake Rush Studios
      </div>
    </div>
  );
}

// ============ PROFESSIONAL ONBOARDING ============
export function OnboardingScreen({ onComplete, theme }: { onComplete: () => void; theme: Theme }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: '🐍',
      title: 'Welcome to Snake Rush!',
      description: 'The ultimate snake gaming experience with multiple modes, characters, and challenges!',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: '🎮',
      title: '6 Game Modes',
      description: 'Classic, Timed, Multiplayer, Zen, Survival, and Competitive modes with unique gameplay!',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: '🎭',
      title: '25 Unique Characters',
      description: 'Unlock heroes as you level up! Each with 3 unique skins and special abilities!',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: '🏆',
      title: 'Compete & Win',
      description: 'Climb the leaderboard, earn achievements, and become the ultimate Snake Master!',
      color: 'from-yellow-500 to-orange-600'
    }
  ];

  const nextSlide = () => {
    audioManager.playClickSound();
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    audioManager.playClickSound();
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} flex flex-col items-center justify-center p-6`}>
      {/* Skip Button */}
      <button
        onClick={skipOnboarding}
        className={`absolute top-6 right-6 px-4 py-2 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300', 'bg-white hover:bg-gray-100 text-gray-700')} rounded-lg text-sm font-semibold border-2 ${t(theme, 'border-gray-700', 'border-gray-300')} transition-all`}
      >
        Skip →
      </button>

      {/* Slide Content */}
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className={`text-9xl mb-8 animate-bounce`}>
          {slide.icon}
        </div>

        {/* Title */}
        <h2 className={`text-4xl font-black ${t(theme, 'text-white', 'text-gray-900')} mb-4`}>
          {slide.title}
        </h2>

        {/* Description */}
        <p className={`text-lg ${t(theme, 'text-gray-300', 'text-gray-600')} mb-12 leading-relaxed`}>
          {slide.description}
        </p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? `bg-gradient-to-r ${slide.color} scale-125`
                  : t(theme, 'bg-gray-700', 'bg-gray-300')
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className={`w-full py-4 bg-gradient-to-r ${slide.color} hover:opacity-90 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-2xl`}
        >
          {currentSlide === slides.length - 1 ? '🎮 Start Playing!' : 'Next →'}
        </button>
      </div>

      {/* Slide Counter */}
      <div className={`absolute bottom-8 text-sm ${t(theme, 'text-gray-500', 'text-gray-400')}`}>
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}

// ============ PROFESSIONAL DAILY REWARD CALENDAR ============
export function DailyRewardCalendar({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const [showClaimAnimation, setShowClaimAnimation] = useState(false);
  const [claimedDay, setClaimedDay] = useState<number | null>(null);

  const rewards = [
    { day: 1, coins: 100, gems: 5, icon: '🎁' },
    { day: 2, coins: 150, gems: 8, icon: '🎀' },
    { day: 3, coins: 200, gems: 10, icon: '🎊' },
    { day: 4, coins: 250, gems: 12, icon: '🎉' },
    { day: 5, coins: 300, gems: 15, icon: '🏆' },
    { day: 6, coins: 400, gems: 20, icon: '💎' },
    { day: 7, coins: 500, gems: 30, icon: '👑' },
  ];

  const canClaim = (day: number) => {
    return day === (player.dailyStreak % 7) + 1 && player.lastDailyClaim !== new Date().toDateString();
  };

  const isClaimed = (day: number) => {
    return day <= (player.dailyStreak % 7);
  };

  const claimReward = (day: number) => {
    if (!canClaim(day)) return;

    audioManager.playSuccessSound();
    setShowClaimAnimation(true);
    setClaimedDay(day);

    const reward = rewards[day - 1];
    const updated = {
      ...player,
      coins: player.coins + reward.coins,
      gems: player.gems + reward.gems,
      dailyStreak: player.dailyStreak + 1,
      lastDailyClaim: new Date().toDateString(),
    };

    setTimeout(() => {
      setPlayer(updated);
      setShowClaimAnimation(false);
      setClaimedDay(null);
    }, 2000);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className={`px-4 py-2 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300', 'bg-white hover:bg-gray-100 text-gray-700')} rounded-lg font-bold border-2 ${t(theme, 'border-gray-700', 'border-gray-300')}`}>
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-gray-900')}`}>🎁 Daily Rewards</h2>
          <div className="w-20"></div>
        </div>

        {/* Streak Info */}
        <div className={`${t(theme, 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/50', 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400')} rounded-2xl p-6 mb-6 border-2 text-center`}>
          <div className="text-5xl mb-3">🔥</div>
          <div className={`text-3xl font-black ${t(theme, 'text-yellow-300', 'text-yellow-700')} mb-2`}>
            {player.dailyStreak} Day Streak!
          </div>
          <div className={`text-sm ${t(theme, 'text-yellow-200', 'text-yellow-600')}`}>
            Claim daily rewards to keep your streak alive!
          </div>
        </div>

        {/* Reward Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {rewards.map((reward) => {
            const claimable = canClaim(reward.day);
            const claimed = isClaimed(reward.day);
            const isClaiming = claimedDay === reward.day && showClaimAnimation;

            return (
              <button
                key={reward.day}
                onClick={() => claimable && claimReward(reward.day)}
                disabled={!claimable}
                className={`relative p-3 rounded-xl border-2 transition-all ${
                  isClaiming
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-300 scale-110 animate-pulse'
                    : claimed
                    ? t(theme, 'bg-green-900/40 border-green-500/50', 'bg-green-100 border-green-400')
                    : claimable
                    ? t(theme, 'bg-yellow-900/40 border-yellow-500/50 hover:border-yellow-400 hover:scale-105', 'bg-yellow-100 border-yellow-400 hover:border-yellow-500 hover:scale-105')
                    : t(theme, 'bg-gray-900/40 border-gray-700/50 opacity-50', 'bg-gray-100 border-gray-300 opacity-50')
                }`}
              >
                <div className="text-3xl mb-1">{reward.icon}</div>
                <div className={`text-xs font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Day {reward.day}</div>
                <div className={`text-[10px] ${t(theme, 'text-yellow-300', 'text-yellow-600')} font-semibold`}>
                  🪙{reward.coins}
                </div>
                <div className={`text-[10px] ${t(theme, 'text-purple-300', 'text-purple-600')} font-semibold`}>
                  💎{reward.gems}
                </div>
                {claimed && (
                  <div className="absolute top-1 right-1 text-green-400 text-lg">✓</div>
                )}
                {claimable && !claimed && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    NEW
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Claim Animation */}
        {showClaimAnimation && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className={`${t(theme, 'bg-gradient-to-br from-yellow-900 to-orange-900 border-yellow-500', 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-400')} rounded-3xl p-8 border-4 text-center animate-bounce`}>
              <div className="text-7xl mb-4">{rewards[claimedDay! - 1].icon}</div>
              <div className={`text-3xl font-black ${t(theme, 'text-yellow-300', 'text-yellow-700')} mb-2`}>
                Reward Claimed!
              </div>
              <div className={`text-xl ${t(theme, 'text-white', 'text-gray-900')} mb-4`}>
                +{rewards[claimedDay! - 1].coins} 🪙 +{rewards[claimedDay! - 1].gems} 💎
              </div>
              <div className={`text-sm ${t(theme, 'text-yellow-200', 'text-yellow-600')}`}>
                Keep your streak alive! 🔥
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`${t(theme, 'bg-blue-900/20 border-blue-500/30', 'bg-blue-50 border-blue-300')} rounded-xl p-4 border-2`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>How It Works</div>
              <div className={`text-xs ${t(theme, 'text-gray-300', 'text-gray-700')}`}>
                Claim one reward per day to build your streak! Missing a day resets your streak to 0. 
                Higher streaks unlock better rewards!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PROFESSIONAL SHARE SCREEN ============
export function ShareScreen({ player, onBack, theme }: {
  player: Player;
  onBack: () => void;
  theme: Theme;
}) {
  const [copied, setCopied] = useState(false);

  const shareText = `🐍 I'm playing Snake Rush! I've reached Level ${player.level} with ${player.totalScore} points! Can you beat my score? Download now! #SnakeRush`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    audioManager.playSuccessSound();
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { name: 'Twitter', icon: '🐦', color: 'from-blue-400 to-blue-600', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}` },
    { name: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-800', url: `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}` },
    { name: 'WhatsApp', icon: '💬', color: 'from-green-500 to-green-700', url: `https://wa.me/?text=${encodeURIComponent(shareText)}` },
    { name: 'Email', icon: '📧', color: 'from-red-500 to-red-700', url: `mailto:?subject=Check out Snake Rush!&body=${encodeURIComponent(shareText)}` },
  ];

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className={`px-4 py-2 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300', 'bg-white hover:bg-gray-100 text-gray-700')} rounded-lg font-bold border-2 ${t(theme, 'border-gray-700', 'border-gray-300')}`}>
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-gray-900')}`}>📤 Share Your Progress</h2>
          <div className="w-20"></div>
        </div>

        {/* Stats Card */}
        <div className={`${t(theme, 'bg-gradient-to-br from-purple-900/60 to-blue-900/60 border-purple-500/50', 'bg-gradient-to-br from-purple-100 to-blue-100 border-purple-400')} rounded-2xl p-6 mb-6 border-2`}>
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">{player.avatar}</div>
            <div className={`text-2xl font-black ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>
              {player.username}
            </div>
            <div className={`text-sm ${t(theme, 'text-purple-300', 'text-purple-700')}`}>
              Level {player.level} • {player.totalScore} points
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className={`${t(theme, 'bg-black/30', 'bg-white/60')} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-black ${t(theme, 'text-green-400', 'text-green-600')}`}>{player.gamesPlayed}</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Games</div>
            </div>
            <div className={`${t(theme, 'bg-black/30', 'bg-white/60')} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-black ${t(theme, 'text-yellow-400', 'text-yellow-600')}`}>{player.trophies.length}</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Trophies</div>
            </div>
            <div className={`${t(theme, 'bg-black/30', 'bg-white/60')} rounded-xl p-3 text-center`}>
              <div className={`text-2xl font-black ${t(theme, 'text-purple-400', 'text-purple-600')}`}>{player.titles.length}</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Titles</div>
            </div>
          </div>
        </div>

        {/* Share Message */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-xl p-4 mb-6 border-2`}>
          <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Share Message:</div>
          <div className={`${t(theme, 'bg-black/40', 'bg-gray-100')} rounded-lg p-3 text-sm ${t(theme, 'text-gray-300', 'text-gray-700')} font-mono`}>
            {shareText}
          </div>
          <button
            onClick={copyToClipboard}
            className={`w-full mt-3 py-2 ${copied ? 'bg-green-600' : t(theme, 'bg-gray-700 hover:bg-gray-600', 'bg-gray-200 hover:bg-gray-300')} ${t(theme, 'text-white', 'text-gray-900')} font-bold rounded-lg transition-all`}
          >
            {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
          </button>
        </div>

        {/* Share Options */}
        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioManager.playClickSound()}
              className={`bg-gradient-to-br ${option.color} hover:opacity-90 text-white font-bold rounded-xl p-4 text-center transition-all transform hover:scale-105 active:scale-95 shadow-lg`}
            >
              <div className="text-4xl mb-2">{option.icon}</div>
              <div className="text-sm">{option.name}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
