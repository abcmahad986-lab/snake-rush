import { useState, useEffect } from 'react';
import { Player, Screen, GameMode, Difficulty, TROPHIES, TITLES, ACHIEVEMENTS, Theme, MatchType } from './types';
import { loadPlayer, savePlayer, createNewPlayer, addXp } from './store';
import Game from './components/Game';
import { LoginScreen, MainMenu, ProfileScreen, TrophiesScreen, ShopScreen, EventsScreen, RewardsScreen, TitlesScreen } from './components/Screens';
import { RealLeaderboardScreen } from './components/RealLeaderboard';
import { SubscriptionScreen, BattlePassScreen, OnlineMultiplayerScreen, GoogleLoginScreen } from './components/PremiumScreens';
import { CharactersScreen, ChestsScreen } from './components/CharacterScreens';
import { AchievementsScreen, SpinWheelScreen, VisualThemesScreen } from './components/NewFeatures';
import { RealMoneyShopScreen, MapsScreen } from './components/ShopAndMaps';
import { RealFriendsScreen } from './components/RealFriends';
import { HomeScreen, GamesScreen, PrivacyScreen, TermsScreen, AboutScreen, EnhancedSettingsScreen } from './components/NewScreens';
import { SnakeLeaderGame, LudoMasterGame, SnakePuzzleGame, SnakeRunnerGame, SnakeBattleGame, SnakeMazeGame } from './components/MiniGames';
import { CompetitiveScreen, getRankFromElo } from './components/CompetitiveScreen';

type MultiplayerType = 'bot' | 'player' | 'zen';

