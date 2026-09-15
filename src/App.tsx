import { useState, useEffect } from 'react';
import { Player, Screen, GameMode, Difficulty, TROPHIES } from './types';
import { loadPlayer, savePlayer, createNewPlayer, addXp } from './store';
import Game from './components/Game';
import { LoginScreen, MainMenu, ProfileScreen, TrophiesScreen, ShopScreen, EventsScreen, LeaderboardScreen, RewardsScreen, SettingsScreen } from './components/Screens';

function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [screen, setScreen] = useState<Screen>('login');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [gameDifficulty, setGameDifficulty] = useState<Difficulty>('medium');
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
    let newTrophies: string[] = [];

    for (const trophy of TROPHIES) {
      if (!updated.trophies.includes(trophy.id) && trophy.condition(updated)) {
        newTrophies.push(trophy.id);
        updated.trophies = [...updated.trophies, trophy.id];
        updated.coins += trophy.coinReward;
        updated = addXp(updated, trophy.xpReward);
      }
    }

    if (newTrophies.length > 0) {
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
      // Keep existing player's data but update username if different
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
    setGameMode(mode);
    setGameDifficulty(difficulty);
    setScreen('game');
  };

  const handleLogout = () => {
    localStorage.removeItem('snake-game-player');
    setPlayer(null);
    setScreen('login');
  };

  const handleUpdatePlayer = (updated: Player) => {
    setPlayer(updated);
    // Check trophies after game
    setTimeout(() => checkTrophies(updated), 500);
  };

  // Update event progress when player returns from game
  useEffect(() => {
    if (!player || screen !== 'menu') return;
    
    // Auto-update play-based event progress
    const updated = { ...player };
    const gamesPlayed = player.gamesPlayed;
    
    // Track play events
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

    // Track food eaten events
    if (player.totalFoodEaten >= 20) {
      updated.eventProgress = { ...updated.eventProgress, 'eat_20': 20 };
    }

    // Track length events
    if (player.longestSnake >= 15) {
      updated.eventProgress = { ...updated.eventProgress, 'length_15': 15 };
    }

    // Track score events
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
      />
    );
  }

  switch (screen) {
    case 'menu':
      return <MainMenu player={player} onSelectMode={handleSelectMode} onNavigate={setScreen} />;
    case 'profile':
      return <ProfileScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} />;
    case 'trophies':
      return <TrophiesScreen player={player} onBack={() => setScreen('menu')} />;
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
