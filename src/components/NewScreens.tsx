import { useState } from 'react';
import { Player, Screen, Theme } from '../types';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// ============ HOME SCREEN ============
export function HomeScreen({ onNavigate, theme }: { onNavigate: (screen: Screen) => void; theme: Theme }) {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <div 
        className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} flex flex-col items-center justify-center p-4 cursor-pointer`}
        onClick={() => {
          audioManager.playClickSound();
          setShowSplash(false);
          setTimeout(() => onNavigate('menu'), 500);
        }}
      >
        <div className="text-center animate-fade-in">
          <div className="text-8xl mb-6 animate-bounce">🐍</div>
          <h1 className={`text-5xl font-black ${t(theme, 'text-white', 'text-black')} mb-4 tracking-wider`}>SNAKE RUSH</h1>
          <p className={`text-lg ${t(theme, 'text-gray-400', 'text-gray-600')} mb-8`}>The Ultimate Snake Experience</p>
          <div className={`text-sm ${t(theme, 'text-gray-500', 'text-gray-500')} animate-pulse`}>Tap anywhere to continue</div>
        </div>
      </div>
    );
  }

  return null;
}

// ============ GAMES SCREEN ============
export function GamesScreen({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  const games = [
    { id: 'snake-classic', name: 'Classic Snake', icon: '🐍', description: 'The original snake game', status: 'available' },
    { id: 'snake-rush', name: 'Snake Rush', icon: '⚡', description: 'Fast-paced snake action', status: 'available' },
    { id: 'snake-leader', name: 'Snake Leader', icon: '👑', description: 'Lead your snake army', status: 'coming-soon' },
    { id: 'ludo', name: 'Ludo Master', icon: '🎲', description: 'Classic board game fun', status: 'coming-soon' },
    { id: 'puzzle', name: 'Snake Puzzle', icon: '🧩', description: 'Solve snake puzzles', status: 'coming-soon' },
    { id: 'runner', name: 'Snake Runner', icon: '🏃', description: 'Endless runner mode', status: 'coming-soon' },
    { id: 'battle', name: 'Snake Battle', icon: '⚔️', description: 'Battle against other snakes', status: 'coming-soon' },
    { id: 'maze', name: 'Snake Maze', icon: '🌀', description: 'Navigate through mazes', status: 'coming-soon' },
  ];

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className={`px-4 py-2 ${t(theme, 'bg-black hover:bg-gray-900 text-white border-white', 'bg-white hover:bg-gray-100 text-black border-black')} rounded-lg text-sm border-2 font-bold`}>
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>🎮 More Games</h2>
          <div className="w-20"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {games.map(game => (
            <div
              key={game.id}
              className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4 ${
                game.status === 'coming-soon' ? 'opacity-60' : 'hover:scale-105'
              } transition-all duration-200 cursor-pointer`}
              onClick={() => {
                if (game.status === 'available') {
                  audioManager.playClickSound();
                  // Navigate to game
                }
              }}
            >
              <div className="text-5xl mb-3 text-center">{game.icon}</div>
              <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-1 text-center`}>{game.name}</h3>
              <p className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} text-center mb-2`}>{game.description}</p>
              <div className={`text-xs font-bold text-center px-2 py-1 rounded ${
                game.status === 'available' 
                  ? t(theme, 'bg-white text-black', 'bg-black text-white')
                  : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
              }`}>
                {game.status === 'available' ? '▶ PLAY' : '🔒 COMING SOON'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ PRIVACY POLICY SCREEN ============
export function PrivacyScreen({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className={`px-4 py-2 ${t(theme, 'bg-black hover:bg-gray-900 text-white border-white', 'bg-white hover:bg-gray-100 text-black border-black')} rounded-lg text-sm border-2 font-bold`}>
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>🔒 Privacy Policy</h2>
          <div className="w-20"></div>
        </div>

        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-6 space-y-4`}>
          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>1. Information We Collect</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              We collect minimal information to provide you with the best gaming experience. This includes your game progress, preferences, and optional account information if you choose to create one.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>2. How We Use Your Information</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              Your information is used to save your game progress, provide personalized experiences, and improve our services. We never sell your personal data to third parties.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>3. Data Storage</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              Your game data is stored locally on your device and optionally synced to our secure cloud servers if you enable cloud save. All data is encrypted and protected.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>4. Third-Party Services</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              We use trusted third-party services for authentication (Google), payments (Lemon Squeezy), and analytics. These services have their own privacy policies.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>5. Your Rights</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              You have the right to access, modify, or delete your personal data at any time. You can do this through the app settings or by contacting our support team.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>6. Contact Us</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              If you have any questions about this privacy policy, please contact us at privacy@snakerush.com
            </p>
          </div>

          <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-500')} text-center pt-4 border-t ${t(theme, 'border-gray-800', 'border-gray-200')}`}>
            Last updated: March 2026
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TERMS OF SERVICE SCREEN ============
export function TermsScreen({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className={`px-4 py-2 ${t(theme, 'bg-black hover:bg-gray-900 text-white border-white', 'bg-white hover:bg-gray-100 text-black border-black')} rounded-lg text-sm border-2 font-bold`}>
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>📋 Terms of Service</h2>
          <div className="w-20"></div>
        </div>

        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-6 space-y-4`}>
          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>1. Acceptance of Terms</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              By using Snake Rush, you agree to these terms of service. If you do not agree, please do not use the app.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>2. Use of Service</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              You agree to use the app only for lawful purposes and in accordance with these terms. You must not attempt to gain unauthorized access to any part of the service.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>3. User Accounts</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>4. In-App Purchases</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              All purchases are final and non-refundable unless required by law. Virtual items have no real-world value and cannot be transferred.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>5. Intellectual Property</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              All content, features, and functionality of the app are owned by Snake Rush and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </div>

          <div>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-2`}>6. Limitation of Liability</h3>
            <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              Snake Rush shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </p>
          </div>

          <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-500')} text-center pt-4 border-t ${t(theme, 'border-gray-800', 'border-gray-200')}`}>
            Last updated: March 2026
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ABOUT SCREEN ============
export function AboutScreen({ onBack, theme }: { onBack: () => void; theme: Theme }) {
  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className={`px-4 py-2 ${t(theme, 'bg-black hover:bg-gray-900 text-white border-white', 'bg-white hover:bg-gray-100 text-black border-black')} rounded-lg text-sm border-2 font-bold`}>
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>ℹ️ About</h2>
          <div className="w-20"></div>
        </div>

        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-6 text-center`}>
          <div className="text-6xl mb-4">🐍</div>
          <h3 className={`text-3xl font-black ${t(theme, 'text-white', 'text-black')} mb-2`}>Snake Rush</h3>
          <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-6`}>Version 3.0.0</p>

          <div className={`text-left space-y-4 ${t(theme, 'text-gray-300', 'text-gray-700')} text-sm`}>
            <p>
              Snake Rush is the ultimate snake game experience, featuring multiple game modes, online multiplayer, collectible characters, and much more!
            </p>
            <p>
              Built with love using React, TypeScript, and Tailwind CSS. All game data is stored locally on your device for privacy and performance.
            </p>
          </div>

          <div className={`mt-6 pt-6 border-t ${t(theme, 'border-gray-800', 'border-gray-200')} space-y-2`}>
            <p className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-500')}`}>
              Developed by Snake Rush Team
            </p>
            <p className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-500')}`}>
              © 2026 Snake Rush. All rights reserved.
            </p>
          </div>

          <div className={`mt-6 pt-6 border-t ${t(theme, 'border-gray-800', 'border-gray-200')} flex justify-center gap-4`}>
            <a href="https://twitter.com/snakerush" target="_blank" rel="noopener noreferrer" className={`text-2xl hover:scale-110 transition-transform ${t(theme, 'text-white', 'text-black')}`}>
              🐦
            </a>
            <a href="https://instagram.com/snakerush" target="_blank" rel="noopener noreferrer" className={`text-2xl hover:scale-110 transition-transform ${t(theme, 'text-white', 'text-black')}`}>
              📷
            </a>
            <a href="https://discord.gg/snakerush" target="_blank" rel="noopener noreferrer" className={`text-2xl hover:scale-110 transition-transform ${t(theme, 'text-white', 'text-black')}`}>
              💬
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ ENHANCED SETTINGS SCREEN ============
export function EnhancedSettingsScreen({ player, setPlayer, onBack, onNavigate, theme, toggleTheme }: { 
  player: Player; 
  setPlayer: (p: Player) => void; 
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  theme: Theme; 
  toggleTheme: () => void;
}) {
  const [soundEnabled, setSoundEnabled] = useState(!audioManager.getIsMuted());

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioManager.toggleMute();
  };

  const resetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className={`px-4 py-2 ${t(theme, 'bg-black hover:bg-gray-900 text-white border-white', 'bg-white hover:bg-gray-100 text-black border-black')} rounded-lg text-sm border-2 font-bold`}>
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>⚙️ Settings</h2>
          <div className="w-20"></div>
        </div>

        <div className="space-y-4">
          {/* Appearance */}
          <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4`}>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-4`}>🎨 Appearance</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')}`}>Theme</span>
                <button
                  onClick={toggleTheme}
                  className={`px-4 py-2 ${t(theme, 'bg-white text-black', 'bg-black text-white')} rounded-lg text-sm font-bold`}
                >
                  {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </button>
              </div>
            </div>
          </div>

          {/* Sound */}
          <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4`}>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-4`}>🔊 Sound</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')}`}>Sound Effects</span>
                <button
                  onClick={toggleSound}
                  className={`px-4 py-2 ${soundEnabled ? t(theme, 'bg-white text-black', 'bg-black text-white') : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')} rounded-lg text-sm font-bold`}
                >
                  {soundEnabled ? '✓ ON' : '✗ OFF'}
                </button>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4`}>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-4`}>👤 Account</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')}`}>Google Account</span>
                <button
                  onClick={() => onNavigate('google')}
                  className={`px-4 py-2 ${t(theme, 'bg-white text-black', 'bg-black text-white')} rounded-lg text-sm font-bold`}
                >
                  {player.googleAccount ? '✓ Connected' : 'Connect'}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')}`}>Player ID</span>
                <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} font-mono`}>{player.id.slice(0, 8)}...</span>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4`}>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-4`}>💾 Data</h3>
            
            <div className="space-y-3">
              <button
                onClick={resetProgress}
                className={`w-full px-4 py-2 ${t(theme, 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border-red-500/30', 'bg-red-50 hover:bg-red-100 text-red-600 border-red-300')} border-2 rounded-lg text-sm font-bold`}
              >
                🗑️ Reset All Progress
              </button>
            </div>
          </div>

          {/* Legal */}
          <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} border-2 rounded-xl p-4`}>
            <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-4`}>📄 Legal</h3>
            
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('privacy')}
                className={`w-full px-4 py-2 ${t(theme, 'bg-white/10 hover:bg-white/20 text-white', 'bg-black/10 hover:bg-black/20 text-black')} rounded-lg text-sm font-bold text-left`}
              >
                🔒 Privacy Policy →
              </button>
              <button
                onClick={() => onNavigate('terms')}
                className={`w-full px-4 py-2 ${t(theme, 'bg-white/10 hover:bg-white/20 text-white', 'bg-black/10 hover:bg-black/20 text-black')} rounded-lg text-sm font-bold text-left`}
              >
                📋 Terms of Service →
              </button>
              <button
                onClick={() => onNavigate('about')}
                className={`w-full px-4 py-2 ${t(theme, 'bg-white/10 hover:bg-white/20 text-white', 'bg-black/10 hover:bg-black/20 text-black')} rounded-lg text-sm font-bold text-left`}
              >
                ℹ️ About →
              </button>
            </div>
          </div>

          {/* Version */}
          <div className={`text-center ${t(theme, 'text-gray-500', 'text-gray-500')} text-xs py-4`}>
            <p>Snake Rush v3.0.0</p>
            <p>© 2026 Snake Rush Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
