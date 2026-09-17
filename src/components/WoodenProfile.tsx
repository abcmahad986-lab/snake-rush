import { useState } from 'react';
import { Player, Screen, Difficulty, TROPHIES, TITLES, AVATARS, DIFFICULTY_LABELS, Theme } from '../types';
import { savePlayer } from '../store';
import { audioManager } from '../audio';

// Wooden Profile Screen Component
export function WoodenProfileScreen({ player, setPlayer, onBack, onNavigate, theme }: { 
  player: Player; 
  setPlayer: (p: Player) => void; 
  onBack: () => void; 
  onNavigate?: (screen: Screen) => void; 
  theme: Theme 
}) {
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(player.username);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSave = () => {
    if (newUsername.trim()) {
      audioManager.playClickSound();
      const updated = { ...player, username: newUsername.trim() };
      setPlayer(updated);
      savePlayer(updated);
    }
    setEditing(false);
  };

  const changeAvatar = (avatar: string) => {
    audioManager.playClickSound();
    const updated = { ...player, avatar };
    setPlayer(updated);
    savePlayer(updated);
    setShowAvatarPicker(false);
  };

  return (
    <div className="min-h-screen bg-[#2d1b4e] p-3 sm:p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => {
            audioManager.playClickSound();
            onBack();
          }}
          className="wood-button px-4 py-2 mb-4 hover:scale-105 transition-transform"
        >
          <span className="wood-text-light font-bold">← BACK</span>
        </button>

        {/* Main Profile Panel */}
        <div className="wood-panel wood-snake-scales p-4 sm:p-6 mb-4">
          {/* Avatar Section */}
          <div className="text-center mb-6">
            <button 
              onClick={() => {
                audioManager.playClickSound();
                setShowAvatarPicker(!showAvatarPicker);
              }}
              className="wood-circle w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 flex items-center justify-center text-5xl sm:text-6xl hover:scale-110 transition-transform"
            >
              {player.avatar}
            </button>
            
            {showAvatarPicker && (
              <div className="wood-panel-dark p-3 sm:p-4 rounded-xl mb-4">
                <div className="grid grid-cols-8 gap-2">
                  {AVATARS.map(a => (
                    <button 
                      key={a}
                      onClick={() => changeAvatar(a)}
                      className={`wood-button p-2 text-xl sm:text-2xl hover:scale-110 transition-transform ${
                        player.avatar === a ? 'wood-button-selected' : ''
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Username */}
            {editing ? (
              <div className="flex gap-2 justify-center items-center mb-2">
                <input 
                  value={newUsername}
                  onChange={e => setNewUsername(e.target.value)}
                  className="wood-panel-dark px-3 py-2 rounded-lg wood-text-light text-center text-sm sm:text-base border-2 border-[#4A3728] focus:outline-none focus:border-[#00b894]"
                  maxLength={16}
                  autoFocus
                />
                <button 
                  onClick={handleSave}
                  className="wood-button px-4 py-2 hover:scale-105 transition-transform"
                >
                  <span className="wood-text-light font-bold">✓</span>
                </button>
              </div>
            ) : (
              <div className="mb-2">
                <h2 className="text-xl sm:text-2xl font-bold wood-text-light mb-1">{player.username}</h2>
                <button 
                  onClick={() => {
                    audioManager.playClickSound();
                    setEditing(true);
                  }}
                  className="text-xs sm:text-sm wood-text-light opacity-70 hover:opacity-100 underline"
                >
                  Edit Name
                </button>
              </div>
            )}

            {/* Level and Title */}
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              <div className="wood-button px-3 py-1.5">
                <span className="wood-text-light text-xs sm:text-sm font-bold">LEVEL {player.level}</span>
              </div>
              {player.equippedTitle && (
                <button 
                  onClick={() => onNavigate && onNavigate('titles')}
                  className="wood-button px-3 py-1.5 hover:scale-105 transition-transform"
                >
                  <span className="wood-text-light text-xs sm:text-sm font-bold">
                    {TITLES.find(t => t.id === player.equippedTitle)?.icon} {TITLES.find(t => t.id === player.equippedTitle)?.name}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs sm:text-sm wood-text-light mb-2">
              <span className="font-bold">EXPERIENCE</span>
              <span className="font-mono-tech">{player.xp} / {player.xpToNext} XP</span>
            </div>
            <div className="h-6 sm:h-8 wood-panel-dark rounded-full overflow-hidden border-2 border-[#4A3728]">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500 relative"
                style={{ width: `${(player.xp / player.xpToNext) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="wood-button p-3 sm:p-4 text-center">
              <div className="text-3xl sm:text-4xl mb-1">🪙</div>
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">{player.coins}</div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80 font-bold">COINS</div>
            </div>
            <div className="wood-button p-3 sm:p-4 text-center">
              <div className="text-3xl sm:text-4xl mb-1">💎</div>
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">{player.gems}</div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80 font-bold">GEMS</div>
            </div>
          </div>
        </div>

        {/* Statistics Panel */}
        <div className="wood-panel wood-snake-scales p-4 sm:p-6 mb-4">
          <h3 className="text-lg sm:text-xl font-bold wood-text-light mb-4 text-center">📊 STATISTICS</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="wood-button p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">{player.gamesPlayed}</div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80">GAMES PLAYED</div>
            </div>
            <div className="wood-button p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">{player.totalScore}</div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80">TOTAL SCORE</div>
            </div>
            <div className="wood-button p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">{player.totalFoodEaten}</div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80">FOOD EATEN</div>
            </div>
            <div className="wood-button p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">{player.longestSnake}</div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80">LONGEST SNAKE</div>
            </div>
            <div className="wood-button p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">{player.dailyStreak} 🔥</div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80">DAILY STREAK</div>
            </div>
            <div className="wood-button p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">{player.gamesWonVsBot}</div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80">BOT WINS</div>
            </div>
          </div>
        </div>

        {/* Collections Panel */}
        <div className="wood-panel wood-snake-scales p-4 sm:p-6 mb-4">
          <h3 className="text-lg sm:text-xl font-bold wood-text-light mb-4 text-center">🏆 COLLECTIONS</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button 
              onClick={() => onNavigate && onNavigate('trophies')}
              className="wood-button p-4 text-center hover:scale-105 transition-transform"
            >
              <div className="text-3xl sm:text-4xl mb-2">🏆</div>
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">
                {player.trophies.length}/{TROPHIES.length}
              </div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80 font-bold">TROPHIES</div>
            </button>
            <button 
              onClick={() => onNavigate && onNavigate('titles')}
              className="wood-button p-4 text-center hover:scale-105 transition-transform"
            >
              <div className="text-3xl sm:text-4xl mb-2">🎖️</div>
              <div className="text-xl sm:text-2xl font-bold wood-text-light font-mono-tech">
                {player.titles.length}/{TITLES.length}
              </div>
              <div className="text-xs sm:text-sm wood-text-light opacity-80 font-bold">TITLES</div>
            </button>
          </div>
        </div>

        {/* High Scores Panel */}
        <div className="wood-panel wood-snake-scales p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold wood-text-light mb-4 text-center">🏅 HIGH SCORES</h3>
          <div className="space-y-3">
            {(['easy', 'medium', 'hard', 'insane'] as Difficulty[]).map(d => (
              <div key={d} className="wood-button p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-base wood-text-light font-bold">{DIFFICULTY_LABELS[d]}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-xs wood-text-light opacity-70 mb-1">CLASSIC</div>
                    <div className="text-lg sm:text-xl font-bold wood-text-light font-mono-tech">
                      {player.highScores[d]}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs wood-text-light opacity-70 mb-1">TIMED</div>
                    <div className="text-lg sm:text-xl font-bold wood-text-light font-mono-tech">
                      {player.timedHighScores[d]}
                    </div>
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
