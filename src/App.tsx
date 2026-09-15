import { useState, useEffect } from 'react';
import { Player, Screen, GameMode, Difficulty, TROPHIES, TITLES } from './types';
import { loadPlayer, savePlayer, createNewPlayer, addXp } from './store';
import Game from './components/Game';
import { LoginScreen, MainMenu, ProfileScreen, TrophiesScreen, ShopScreen, EventsScreen, LeaderboardScreen, RewardsScreen, SettingsScreen, TitlesScreen } from './components/Screens';

type MultiplayerType = 'bot' | 'player';

function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [screen, setScreen] = useState<Screen>('login');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [gameDifficulty, setGameDifficulty] = useState<Difficulty>('medium');
  const [multiplayerType, setMultiplayerType] = useState<MultiplayerType>('player');
  const [showMultiplayerChoice, setShowMultiplayerChoice] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>('medium');
  const [loading, setLoading] = useState(true);

  // Load player on mount
  useEffect(() => {
    const saved = loadPlayer();
    if (saved) {
      setPlayer(saved);
      setScreen('menu');
      
      // Check for new trophies
      checkTrophies(saved);
    }
    setLoading(false);
  }, []);

  const checkTrophies = (p: Player) => {
    let updated = { ...p };
    let changed = false;

    // Check trophies
    for (const trophy of TROPHIES) {
      if (!updated.trophies.includes(trophy.id) && trophy.condition(updated)) {
        updated.trophies = [...updated.trophies, trophy.id];
        updated.coins += trophy.coinReward;
        updated = addXp(updated, trophy.xpReward);
        changed = true;
      }
    }

    // Check titles
    for (const title of TITLES) {
      if (!updated.titles.includes(title.id) && title.condition(updated)) {
        updated.titles = [...updated.titles, title.id];
        updated.coins += title.coinReward;
        changed = true;
      }
    }

    if (changed) {
      setPlayer(updated);
      savePlayer(updated);
    }
  };

  const handleLogin = (username: string) => {
    const existing = loadPlayer();
    if (existing && existing.username === username) {
      setPlayer(existing);
      setScreen('menu');
      return;
    }

    const newPlayer = createNewPlayer(username);
    if (existing) {
      existing.username = username;
      setPlayer(existing);
      savePlayer(existing);
    } else {
      setPlayer(newPlayer);
      savePlayer(newPlayer);
    }
    setScreen('menu');
  };

  const handleSelectMode = (mode: GameMode, difficulty: Difficulty) => {
    if (mode === 'multiplayer') {
      // Show multiplayer choice modal
      setPendingDifficulty(difficulty);
      setShowMultiplayerChoice(true);
    } else {
      setGameMode(mode);
      setGameDifficulty(difficulty);
      setScreen('game');
    }
  };

  const handleMultiplayerChoice = (type: MultiplayerType) => {
    setGameMode('multiplayer');
    setGameDifficulty(pendingDifficulty);
    setMultiplayerType(type);
    setShowMultiplayerChoice(false);
    setScreen('game');
  };

  const handleLogout = () => {
    localStorage.removeItem('snake-game-player');
    setPlayer(null);
    setScreen('login');
  };

  const handleUpdatePlayer = (updated: Player) => {
    setPlayer(updated);
    setTimeout(() => checkTrophies(updated), 500);
  };

  // Update event progress when player returns to menu
  useEffect(() => {
    if (!player || screen !== 'menu') return;
    
    const updated = { ...player };
    const gamesPlayed = player.gamesPlayed;
    
    if (gamesPlayed >= 3) {
      const current = updated.eventProgress['play_3'] || 0;
      if (current < 3) {
        updated.eventProgress = { ...updated.eventProgress, 'play_3': Math.min(gamesPlayed, 3) };
      }
    }
    if (gamesPlayed >= 5) {
      const current = updated.eventProgress['play_5'] || 0;
      if (current < 5) {
        updated.eventProgress = { ...updated.eventProgress, 'play_5': Math.min(gamesPlayed, 5) };
      }
    }

    if (player.totalFoodEaten >= 20) {
      updated.eventProgress = { ...updated.eventProgress, 'eat_20': 20 };
    }
    if (player.longestSnake >= 15) {
      updated.eventProgress = { ...updated.eventProgress, 'length_15': 15 };
    }

    const bestScore = Math.max(...Object.values(player.highScores));
    if (bestScore >= 100) {
      updated.eventProgress = { ...updated.eventProgress, 'score_100': 100 };
    }
    if (bestScore >= 200) {
      updated.eventProgress = { ...updated.eventProgress, 'score_200': 200 };
    }

    const bestTimed = Math.max(...Object.values(player.timedHighScores));
    if (bestTimed >= 50) {
      updated.eventProgress = { ...updated.eventProgress, 'timed_50': 50 };
    }

    savePlayer(updated);
  }, [screen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-4xl animate-bounce">🐍</div>
      </div>
    );
  }

  if (!player || screen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (screen === 'game') {
    return (
      <Game
        player={player}
        setPlayer={handleUpdatePlayer}
        mode={gameMode}
        difficulty={gameDifficulty}
        onBack={() => setScreen('menu')}
        isMultiplayer={gameMode === 'multiplayer'}
        multiplayerType={multiplayerType}
      />
    );
  }

  // Multiplayer choice modal
  if (showMultiplayerChoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">👥</div>
            <h2 className="text-2xl font-bold text-white">Multiplayer Mode</h2>
            <p className="text-sm text-gray-400 mt-1">Choose your opponent</p>
          </div>

          <div className="space-y-3">
            {/* vs Bot */}
            <button
              onClick={() => handleMultiplayerChoice('bot')}
              className="w-full bg-gradient-to-r from-blue-900/40 to-purple-900/40 hover:from-blue-900/60 hover:to-purple-900/60 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl p-5 transition-all transform hover:scale-[1.02] active:scale-95 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🤖</div>
                <div>
                  <h3 className="text-lg font-bold text-white">vs Bot</h3>
                  <p className="text-xs text-gray-400">Challenge an AI opponent</p>
                  <p className="text-[10px] text-blue-400 mt-1">Single player • Use arrow keys</p>
                </div>
              </div>
            </button>

            {/* vs Player */}
            <button
              onClick={() => handleMultiplayerChoice('player')}
              className="w-full bg-gradient-to-r from-green-900/40 to-teal-900/40 hover:from-green-900/60 hover:to-teal-900/60 border border-green-500/30 hover:border-green-400/50 rounded-2xl p-5 transition-all transform hover:scale-[1.02] active:scale-95 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">👥</div>
                <div>
                  <h3 className="text-lg font-bold text-white">vs Player</h3>
                  <p className="text-xs text-gray-400">Local 2-player battle</p>
                  <p className="text-[10px] text-green-400 mt-1">P1: WASD • P2: IJKL</p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => setShowMultiplayerChoice(false)}
            className="w-full mt-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl border border-gray-700/50 transition-all text-sm"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  switch (screen) {
    case 'menu':
      return <MainMenu player={player} onSelectMode={handleSelectMode} onNavigate={setScreen} />;
    case 'profile':
      return <ProfileScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} onNavigate={setScreen} />;
    case 'trophies':
      return <TrophiesScreen player={player} onBack={() => setScreen('menu')} />;
    case 'titles':
      return <TitlesScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} />;
    case 'shop':
      return <ShopScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} />;
    case 'events':
      return <EventsScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} />;
    case 'leaderboard':
      return <LeaderboardScreen player={player} onBack={() => setScreen('menu')} />;
    case 'rewards':
      return <RewardsScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} />;
    case 'settings':
      return <SettingsScreen player={player} onBack={() => setScreen('menu')} onLogout={handleLogout} />;
    default:
      return <MainMenu player={player} onSelectMode={handleSelectMode} onNavigate={setScreen} />;
  }
}

export default App;