function App() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [screen, setScreen] = useState<Screen>('login');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [gameDifficulty, setGameDifficulty] = useState<Difficulty>('medium');
  const [multiplayerType, setMultiplayerType] = useState<MultiplayerType>('player');
  const [showMultiplayerChoice, setShowMultiplayerChoice] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState<Difficulty>('medium');
  const [matchType, setMatchType] = useState<MatchType>('unranked');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('snake-theme');
    return (saved as Theme) || 'dark';
  });

  // Load player on mount
  useEffect(() => {
    const saved = loadPlayer();
    if (saved) {
      setPlayer(saved);
      setScreen('home');
      
      // Check for new trophies
      checkTrophies(saved);
    }
    setLoading(false);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('snake-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

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
      if (!updated.titles?.includes(title.id) && title.condition(updated)) {
        updated.titles = [...(updated.titles || []), title.id];
        updated.coins += title.coinReward;
        changed = true;
      }
    }

    // Check achievements
    for (const achievement of ACHIEVEMENTS) {
      if (!updated.unlockedAchievements?.includes(achievement.id) && achievement.condition(updated)) {
        updated.unlockedAchievements = [...(updated.unlockedAchievements || []), achievement.id];
        updated.coins += achievement.coinReward;
        updated = addXp(updated, achievement.xpReward);
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
    } else if (mode === 'competitive') {
      // Navigate to competitive screen to choose ranked/unranked
      setPendingDifficulty(difficulty);
      setScreen('competitive');
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

    const bestScore = player.highScores ? Math.max(...Object.values(player.highScores)) : 0;
    if (bestScore >= 100) {
      updated.eventProgress = { ...updated.eventProgress, 'score_100': 100 };
    }
    if (bestScore >= 200) {
      updated.eventProgress = { ...updated.eventProgress, 'score_200': 200 };
    }

    const bestTimed = player.timedHighScores ? Math.max(...Object.values(player.timedHighScores)) : 0;
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
    return <LoginScreen onLogin={handleLogin} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (screen === 'game') {
    return (
      <Game
        player={player}
        setPlayer={handleUpdatePlayer}
        mode={gameMode}
        difficulty={gameDifficulty}
        onBack={() => setScreen('menu')}
        isMultiplayer={gameMode === 'multiplayer' || gameMode === 'competitive'}
        multiplayerType={multiplayerType}
        matchType={matchType}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    );
  }

  // Multiplayer choice modal
  if (showMultiplayerChoice) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800' : 'bg-gradient-to-br from-gray-100 via-slate-100 to-gray-200'} flex items-center justify-center p-4`}>
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">👥</div>
            <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Multiplayer Mode</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Choose your opponent</p>
          </div>

          <div className="space-y-3">
            {/* vs Bot */}
            <button
              onClick={() => handleMultiplayerChoice('bot')}
              className={`w-full ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 hover:from-blue-900/60 hover:to-purple-900/60 border-blue-500/30 hover:border-blue-400/50' : 'bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200 border-blue-300 hover:border-blue-400'} rounded-2xl p-5 transition-all transform hover:scale-[1.02] active:scale-95 text-left border`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🤖</div>
                <div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>vs Bot</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Challenge an AI opponent</p>
                  <p className={`text-[10px] ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} mt-1`}>Single player • Use arrow keys</p>
                </div>
              </div>
            </button>

            {/* vs Player */}
            <button
              onClick={() => handleMultiplayerChoice('player')}
              className={`w-full ${theme === 'dark' ? 'bg-gradient-to-r from-green-900/40 to-teal-900/40 hover:from-green-900/60 hover:to-teal-900/60 border-green-500/30 hover:border-green-400/50' : 'bg-gradient-to-r from-green-100 to-teal-100 hover:from-green-200 hover:to-teal-200 border-green-300 hover:border-green-400'} rounded-2xl p-5 transition-all transform hover:scale-[1.02] active:scale-95 text-left border`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">👥</div>
                <div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>vs Player</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Local 2-player battle</p>
                  <p className={`text-[10px] ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} mt-1`}>P1: WASD • P2: IJKL</p>
                </div>
              </div>
            </button>

            {/* Zen Multiplayer */}
            <button
              onClick={() => handleMultiplayerChoice('zen')}
              className={`w-full ${theme === 'dark' ? 'bg-gradient-to-r from-purple-900/40 to-pink-900/40 hover:from-purple-900/60 hover:to-pink-900/60 border-purple-500/30 hover:border-purple-400/50' : 'bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-purple-300 hover:border-purple-400'} rounded-2xl p-5 transition-all transform hover:scale-[1.02] active:scale-95 text-left border`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🌀</div>
                <div>
                  <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Zen Multiplayer</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Pass through walls!</p>
                  <p className={`text-[10px] ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'} mt-1`}>vs Bot • No wall collision</p>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={() => setShowMultiplayerChoice(false)}
            className={`w-full mt-4 py-2.5 ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'} rounded-xl border transition-all text-sm`}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  switch (screen) {
    case 'home':
      return <HomeScreen onNavigate={setScreen} theme={theme} />;
    case 'menu':
      return <MainMenu player={player} onSelectMode={handleSelectMode} onNavigate={setScreen} theme={theme} toggleTheme={toggleTheme} />;
    case 'profile':
      return <ProfileScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} onNavigate={setScreen} theme={theme} toggleTheme={toggleTheme} />;
    case 'trophies':
      return <TrophiesScreen player={player} onBack={() => setScreen('menu')} theme={theme} />;
    case 'titles':
      return <TitlesScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'shop':
      return <ShopScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'events':
      return <EventsScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'leaderboard':
      return <RealLeaderboardScreen player={player} onBack={() => setScreen('menu')} theme={theme} />;
    case 'rewards':
      return <RewardsScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'settings':
      return <EnhancedSettingsScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} onNavigate={setScreen} theme={theme} toggleTheme={toggleTheme} />;
    case 'subscription':
      return <SubscriptionScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'battlepass':
      return <BattlePassScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'online':
      return <RealFriendsScreen player={player} setPlayer={setPlayer} onBack={() => setScreen('menu')} theme={theme} onSelectMode={(mode, difficulty) => {
        setGameMode(mode);
        setGameDifficulty(difficulty);
        setScreen('game');
      }} />;
    case 'google':
      return <GoogleLoginScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'characters':
      return <CharactersScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'chests':
      return <ChestsScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'achievements':
      return <AchievementsScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'spinwheel':
      return <SpinWheelScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'visualthemes':
      return <VisualThemesScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'realmoney':
      return <RealMoneyShopScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'maps':
      return <MapsScreen player={player} setPlayer={handleUpdatePlayer} onBack={() => setScreen('menu')} theme={theme} />;
    case 'competitive':
      return <CompetitiveScreen 
        player={player} 
        setPlayer={handleUpdatePlayer} 
        onBack={() => setScreen('menu')} 
        theme={theme}
        onStartMatch={(type) => {
          setMatchType(type);
          setGameMode('competitive');
          setGameDifficulty('medium');
          setMultiplayerType('bot'); // Set to bot for competitive mode
          setScreen('game');
        }}
      />;
    case 'games':
      return <GamesScreen onBack={() => setScreen('menu')} theme={theme} onSelectGame={(gameId) => setScreen(gameId as Screen)} />;
    case 'snake-classic':
    case 'snake-rush':
      return <Game player={player!} setPlayer={handleUpdatePlayer} mode="classic" difficulty="medium" onBack={() => setScreen('games')} theme={theme} toggleTheme={toggleTheme} />;
    case 'snake-leader':
      return <SnakeLeaderGame onBack={() => setScreen('games')} theme={theme} />;
    case 'ludo':
      return <LudoMasterGame onBack={() => setScreen('games')} theme={theme} />;
    case 'puzzle':
      return <SnakePuzzleGame onBack={() => setScreen('games')} theme={theme} />;
    case 'runner':
      return <SnakeRunnerGame onBack={() => setScreen('games')} theme={theme} />;
    case 'battle':
      return <SnakeBattleGame onBack={() => setScreen('games')} theme={theme} />;
    case 'maze':
      return <SnakeMazeGame onBack={() => setScreen('games')} theme={theme} />;
    case 'privacy':
      return <PrivacyScreen onBack={() => setScreen('settings')} theme={theme} />;
    case 'terms':
      return <TermsScreen onBack={() => setScreen('settings')} theme={theme} />;
    case 'about':
      return <AboutScreen onBack={() => setScreen('settings')} theme={theme} />;
    default:
      return <MainMenu player={player} onSelectMode={handleSelectMode} onNavigate={setScreen} theme={theme} toggleTheme={toggleTheme} />;
  }
}

export default App;
