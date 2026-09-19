// ============ TYPES ============
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';
export type GameMode = 'classic' | 'timed' | 'multiplayer' | 'event' | 'zen' | 'online' | 'survival' | 'competitive';
export type MatchType = 'ranked' | 'unranked';
export type Rank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster';
export type Screen = 'login' | 'home' | 'menu' | 'game' | 'profile' | 'trophies' | 'titles' | 'shop' | 'events' | 'leaderboard' | 'settings' | 'rewards' | 'subscription' | 'battlepass' | 'online' | 'google' | 'characters' | 'chests' | 'achievements' | 'spinwheel' | 'visualthemes' | 'realmoney' | 'maps' | 'competitive' | 'games' | 'privacy' | 'terms' | 'about' | 'snake-classic' | 'snake-rush' | 'snake-leader' | 'ludo' | 'puzzle' | 'runner' | 'battle' | 'maze';
export type MapType = 'classic' | 'maze' | 'portal' | 'obstacles' | 'arena' | 'labyrinth' | 'space' | 'underwater';
export type Theme = 'light' | 'dark';
export type VisualTheme = 'default' | 'cyberpunk' | 'retro' | 'forest' | 'space' | 'sunset' | 'ocean';

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'ultimate';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'none';

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
}

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  level: number;
  lastSeen: string;
  isOnline: boolean;
  subscriptionTier: SubscriptionTier;
}

// ============ ACHIEVEMENTS ============
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'collection' | 'social' | 'special';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpReward: number;
  coinReward: number;
  condition: (player: Player) => boolean;
}

// ============ SPIN WHEEL ============
export interface SpinWheelSegment {
  id: string;
  label: string;
  icon: string;
  type: 'coins' | 'gems' | 'xp' | 'skin' | 'title';
  amount: number;
  itemId?: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DailySpinState {
  lastSpinDate: string;
  spinsToday: number;
  totalSpins: number;
}

// ============ LEADERBOARD ============
export interface LeaderboardEntry {
  id?: string;
  username: string;
  avatar: string;
  score: number;
  mode: GameMode;
  difficulty: Difficulty;
  date: string;
  isPlayer?: boolean;
}

// ============ VISUAL THEMES ============
export interface VisualThemeConfig {
  id: VisualTheme;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: 'coins' | 'gems';
  backgroundGradient: string;
  particleColors: string[];
  snakeGlow: string;
  foodColor: string;
  gridColor: string;
  unlocked?: boolean;
}

export interface OnlineGame {
  id: string;
  host: string;
  players: string[];
  maxPlayers: number;
  mode: GameMode;
  difficulty: Difficulty;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: string;
}

export interface Character {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlockLevel: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  skins: string[];
}

export interface CharacterSkin {
  id: string;
  characterId: string;
  name: string;
  colors: { head: string; body: string; glow: string };
  unlockMethod: 'level' | 'chest' | 'purchase' | 'achievement';
  unlockRequirement?: number;
}

export interface Chest {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  keysRequired: number;
  rewards: ChestReward[];
}

export interface ChestReward {
  type: 'coins' | 'gems' | 'skin' | 'character' | 'keys';
  amount: number;
  itemId?: string;
  chance: number;
}

// ============ REAL MONEY SHOP ============
export interface ShopPackage {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number; // in USD
  currency: 'USD';
  coins: number;
  gems: number;
  bonusCoins?: number;
  bonusGems?: number;
  bonusItems?: string[];
  popular?: boolean;
  bestValue?: boolean;
  free?: boolean;
}

export interface RealMoneySkin {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number; // in USD
  currency: 'USD';
  rarity: 'rare' | 'epic' | 'legendary' | 'exclusive';
  colors: { head: string; body: string; glow: string };
  free?: boolean;
}

// ============ MAPS ============
export interface GameMap {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: MapType;
  price: number; // 0 for free
  currency: 'coins' | 'gems' | 'USD';
  difficulty: 'easy' | 'medium' | 'hard';
  features: string[];
  backgroundGradient: string;
  wallColor: string;
  gridColor: string;
  obstacles?: Position[];
  portals?: { from: Position; to: Position }[];
  free?: boolean;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNext: number;
  coins: number;
  gems: number;
  totalScore: number;
  gamesPlayed: number;
  totalFoodEaten: number;
  longestSnake: number;
  totalTimePlayed: number;
  highScores: Record<Difficulty, number>;
  timedHighScores: Record<Difficulty, number>;
  trophies: string[];
  titles: string[];
  equippedTitle: string;
  equippedSkin: string;
  ownedSkins: string[];
  equippedTrail: string;
  ownedTrails: string[];
  dailyStreak: number;
  lastDailyClaim: string;
  lastLogin: string;
  createdAt: string;
  achievements: Record<string, number>;
  eventProgress: Record<string, number>;
  gamesWonVsBot: number;
  zenGamesPlayed: number;
  // Premium features
  subscription: Subscription;
  friends: string[];
  friendRequests: string[];
  googleAccount?: string;
  isPremium: boolean;
  premiumSkinsUnlocked: string[];
  battlePassLevel: number;
  battlePassXp: number;
  battlePassRewards: string[];
  // Characters & Chests
  equippedCharacter: string;
  ownedCharacters: string[];
  ownedCharacterSkins: string[];
  equippedCharacterSkin: string;
  keys: number;
  chests: Record<string, number>;
  gamesWon: number;
  // Achievements
  unlockedAchievements: string[];
  achievementProgress: Record<string, number>;
  // Daily Spin Wheel
  dailySpin: DailySpinState;
  // Visual Themes
  activeVisualTheme: VisualTheme;
  ownedVisualThemes: VisualTheme[];
  // Leaderboard
  personalBests: Record<string, number>;
  // Real Money Shop
  ownedRealMoneySkins: string[];
  purchasedPackages: string[];
  // Maps
  activeMap: string;
  ownedMaps: string[];
  // Competitive/Ranked
  elo: number;
  rank: Rank;
  rankedWins: number;
  rankedLosses: number;
  unrankedGamesPlayed: number;
  competitiveGamesPlayed: number;
}

export interface Title {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'beginner' | 'score' | 'collection' | 'combat' | 'special' | 'legendary';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  coinReward: number;
  condition: (player: Player) => boolean;
}

export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'score' | 'collection' | 'social' | 'special';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  xpReward: number;
  coinReward: number;
  condition: (player: Player) => boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'skin' | 'trail' | 'powerup' | 'boost';
  price: number;
  currency: 'coins' | 'gems';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface DailyEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'daily_challenge' | 'weekly' | 'seasonal';
  target: number;
  reward: { coins: number; gems: number; xp: number };
  expiresAt: string;
}

export interface LeaderboardEntry {
  username: string;
  avatar: string;
  score: number;
  level: number;
  mode: GameMode;
  difficulty: Difficulty;
  date: string;
}

export interface MultiplayerState {
  player1: { snake: Position[]; direction: Direction; score: number; alive: boolean };
  player2: { snake: Position[]; direction: Direction; score: number; alive: boolean };
  food: Position;
  powerups: PowerUp[];
}

export interface PowerUp {
  position: Position;
  type: 'speed' | 'slow' | 'double' | 'shrink' | 'shield' | 'time_slow' | 'coin_magnet' | 'ghost_pass' | 'score_boost';
  icon: string;
  expiresAt: number;
}

export interface TimedModeState {
  timeLeft: number;
  totalTime: number;
  multiplier: number;
  combo: number;
}

// ============ CONSTANTS ============
export const GRID_SIZE = 20;

export const DIFFICULTY_SPEEDS: Record<Difficulty, number> = {
  easy: 200,    // Very slow - relaxed gameplay
  medium: 120,  // Moderate - balanced challenge
  hard: 60,     // Fast - requires quick reflexes
  insane: 30,   // Very fast - expert level
};

// Bot AI intelligence by difficulty
export const BOT_INTELLIGENCE: Record<Difficulty, number> = {
  easy: 0.3,    // 30% chance to make optimal move
  medium: 0.6,  // 60% chance to make optimal move
  hard: 0.85,   // 85% chance to make optimal move
  insane: 0.98, // 98% chance to make optimal move
};

// Food spawn rate (lower = more food)
export const FOOD_SPAWN_RATES: Record<Difficulty, number> = {
  easy: 0.08,   // More food spawns
  medium: 0.05, // Normal food spawn
  hard: 0.03,   // Less food spawns
  insane: 0.02, // Very little food
};

// Power-up spawn rate
export const POWERUP_SPAWN_RATES: Record<Difficulty, number> = {
  easy: 0.25,   // 25% chance
  medium: 0.15, // 15% chance
  hard: 0.08,   // 8% chance
  insane: 0.05, // 5% chance
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '🟢 Easy',
  medium: '🟡 Medium',
  hard: '🔴 Hard',
  insane: '💀 Insane',
};

export const TIMED_DURATIONS: Record<Difficulty, number> = {
  easy: 120,
  medium: 90,
  hard: 60,
  insane: 45,
};

export const XP_PER_LEVEL = 100;
export const XP_MULTIPLIER = 1.5;

export function getXpForLevel(level: number): number {
  return Math.floor(XP_PER_LEVEL * Math.pow(XP_MULTIPLIER, level - 1));
}

// ============ AVATARS ============
export const AVATARS = [
  '🐍', '🐉', '🦎', '🐊', '🐲', '👾', '🤖', '👽',
  '🦊', '🐱', '🐶', '🦁', '🐯', '🐻', '🐼', '🦄',
  '🎮', '🕹️', '🏆', '⭐', '💎', '🔥', '⚡', '🌟',
];

// ============ SKINS ============
export const SNAKE_SKINS: ShopItem[] = [
  { id: 'classic', name: 'Classic Green', description: 'The original snake', icon: '🟢', type: 'skin', price: 0, currency: 'coins', rarity: 'common' },
  { id: 'fire', name: 'Fire Snake', description: 'Blazing hot!', icon: '🔥', type: 'skin', price: 100, currency: 'coins', rarity: 'common' },
  { id: 'ice', name: 'Ice Snake', description: 'Cool and collected', icon: '🧊', type: 'skin', price: 100, currency: 'coins', rarity: 'common' },
  { id: 'gold', name: 'Golden Snake', description: 'Shiny and valuable', icon: '✨', type: 'skin', price: 300, currency: 'coins', rarity: 'rare' },
  { id: 'rainbow', name: 'Rainbow Snake', description: 'All the colors!', icon: '🌈', type: 'skin', price: 500, currency: 'coins', rarity: 'rare' },
  { id: 'neon', name: 'Neon Glow', description: 'Lights up the dark', icon: '💜', type: 'skin', price: 500, currency: 'coins', rarity: 'rare' },
  { id: 'galaxy', name: 'Galaxy Serpent', description: 'From outer space', icon: '🌌', type: 'skin', price: 1000, currency: 'coins', rarity: 'epic' },
  { id: 'dragon', name: 'Dragon Scale', description: 'Ancient power', icon: '🐉', type: 'skin', price: 1500, currency: 'coins', rarity: 'epic' },
  { id: 'phantom', name: 'Phantom', description: 'Ghostly presence', icon: '👻', type: 'skin', price: 50, currency: 'gems', rarity: 'legendary' },
  { id: 'cosmic', name: 'Cosmic Worm', description: 'Bends reality', icon: '🪐', type: 'skin', price: 100, currency: 'gems', rarity: 'legendary' },
];

export const SNAKE_TRAILS: ShopItem[] = [
  { id: 'none', name: 'No Trail', description: 'Clean look', icon: '—', type: 'trail', price: 0, currency: 'coins', rarity: 'common' },
  { id: 'sparkle', name: 'Sparkle', description: 'Sparkly trail', icon: '✨', type: 'trail', price: 200, currency: 'coins', rarity: 'common' },
  { id: 'fire_trail', name: 'Fire Trail', description: 'Leave flames behind', icon: '🔥', type: 'trail', price: 400, currency: 'coins', rarity: 'rare' },
  { id: 'stars', name: 'Star Trail', description: 'Stardust follows', icon: '⭐', type: 'trail', price: 600, currency: 'coins', rarity: 'rare' },
  { id: 'hearts', name: 'Love Trail', description: 'Spread the love', icon: '💖', type: 'trail', price: 30, currency: 'gems', rarity: 'epic' },
];

// ============ TROPHIES ============
export const TROPHIES: Trophy[] = [
  // Gameplay
  { id: 'first_bite', name: 'First Bite', description: 'Eat your first food', icon: '🍎', category: 'gameplay', rarity: 'bronze', xpReward: 10, coinReward: 5, condition: (p) => p.totalFoodEaten >= 1 },
  { id: 'hungry', name: 'Hungry', description: 'Eat 50 food items', icon: '🍔', category: 'gameplay', rarity: 'bronze', xpReward: 25, coinReward: 15, condition: (p) => p.totalFoodEaten >= 50 },
  { id: 'feast', name: 'Grand Feast', description: 'Eat 200 food items', icon: '🍕', category: 'gameplay', rarity: 'silver', xpReward: 50, coinReward: 30, condition: (p) => p.totalFoodEaten >= 200 },
  { id: 'glutton', name: 'Glutton', description: 'Eat 500 food items', icon: '🎂', category: 'gameplay', rarity: 'gold', xpReward: 100, coinReward: 75, condition: (p) => p.totalFoodEaten >= 500 },
  { id: 'legendary_eater', name: 'Legendary Eater', description: 'Eat 1000 food items', icon: '👑', category: 'gameplay', rarity: 'platinum', xpReward: 250, coinReward: 150, condition: (p) => p.totalFoodEaten >= 1000 },
  
  // Score
  { id: 'score_100', name: 'Century', description: 'Score 100 points', icon: '💯', category: 'score', rarity: 'bronze', xpReward: 15, coinReward: 10, condition: (p) => p.totalScore >= 100 },
  { id: 'score_500', name: 'High Roller', description: 'Score 500 points', icon: '🎰', category: 'score', rarity: 'silver', xpReward: 40, coinReward: 25, condition: (p) => p.totalScore >= 500 },
  { id: 'score_1000', name: 'Thousand Club', description: 'Score 1000 points', icon: '🏅', category: 'score', rarity: 'gold', xpReward: 80, coinReward: 50, condition: (p) => p.totalScore >= 1000 },
  { id: 'score_5000', name: 'Legend', description: 'Score 5000 points', icon: '🏆', category: 'score', rarity: 'platinum', xpReward: 200, coinReward: 125, condition: (p) => p.totalScore >= 5000 },
  { id: 'score_10000', name: 'Mythic', description: 'Score 10000 points', icon: '💎', category: 'score', rarity: 'diamond', xpReward: 500, coinReward: 300, condition: (p) => p.totalScore >= 10000 },
  
  // Collection
  { id: 'games_10', name: 'Getting Started', description: 'Play 10 games', icon: '🎮', category: 'collection', rarity: 'bronze', xpReward: 15, coinReward: 10, condition: (p) => p.gamesPlayed >= 10 },
  { id: 'games_50', name: 'Dedicated', description: 'Play 50 games', icon: '🕹️', category: 'collection', rarity: 'silver', xpReward: 40, coinReward: 25, condition: (p) => p.gamesPlayed >= 50 },
  { id: 'games_100', name: 'Veteran', description: 'Play 100 games', icon: '🎖️', category: 'collection', rarity: 'gold', xpReward: 80, coinReward: 50, condition: (p) => p.gamesPlayed >= 100 },
  { id: 'long_snake', name: 'Ssssuper Long', description: 'Reach length 25', icon: '📏', category: 'collection', rarity: 'silver', xpReward: 35, coinReward: 20, condition: (p) => p.longestSnake >= 25 },
  { id: 'mega_snake', name: 'Mega Snake', description: 'Reach length 50', icon: '🐍', category: 'collection', rarity: 'gold', xpReward: 75, coinReward: 45, condition: (p) => p.longestSnake >= 50 },
  
  // Special
  { id: 'daily_3', name: 'Regular', description: '3 day login streak', icon: '📅', category: 'special', rarity: 'bronze', xpReward: 20, coinReward: 15, condition: (p) => p.dailyStreak >= 3 },
  { id: 'daily_7', name: 'Committed', description: '7 day login streak', icon: '🗓️', category: 'special', rarity: 'silver', xpReward: 50, coinReward: 35, condition: (p) => p.dailyStreak >= 7 },
  { id: 'daily_30', name: 'Unstoppable', description: '30 day login streak', icon: '🔥', category: 'special', rarity: 'gold', xpReward: 150, coinReward: 100, condition: (p) => p.dailyStreak >= 30 },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐', category: 'special', rarity: 'bronze', xpReward: 20, coinReward: 10, condition: (p) => p.level >= 5 },
  { id: 'level_10', name: 'Superstar', description: 'Reach level 10', icon: '🌟', category: 'special', rarity: 'silver', xpReward: 60, coinReward: 40, condition: (p) => p.level >= 10 },
  { id: 'level_25', name: 'Mega Star', description: 'Reach level 25', icon: '💫', category: 'special', rarity: 'gold', xpReward: 150, coinReward: 100, condition: (p) => p.level >= 25 },
  { id: 'hard_master', name: 'Hard Master', description: 'Score 200+ on Hard', icon: '🎯', category: 'special', rarity: 'gold', xpReward: 100, coinReward: 60, condition: (p) => p.highScores.hard >= 200 },
  { id: 'insane_master', name: 'Insane Master', description: 'Score 100+ on Insane', icon: '💀', category: 'special', rarity: 'platinum', xpReward: 200, coinReward: 120, condition: (p) => p.highScores.insane >= 100 },
];

// ============ EVENTS ============
export function generateDailyEvents(): DailyEvent[] {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  
  const allEvents: DailyEvent[] = [
    { id: 'eat_20', name: 'Quick Feast', description: 'Eat 20 food in one game', icon: '🍎', type: 'daily_challenge', target: 20, reward: { coins: 50, gems: 2, xp: 30 }, expiresAt: today + 'T23:59:59' },
    { id: 'score_100', name: 'Century Run', description: 'Score 100 in one game', icon: '💯', type: 'daily_challenge', target: 100, reward: { coins: 75, gems: 3, xp: 50 }, expiresAt: today + 'T23:59:59' },
    { id: 'play_3', name: 'Warm Up', description: 'Play 3 games today', icon: '🎮', type: 'daily_challenge', target: 3, reward: { coins: 30, gems: 1, xp: 20 }, expiresAt: today + 'T23:59:59' },
    { id: 'length_15', name: 'Growing', description: 'Reach snake length 15', icon: '📏', type: 'daily_challenge', target: 15, reward: { coins: 40, gems: 2, xp: 25 }, expiresAt: today + 'T23:59:59' },
    { id: 'timed_50', name: 'Speed Demon', description: 'Score 50 in timed mode', icon: '⚡', type: 'daily_challenge', target: 50, reward: { coins: 60, gems: 2, xp: 35 }, expiresAt: today + 'T23:59:59' },
    { id: 'play_5', name: 'Marathon', description: 'Play 5 games today', icon: '🏃', type: 'daily_challenge', target: 5, reward: { coins: 60, gems: 3, xp: 40 }, expiresAt: today + 'T23:59:59' },
    { id: 'score_200', name: 'Double Century', description: 'Score 200 in one game', icon: '🏆', type: 'daily_challenge', target: 200, reward: { coins: 100, gems: 5, xp: 75 }, expiresAt: today + 'T23:59:59' },
  ];

  // Pick 3 events based on seed
  const shuffled = [...allEvents].sort((a, b) => {
    const ha = (seed * 31 + a.id.charCodeAt(0)) % 100;
    const hb = (seed * 31 + b.id.charCodeAt(0)) % 100;
    return ha - hb;
  });

  return shuffled.slice(0, 3).map(e => ({ ...e, expiresAt: today + 'T23:59:59' }));
}

// ============ BOT PLAYERS (for multiplayer leaderboard) ============
export const BOT_NAMES = [
  'SnakeKing', 'PyMaster', 'ViperX', 'Cobra99', 'Slither',
  'NeonByte', 'PixelPro', 'TurboTail', 'ShadowFang', 'CosmicCoil',
  'GhostSnake', 'ToxicVenom', 'RoyalPython', 'DiamondBack', 'ThunderScale',
  'IceFang', 'BlazeWorm', 'StarSerpent', 'MoonSnake', 'SunScale',
];

export function generateBotLeaderboard(difficulty: Difficulty): LeaderboardEntry[] {
  const seed = difficulty.charCodeAt(0);
  return BOT_NAMES.slice(0, 15).map((name, i) => {
    const baseScore = difficulty === 'easy' ? 200 : difficulty === 'medium' ? 150 : difficulty === 'hard' ? 100 : 60;
    const score = Math.max(10, baseScore + Math.floor(Math.sin(seed + i * 7) * 80 + (15 - i) * 15));
    return {
      username: name,
      avatar: AVATARS[(i * 3 + seed) % AVATARS.length],
      score,
      level: Math.floor(score / 50) + 1,
      mode: 'classic' as GameMode,
      difficulty,
      date: new Date(Date.now() - i * 3600000).toISOString(),
    };
  }).sort((a, b) => b.score - a.score);
}

// ============ DAILY REWARDS ============
export const DAILY_REWARDS = [
  { day: 1, coins: 20, gems: 0, xp: 10, icon: '🪙' },
  { day: 2, coins: 30, gems: 1, xp: 15, icon: '💰' },
  { day: 3, coins: 50, gems: 1, xp: 20, icon: '🎁' },
  { day: 4, coins: 40, gems: 2, xp: 25, icon: '🎀' },
  { day: 5, coins: 60, gems: 2, xp: 30, icon: '🎊' },
  { day: 6, coins: 80, gems: 3, xp: 40, icon: '🏅' },
  { day: 7, coins: 150, gems: 5, xp: 100, icon: '👑' },
];

// ============ ACHIEVEMENTS ============
export const ACHIEVEMENTS: Achievement[] = [
  // Gameplay achievements
  {
    id: 'first_game',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    category: 'gameplay',
    rarity: 'bronze',
    xpReward: 10,
    coinReward: 20,
    condition: (p) => p.gamesPlayed >= 1,
  },
  {
    id: 'ten_games',
    name: 'Getting Started',
    description: 'Play 10 games',
    icon: '🎯',
    category: 'gameplay',
    rarity: 'bronze',
    xpReward: 25,
    coinReward: 50,
    condition: (p) => p.gamesPlayed >= 10,
  },
  {
    id: 'fifty_games',
    name: 'Dedicated Player',
    description: 'Play 50 games',
    icon: '⭐',
    category: 'gameplay',
    rarity: 'silver',
    xpReward: 50,
    coinReward: 100,
    condition: (p) => p.gamesPlayed >= 50,
  },
  {
    id: 'hundred_games',
    name: 'Snake Master',
    description: 'Play 100 games',
    icon: '🏆',
    category: 'gameplay',
    rarity: 'gold',
    xpReward: 100,
    coinReward: 200,
    condition: (p) => p.gamesPlayed >= 100,
  },
  {
    id: 'score_100',
    name: 'Century Club',
    description: 'Score 100 points in a single game',
    icon: '💯',
    category: 'gameplay',
    rarity: 'silver',
    xpReward: 30,
    coinReward: 75,
    condition: (p) => Math.max(...Object.values(p.highScores)) >= 100,
  },
  {
    id: 'score_500',
    name: 'High Scorer',
    description: 'Score 500 points in a single game',
    icon: '🔥',
    category: 'gameplay',
    rarity: 'gold',
    xpReward: 75,
    coinReward: 150,
    condition: (p) => Math.max(...Object.values(p.highScores)) >= 500,
  },
  {
    id: 'insane_survivor',
    name: 'Insane Survivor',
    description: 'Survive for 2 minutes on Insane difficulty',
    icon: '💀',
    category: 'gameplay',
    rarity: 'platinum',
    xpReward: 150,
    coinReward: 300,
    condition: (p) => p.highScores.insane >= 200,
  },
  // Collection achievements
  {
    id: 'food_100',
    name: 'Hungry Snake',
    description: 'Eat 100 food items total',
    icon: '🍎',
    category: 'collection',
    rarity: 'bronze',
    xpReward: 20,
    coinReward: 40,
    condition: (p) => p.totalFoodEaten >= 100,
  },
  {
    id: 'food_500',
    name: 'Foodie',
    description: 'Eat 500 food items total',
    icon: '🍕',
    category: 'collection',
    rarity: 'silver',
    xpReward: 40,
    coinReward: 80,
    condition: (p) => p.totalFoodEaten >= 500,
  },
  {
    id: 'food_1000',
    name: 'Glutton',
    description: 'Eat 1000 food items total',
    icon: '🍔',
    category: 'collection',
    rarity: 'gold',
    xpReward: 80,
    coinReward: 160,
    condition: (p) => p.totalFoodEaten >= 1000,
  },
  {
    id: 'long_snake',
    name: 'Long Boi',
    description: 'Reach a snake length of 50',
    icon: '📏',
    category: 'collection',
    rarity: 'silver',
    xpReward: 35,
    coinReward: 70,
    condition: (p) => p.longestSnake >= 50,
  },
  {
    id: 'mega_snake',
    name: 'Mega Snake',
    description: 'Reach a snake length of 100',
    icon: '🐍',
    category: 'collection',
    rarity: 'gold',
    xpReward: 70,
    coinReward: 140,
    condition: (p) => p.longestSnake >= 100,
  },
  {
    id: 'titles_10',
    name: 'Title Collector',
    description: 'Unlock 10 titles',
    icon: '👑',
    category: 'collection',
    rarity: 'silver',
    xpReward: 45,
    coinReward: 90,
    condition: (p) => p.titles.length >= 10,
  },
  {
    id: 'skins_5',
    name: 'Fashion Snake',
    description: 'Own 5 different skins',
    icon: '🎨',
    category: 'collection',
    rarity: 'bronze',
    xpReward: 25,
    coinReward: 50,
    condition: (p) => p.ownedSkins.length >= 5,
  },
  // Social achievements
  {
    id: 'bot_wins_5',
    name: 'Bot Slayer',
    description: 'Win 5 games against the bot',
    icon: '🤖',
    category: 'social',
    rarity: 'bronze',
    xpReward: 30,
    coinReward: 60,
    condition: (p) => p.gamesWonVsBot >= 5,
  },
  {
    id: 'bot_wins_20',
    name: 'Bot Destroyer',
    description: 'Win 20 games against the bot',
    icon: '⚔️',
    category: 'social',
    rarity: 'silver',
    xpReward: 60,
    coinReward: 120,
    condition: (p) => p.gamesWonVsBot >= 20,
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Play 10 zen mode games',
    icon: '🧘',
    category: 'social',
    rarity: 'bronze',
    xpReward: 25,
    coinReward: 50,
    condition: (p) => p.zenGamesPlayed >= 10,
  },
  // Special achievements
  {
    id: 'daily_streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day login streak',
    icon: '📅',
    category: 'special',
    rarity: 'silver',
    xpReward: 50,
    coinReward: 100,
    condition: (p) => p.dailyStreak >= 7,
  },
  {
    id: 'daily_streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day login streak',
    icon: '🗓️',
    category: 'special',
    rarity: 'gold',
    xpReward: 100,
    coinReward: 200,
    condition: (p) => p.dailyStreak >= 30,
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    category: 'special',
    rarity: 'bronze',
    xpReward: 30,
    coinReward: 60,
    condition: (p) => p.level >= 10,
  },
  {
    id: 'level_25',
    name: 'Veteran',
    description: 'Reach level 25',
    icon: '🌟',
    category: 'special',
    rarity: 'silver',
    xpReward: 60,
    coinReward: 120,
    condition: (p) => p.level >= 25,
  },
  {
    id: 'level_50',
    name: 'Legend',
    description: 'Reach level 50',
    icon: '💫',
    category: 'special',
    rarity: 'gold',
    xpReward: 120,
    coinReward: 240,
    condition: (p) => p.level >= 50,
  },
];

// ============ SPIN WHEEL SEGMENTS ============
export const SPIN_WHEEL_SEGMENTS: SpinWheelSegment[] = [
  { id: 'coins_50', label: '50 Coins', icon: '🪙', type: 'coins', amount: 50, color: '#FFD700', rarity: 'common' },
  { id: 'coins_100', label: '100 Coins', icon: '💰', type: 'coins', amount: 100, color: '#FFA500', rarity: 'common' },
  { id: 'gems_5', label: '5 Gems', icon: '💎', type: 'gems', amount: 5, color: '#00BFFF', rarity: 'rare' },
  { id: 'xp_50', label: '50 XP', icon: '✨', type: 'xp', amount: 50, color: '#9370DB', rarity: 'common' },
  { id: 'coins_200', label: '200 Coins', icon: '💵', type: 'coins', amount: 200, color: '#32CD32', rarity: 'rare' },
  { id: 'gems_10', label: '10 Gems', icon: '💠', type: 'gems', amount: 10, color: '#FF1493', rarity: 'epic' },
  { id: 'xp_100', label: '100 XP', icon: '🌟', type: 'xp', amount: 100, color: '#FFD700', rarity: 'rare' },
  { id: 'coins_500', label: '500 Coins', icon: '🏆', type: 'coins', amount: 500, color: '#FF4500', rarity: 'epic' },
  { id: 'gems_25', label: '25 Gems', icon: '🔷', type: 'gems', amount: 25, color: '#4169E1', rarity: 'legendary' },
  { id: 'skin_rare', label: 'Rare Skin', icon: '🎨', type: 'skin', amount: 1, itemId: 'rare_skin', color: '#9400D3', rarity: 'epic' },
  { id: 'xp_200', label: '200 XP', icon: '⭐', type: 'xp', amount: 200, color: '#FF69B4', rarity: 'epic' },
  { id: 'title_exclusive', label: 'Title', icon: '👑', type: 'title', amount: 1, itemId: 'spin_champion', color: '#FFD700', rarity: 'legendary' },
];

// ============ VISUAL THEMES ============
export const VISUAL_THEMES: VisualThemeConfig[] = [
  {
    id: 'default',
    name: 'Classic',
    description: 'The original Snake Rush experience',
    icon: '🎮',
    price: 0,
    currency: 'coins',
    backgroundGradient: 'from-gray-900 via-slate-900 to-gray-800',
    particleColors: ['#4ade80', '#22c55e', '#16a34a'],
    snakeGlow: 'rgba(74, 222, 128, 0.6)',
    foodColor: '#ef4444',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    unlocked: true,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futuristic neon-lit cityscape',
    icon: '🌆',
    price: 500,
    currency: 'coins',
    backgroundGradient: 'from-purple-900 via-pink-900 to-blue-900',
    particleColors: ['#ff00ff', '#00ffff', '#ffff00'],
    snakeGlow: 'rgba(255, 0, 255, 0.8)',
    foodColor: '#00ffff',
    gridColor: 'rgba(255, 0, 255, 0.1)',
  },
  {
    id: 'retro',
    name: 'Retro Arcade',
    description: 'Classic 8-bit arcade aesthetic',
    icon: '👾',
    price: 300,
    currency: 'coins',
    backgroundGradient: 'from-black via-gray-900 to-black',
    particleColors: ['#00ff00', '#ffff00', '#ff0000'],
    snakeGlow: 'rgba(0, 255, 0, 0.7)',
    foodColor: '#ffff00',
    gridColor: 'rgba(0, 255, 0, 0.15)',
  },
  {
    id: 'forest',
    name: 'Midnight Forest',
    description: 'Mystical enchanted forest',
    icon: '🌲',
    price: 400,
    currency: 'coins',
    backgroundGradient: 'from-green-950 via-emerald-950 to-teal-950',
    particleColors: ['#10b981', '#059669', '#047857'],
    snakeGlow: 'rgba(16, 185, 129, 0.6)',
    foodColor: '#f59e0b',
    gridColor: 'rgba(16, 185, 129, 0.08)',
  },
  {
    id: 'space',
    name: 'Space Galaxy',
    description: 'Journey through the cosmos',
    icon: '🌌',
    price: 15,
    currency: 'gems',
    backgroundGradient: 'from-indigo-950 via-purple-950 to-blue-950',
    particleColors: ['#818cf8', '#a78bfa', '#c084fc'],
    snakeGlow: 'rgba(129, 140, 248, 0.7)',
    foodColor: '#fbbf24',
    gridColor: 'rgba(129, 140, 248, 0.1)',
  },
  {
    id: 'sunset',
    name: 'Sunset Paradise',
    description: 'Beautiful tropical sunset',
    icon: '🌅',
    price: 600,
    currency: 'coins',
    backgroundGradient: 'from-orange-900 via-red-900 to-pink-900',
    particleColors: ['#fb923c', '#f97316', '#ea580c'],
    snakeGlow: 'rgba(251, 146, 60, 0.7)',
    foodColor: '#fbbf24',
    gridColor: 'rgba(251, 146, 60, 0.1)',
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Underwater aquatic adventure',
    icon: '🌊',
    price: 20,
    currency: 'gems',
    backgroundGradient: 'from-blue-950 via-cyan-950 to-teal-950',
    particleColors: ['#06b6d4', '#0891b2', '#0e7490'],
    snakeGlow: 'rgba(6, 182, 212, 0.7)',
    foodColor: '#f43f5e',
    gridColor: 'rgba(6, 182, 212, 0.1)',
  },
];

// ============ CHARACTERS ============
export const CHARACTERS: Character[] = [
  {
    id: 'snake_classic',
    name: 'Classic Snake',
    emoji: '🐍',
    description: 'The original snake hero',
    unlockLevel: 1,
    rarity: 'common',
    skins: ['classic_green', 'classic_red', 'classic_blue']
  },
  {
    id: 'dragon',
    name: 'Fire Dragon',
    emoji: '🐉',
    description: 'A fierce dragon from the mountains',
    unlockLevel: 5,
    rarity: 'rare',
    skins: ['dragon_fire', 'dragon_ice', 'dragon_shadow']
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    emoji: '🦅',
    description: 'Rises from the ashes',
    unlockLevel: 10,
    rarity: 'epic',
    skins: ['phoenix_gold', 'phoenix_crimson', 'phoenix_silver']
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    emoji: '🦄',
    description: 'Magical and majestic',
    unlockLevel: 15,
    rarity: 'epic',
    skins: ['unicorn_rainbow', 'unicorn_moonlight', 'unicorn_starlight']
  },
  {
    id: 'kraken',
    name: 'Kraken',
    emoji: '🐙',
    description: 'Terror of the deep seas',
    unlockLevel: 20,
    rarity: 'legendary',
    skins: ['kraken_abyss', 'kraken_storm', 'kraken_void']
  },
  {
    id: 'cosmic',
    name: 'Cosmic Serpent',
    emoji: '✨',
    description: 'Born from the stars themselves',
    unlockLevel: 25,
    rarity: 'legendary',
    skins: ['cosmic_nebula', 'cosmic_galaxy', 'cosmic_supernova']
  },
  // NEW FREE CHARACTERS - Lower unlock levels
  {
    id: 'turtle',
    name: 'Wise Turtle',
    emoji: '🐢',
    description: 'Slow and steady wins the race',
    unlockLevel: 2,
    rarity: 'common',
    skins: ['turtle_green', 'turtle_blue', 'turtle_gold']
  },
  {
    id: 'rabbit',
    name: 'Swift Rabbit',
    emoji: '🐰',
    description: 'Quick and agile',
    unlockLevel: 3,
    rarity: 'common',
    skins: ['rabbit_white', 'rabbit_brown', 'rabbit_silver']
  },
  {
    id: 'fox',
    name: 'Cunning Fox',
    emoji: '🦊',
    description: 'Smart and strategic',
    unlockLevel: 4,
    rarity: 'common',
    skins: ['fox_orange', 'fox_red', 'fox_arctic']
  },
  {
    id: 'wolf',
    name: 'Alpha Wolf',
    emoji: '🐺',
    description: 'Leader of the pack',
    unlockLevel: 6,
    rarity: 'rare',
    skins: ['wolf_gray', 'wolf_black', 'wolf_white']
  },
  {
    id: 'lion',
    name: 'Majestic Lion',
    emoji: '🦁',
    description: 'King of the beasts',
    unlockLevel: 7,
    rarity: 'rare',
    skins: ['lion_gold', 'lion_mane', 'lion_white']
  },
  {
    id: 'eagle',
    name: 'Soaring Eagle',
    emoji: '🦅',
    description: 'Master of the skies',
    unlockLevel: 8,
    rarity: 'rare',
    skins: ['eagle_brown', 'eagle_golden', 'eagle_bald']
  },
  {
    id: 'panda',
    name: 'Gentle Panda',
    emoji: '🐼',
    description: 'Peaceful and powerful',
    unlockLevel: 9,
    rarity: 'rare',
    skins: ['panda_classic', 'panda_red', 'panda_golden']
  },
  {
    id: 'tiger',
    name: 'Fierce Tiger',
    emoji: '🐯',
    description: 'Striped predator',
    unlockLevel: 11,
    rarity: 'epic',
    skins: ['tiger_orange', 'tiger_white', 'tiger_golden']
  },
  {
    id: 'bear',
    name: 'Mighty Bear',
    emoji: '🐻',
    description: 'Strong and enduring',
    unlockLevel: 12,
    rarity: 'epic',
    skins: ['bear_brown', 'bear_polar', 'bear_black']
  },
  {
    id: 'shark',
    name: 'Great Shark',
    emoji: '🦈',
    description: 'Ruler of the ocean',
    unlockLevel: 13,
    rarity: 'epic',
    skins: ['shark_gray', 'shark_blue', 'shark_hammerhead']
  },
  {
    id: 'owl',
    name: 'Wise Owl',
    emoji: '🦉',
    description: 'Knowledge and wisdom',
    unlockLevel: 14,
    rarity: 'epic',
    skins: ['owl_brown', 'owl_snowy', 'owl_golden']
  },
  {
    id: 'dolphin',
    name: 'Playful Dolphin',
    emoji: '🐬',
    description: 'Intelligent and friendly',
    unlockLevel: 16,
    rarity: 'epic',
    skins: ['dolphin_gray', 'dolphin_blue', 'dolphin_pink']
  },
  {
    id: 'gorilla',
    name: 'Silverback Gorilla',
    emoji: '🦍',
    description: 'Powerful primate',
    unlockLevel: 17,
    rarity: 'epic',
    skins: ['gorilla_black', 'gorilla_silver', 'gorilla_golden']
  },
  {
    id: 'elephant',
    name: 'Noble Elephant',
    emoji: '🐘',
    description: 'Wise and majestic',
    unlockLevel: 18,
    rarity: 'epic',
    skins: ['elephant_gray', 'elephant_african', 'elephant_asian']
  },
  {
    id: 'crocodile',
    name: 'Ancient Crocodile',
    emoji: '🐊',
    description: 'Prehistoric predator',
    unlockLevel: 19,
    rarity: 'legendary',
    skins: ['crocodile_green', 'crocodile_nile', 'crocodile_golden']
  },
  {
    id: 'whale',
    name: 'Giant Whale',
    emoji: '🐋',
    description: 'Largest creature alive',
    unlockLevel: 21,
    rarity: 'legendary',
    skins: ['whale_blue', 'whale_humpback', 'whale_golden']
  },
  {
    id: 'octopus',
    name: 'Mystic Octopus',
    emoji: '🐙',
    description: 'Eight arms of power',
    unlockLevel: 22,
    rarity: 'legendary',
    skins: ['octopus_purple', 'octopus_blue', 'octopus_golden']
  },
  {
    id: 'dinosaur',
    name: 'T-Rex Dinosaur',
    emoji: '🦖',
    description: 'Ancient ruler',
    unlockLevel: 23,
    rarity: 'legendary',
    skins: ['dinosaur_green', 'dinosaur_red', 'dinosaur_golden']
  },
  {
    id: 'alien',
    name: 'Space Alien',
    emoji: '👽',
    description: 'From another world',
    unlockLevel: 24,
    rarity: 'legendary',
    skins: ['alien_green', 'alien_gray', 'alien_golden']
  },
];

// ============ CHARACTER SKINS ============
export const CHARACTER_SKINS: CharacterSkin[] = [
  // Classic Snake skins - Vibrant greens
  { id: 'classic_green', characterId: 'snake_classic', name: 'Forest Green', colors: { head: '#22c55e', body: '#16a34a', glow: 'rgba(34, 197, 94, 0.9)' }, unlockMethod: 'level', unlockRequirement: 1 },
  { id: 'classic_red', characterId: 'snake_classic', name: 'Ruby Red', colors: { head: '#ef4444', body: '#dc2626', glow: 'rgba(239, 68, 68, 0.9)' }, unlockMethod: 'chest' },
  { id: 'classic_blue', characterId: 'snake_classic', name: 'Ocean Blue', colors: { head: '#3b82f6', body: '#2563eb', glow: 'rgba(59, 130, 246, 0.9)' }, unlockMethod: 'purchase', unlockRequirement: 100 },
  
  // Dragon skins - Fiery oranges and blues
  { id: 'dragon_fire', characterId: 'dragon', name: 'Inferno', colors: { head: '#f97316', body: '#ea580c', glow: 'rgba(249, 115, 22, 1.0)' }, unlockMethod: 'level', unlockRequirement: 5 },
  { id: 'dragon_ice', characterId: 'dragon', name: 'Frost', colors: { head: '#38bdf8', body: '#0ea5e9', glow: 'rgba(56, 189, 248, 1.0)' }, unlockMethod: 'chest' },
  { id: 'dragon_shadow', characterId: 'dragon', name: 'Shadow', colors: { head: '#8b5cf6', body: '#7c3aed', glow: 'rgba(139, 92, 246, 1.0)' }, unlockMethod: 'achievement' },
  
  // Phoenix skins - Golden and crimson
  { id: 'phoenix_gold', characterId: 'phoenix', name: 'Golden Flame', colors: { head: '#facc15', body: '#eab308', glow: 'rgba(250, 204, 21, 1.0)' }, unlockMethod: 'level', unlockRequirement: 10 },
  { id: 'phoenix_crimson', characterId: 'phoenix', name: 'Crimson Wing', colors: { head: '#f43f5e', body: '#e11d48', glow: 'rgba(244, 63, 94, 1.0)' }, unlockMethod: 'chest' },
  { id: 'phoenix_silver', characterId: 'phoenix', name: 'Silver Ash', colors: { head: '#cbd5e1', body: '#94a3b8', glow: 'rgba(203, 213, 225, 0.9)' }, unlockMethod: 'purchase', unlockRequirement: 300 },
  
  // Unicorn skins - Rainbow pastels
  { id: 'unicorn_rainbow', characterId: 'unicorn', name: 'Rainbow', colors: { head: '#ec4899', body: '#db2777', glow: 'rgba(236, 72, 153, 1.0)' }, unlockMethod: 'level', unlockRequirement: 15 },
  { id: 'unicorn_moonlight', characterId: 'unicorn', name: 'Moonlight', colors: { head: '#a78bfa', body: '#8b5cf6', glow: 'rgba(167, 139, 250, 1.0)' }, unlockMethod: 'chest' },
  { id: 'unicorn_starlight', characterId: 'unicorn', name: 'Starlight', colors: { head: '#fde047', body: '#facc15', glow: 'rgba(253, 224, 71, 1.0)' }, unlockMethod: 'achievement' },
  
  // Kraken skins - Deep ocean colors
  { id: 'kraken_abyss', characterId: 'kraken', name: 'Abyssal', colors: { head: '#6366f1', body: '#4f46e5', glow: 'rgba(99, 102, 241, 1.0)' }, unlockMethod: 'level', unlockRequirement: 20 },
  { id: 'kraken_storm', characterId: 'kraken', name: 'Storm', colors: { head: '#06b6d4', body: '#0891b2', glow: 'rgba(6, 182, 212, 1.0)' }, unlockMethod: 'chest' },
  { id: 'kraken_void', characterId: 'kraken', name: 'Void', colors: { head: '#a855f7', body: '#9333ea', glow: 'rgba(168, 85, 247, 1.0)' }, unlockMethod: 'purchase', unlockRequirement: 500 },
  
  // Cosmic Serpent skins - Space purples and blues
  { id: 'cosmic_nebula', characterId: 'cosmic', name: 'Nebula', colors: { head: '#c084fc', body: '#a855f7', glow: 'rgba(192, 132, 252, 1.0)' }, unlockMethod: 'level', unlockRequirement: 25 },
  { id: 'cosmic_galaxy', characterId: 'cosmic', name: 'Galaxy', colors: { head: '#818cf8', body: '#6366f1', glow: 'rgba(129, 140, 248, 1.0)' }, unlockMethod: 'chest' },
  { id: 'cosmic_supernova', characterId: 'cosmic', name: 'Supernova', colors: { head: '#fb923c', body: '#f97316', glow: 'rgba(251, 146, 60, 1.0)' }, unlockMethod: 'achievement' },
  
  // NEW FREE CHARACTER SKINS
  // Turtle skins - Earthy greens and browns
  { id: 'turtle_green', characterId: 'turtle', name: 'Forest Green', colors: { head: '#84cc16', body: '#65a30d', glow: 'rgba(132, 204, 22, 0.9)' }, unlockMethod: 'level', unlockRequirement: 2 },
  { id: 'turtle_blue', characterId: 'turtle', name: 'Ocean Blue', colors: { head: '#0e7490', body: '#0f766e', glow: 'rgba(14, 116, 144, 0.9)' }, unlockMethod: 'chest' },
  { id: 'turtle_gold', characterId: 'turtle', name: 'Golden Shell', colors: { head: '#d97706', body: '#b45309', glow: 'rgba(217, 119, 6, 0.9)' }, unlockMethod: 'achievement' },
  
  // Rabbit skins - Soft whites and browns
  { id: 'rabbit_white', characterId: 'rabbit', name: 'Snow White', colors: { head: '#f1f5f9', body: '#e2e8f0', glow: 'rgba(241, 245, 249, 0.8)' }, unlockMethod: 'level', unlockRequirement: 3 },
  { id: 'rabbit_brown', characterId: 'rabbit', name: 'Earth Brown', colors: { head: '#b45309', body: '#92400e', glow: 'rgba(180, 83, 9, 0.9)' }, unlockMethod: 'chest' },
  { id: 'rabbit_silver', characterId: 'rabbit', name: 'Silver Swift', colors: { head: '#94a3b8', body: '#64748b', glow: 'rgba(148, 163, 184, 0.9)' }, unlockMethod: 'achievement' },
  
  // Fox skins - Vibrant oranges and reds
  { id: 'fox_orange', characterId: 'fox', name: 'Autumn Orange', colors: { head: '#fb923c', body: '#ea580c', glow: 'rgba(251, 146, 60, 1.0)' }, unlockMethod: 'level', unlockRequirement: 4 },
  { id: 'fox_red', characterId: 'fox', name: 'Fire Red', colors: { head: '#dc2626', body: '#b91c1c', glow: 'rgba(220, 38, 38, 1.0)' }, unlockMethod: 'chest' },
  { id: 'fox_arctic', characterId: 'fox', name: 'Arctic White', colors: { head: '#bae6fd', body: '#7dd3fc', glow: 'rgba(186, 230, 253, 0.9)' }, unlockMethod: 'achievement' },
  
  // Wolf skins - Dark grays and blacks
  { id: 'wolf_gray', characterId: 'wolf', name: 'Timber Gray', colors: { head: '#64748b', body: '#475569', glow: 'rgba(100, 116, 139, 0.9)' }, unlockMethod: 'level', unlockRequirement: 6 },
  { id: 'wolf_black', characterId: 'wolf', name: 'Midnight Black', colors: { head: '#1e293b', body: '#0f172a', glow: 'rgba(30, 41, 59, 1.0)' }, unlockMethod: 'chest' },
  { id: 'wolf_white', characterId: 'wolf', name: 'Arctic White', colors: { head: '#f1f5f9', body: '#e2e8f0', glow: 'rgba(241, 245, 249, 0.8)' }, unlockMethod: 'achievement' },
  
  // Lion skins - Royal golds and browns
  { id: 'lion_gold', characterId: 'lion', name: 'Royal Gold', colors: { head: '#f59e0b', body: '#d97706', glow: 'rgba(245, 158, 11, 1.0)' }, unlockMethod: 'level', unlockRequirement: 7 },
  { id: 'lion_mane', characterId: 'lion', name: 'Dark Mane', colors: { head: '#78350f', body: '#581c87', glow: 'rgba(120, 53, 15, 1.0)' }, unlockMethod: 'chest' },
  { id: 'lion_white', characterId: 'lion', name: 'White Lion', colors: { head: '#fef08a', body: '#fde047', glow: 'rgba(254, 240, 138, 0.9)' }, unlockMethod: 'achievement' },
  
  // Eagle skins - Sky browns and whites
  { id: 'eagle_brown', characterId: 'eagle', name: 'Forest Brown', colors: { head: '#92400e', body: '#78350f', glow: 'rgba(146, 64, 14, 1.0)' }, unlockMethod: 'level', unlockRequirement: 8 },
  { id: 'eagle_golden', characterId: 'eagle', name: 'Golden Eagle', colors: { head: '#eab308', body: '#ca8a04', glow: 'rgba(234, 179, 8, 1.0)' }, unlockMethod: 'chest' },
  { id: 'eagle_bald', characterId: 'eagle', name: 'Bald Eagle', colors: { head: '#f8fafc', body: '#f1f5f9', glow: 'rgba(248, 250, 252, 0.9)' }, unlockMethod: 'achievement' },
  
  // Panda skins - Black and white with accents
  { id: 'panda_classic', characterId: 'panda', name: 'Classic Panda', colors: { head: '#171717', body: '#0a0a0a', glow: 'rgba(23, 23, 23, 1.0)' }, unlockMethod: 'level', unlockRequirement: 9 },
  { id: 'panda_red', characterId: 'panda', name: 'Red Panda', colors: { head: '#ef4444', body: '#dc2626', glow: 'rgba(239, 68, 68, 1.0)' }, unlockMethod: 'chest' },
  { id: 'panda_golden', characterId: 'panda', name: 'Golden Panda', colors: { head: '#facc15', body: '#eab308', glow: 'rgba(250, 204, 21, 1.0)' }, unlockMethod: 'achievement' },
  
  // Tiger skins - Orange with black stripes effect
  { id: 'tiger_orange', characterId: 'tiger', name: 'Bengal Orange', colors: { head: '#f97316', body: '#ea580c', glow: 'rgba(249, 115, 22, 1.0)' }, unlockMethod: 'level', unlockRequirement: 11 },
  { id: 'tiger_white', characterId: 'tiger', name: 'White Tiger', colors: { head: '#fafafa', body: '#f4f4f5', glow: 'rgba(250, 250, 250, 0.9)' }, unlockMethod: 'chest' },
  { id: 'tiger_golden', characterId: 'tiger', name: 'Golden Tiger', colors: { head: '#fbbf24', body: '#f59e0b', glow: 'rgba(251, 191, 36, 1.0)' }, unlockMethod: 'achievement' },
  
  // Bear skins - Rich browns and whites
  { id: 'bear_brown', characterId: 'bear', name: 'Grizzly Brown', colors: { head: '#854d0e', body: '#6c3a0a', glow: 'rgba(133, 77, 14, 1.0)' }, unlockMethod: 'level', unlockRequirement: 12 },
  { id: 'bear_polar', characterId: 'bear', name: 'Polar White', colors: { head: '#fafafa', body: '#f4f4f5', glow: 'rgba(250, 250, 250, 0.9)' }, unlockMethod: 'chest' },
  { id: 'bear_black', characterId: 'bear', name: 'Black Bear', colors: { head: '#171717', body: '#0a0a0a', glow: 'rgba(23, 23, 23, 1.0)' }, unlockMethod: 'achievement' },
  
  // Shark skins - Ocean blues and grays
  { id: 'shark_gray', characterId: 'shark', name: 'Ocean Gray', colors: { head: '#6b7280', body: '#4b5563', glow: 'rgba(107, 114, 128, 0.9)' }, unlockMethod: 'level', unlockRequirement: 13 },
  { id: 'shark_blue', characterId: 'shark', name: 'Deep Blue', colors: { head: '#1e40af', body: '#1d4ed8', glow: 'rgba(30, 64, 175, 1.0)' }, unlockMethod: 'chest' },
  { id: 'shark_hammerhead', characterId: 'shark', name: 'Hammerhead', colors: { head: '#475569', body: '#334155', glow: 'rgba(71, 85, 105, 1.0)' }, unlockMethod: 'achievement' },
  
  // Owl skins - Wise browns and whites
  { id: 'owl_brown', characterId: 'owl', name: 'Forest Brown', colors: { head: '#854d0e', body: '#6c3a0a', glow: 'rgba(133, 77, 14, 1.0)' }, unlockMethod: 'level', unlockRequirement: 14 },
  { id: 'owl_snowy', characterId: 'owl', name: 'Snowy Owl', colors: { head: '#fafafa', body: '#f4f4f5', glow: 'rgba(250, 250, 250, 0.9)' }, unlockMethod: 'chest' },
  { id: 'owl_golden', characterId: 'owl', name: 'Golden Owl', colors: { head: '#eab308', body: '#ca8a04', glow: 'rgba(234, 179, 8, 1.0)' }, unlockMethod: 'achievement' },
  
  // Dolphin skins - Playful blues and pinks
  { id: 'dolphin_gray', characterId: 'dolphin', name: 'Dolphin Gray', colors: { head: '#94a3b8', body: '#64748b', glow: 'rgba(148, 163, 184, 0.9)' }, unlockMethod: 'level', unlockRequirement: 16 },
  { id: 'dolphin_blue', characterId: 'dolphin', name: 'Ocean Blue', colors: { head: '#3b82f6', body: '#2563eb', glow: 'rgba(59, 130, 246, 1.0)' }, unlockMethod: 'chest' },
  { id: 'dolphin_pink', characterId: 'dolphin', name: 'Pink Dolphin', colors: { head: '#ec4899', body: '#db2777', glow: 'rgba(236, 72, 153, 1.0)' }, unlockMethod: 'achievement' },
  
  // Gorilla skins - Strong blacks and silvers
  { id: 'gorilla_black', characterId: 'gorilla', name: 'Silverback', colors: { head: '#1e293b', body: '#0f172a', glow: 'rgba(30, 41, 59, 1.0)' }, unlockMethod: 'level', unlockRequirement: 17 },
  { id: 'gorilla_silver', characterId: 'gorilla', name: 'Silver King', colors: { head: '#a8a29e', body: '#78716c', glow: 'rgba(168, 162, 158, 0.9)' }, unlockMethod: 'chest' },
  { id: 'gorilla_golden', characterId: 'gorilla', name: 'Golden Ape', colors: { head: '#d97706', body: '#b45309', glow: 'rgba(217, 119, 6, 1.0)' }, unlockMethod: 'achievement' },
  
  // Elephant skins - Majestic grays
  { id: 'elephant_gray', characterId: 'elephant', name: 'African Gray', colors: { head: '#9ca3af', body: '#6b7280', glow: 'rgba(156, 163, 175, 0.9)' }, unlockMethod: 'level', unlockRequirement: 18 },
  { id: 'elephant_african', characterId: 'elephant', name: 'Savanna', colors: { head: '#a8a29e', body: '#78716c', glow: 'rgba(168, 162, 158, 0.9)' }, unlockMethod: 'chest' },
  { id: 'elephant_asian', characterId: 'elephant', name: 'Asian Elephant', colors: { head: '#a3a3a3', body: '#737373', glow: 'rgba(163, 163, 163, 0.9)' }, unlockMethod: 'achievement' },
  
  // Crocodile skins - Swampy greens and browns
  { id: 'crocodile_green', characterId: 'crocodile', name: 'Swamp Green', colors: { head: '#166534', body: '#14532d', glow: 'rgba(22, 101, 52, 1.0)' }, unlockMethod: 'level', unlockRequirement: 19 },
  { id: 'crocodile_nile', characterId: 'crocodile', name: 'Nile Croc', colors: { head: '#854d0e', body: '#6c3a0a', glow: 'rgba(133, 77, 14, 1.0)' }, unlockMethod: 'chest' },
  { id: 'crocodile_golden', characterId: 'crocodile', name: 'Golden Croc', colors: { head: '#b45309', body: '#92400e', glow: 'rgba(180, 83, 9, 1.0)' }, unlockMethod: 'achievement' },
  
  // Whale skins - Deep ocean blues
  { id: 'whale_blue', characterId: 'whale', name: 'Blue Whale', colors: { head: '#1e3a8a', body: '#1e40af', glow: 'rgba(30, 58, 138, 1.0)' }, unlockMethod: 'level', unlockRequirement: 21 },
  { id: 'whale_humpback', characterId: 'whale', name: 'Humpback', colors: { head: '#374151', body: '#1f2937', glow: 'rgba(55, 65, 81, 1.0)' }, unlockMethod: 'chest' },
  { id: 'whale_golden', characterId: 'whale', name: 'Golden Whale', colors: { head: '#ca8a04', body: '#a16207', glow: 'rgba(202, 138, 4, 1.0)' }, unlockMethod: 'achievement' },
  
  // Octopus skins - Mysterious purples and blues
  { id: 'octopus_purple', characterId: 'octopus', name: 'Deep Purple', colors: { head: '#9333ea', body: '#7e22ce', glow: 'rgba(147, 51, 234, 1.0)' }, unlockMethod: 'level', unlockRequirement: 22 },
  { id: 'octopus_blue', characterId: 'octopus', name: 'Ocean Blue', colors: { head: '#0ea5e9', body: '#0284c7', glow: 'rgba(14, 165, 233, 1.0)' }, unlockMethod: 'chest' },
  { id: 'octopus_golden', characterId: 'octopus', name: 'Golden Octopus', colors: { head: '#d97706', body: '#b45309', glow: 'rgba(217, 119, 6, 1.0)' }, unlockMethod: 'achievement' },
  
  // Dinosaur skins - Prehistoric greens and reds
  { id: 'dinosaur_green', characterId: 'dinosaur', name: 'Jurassic Green', colors: { head: '#166534', body: '#15803d', glow: 'rgba(22, 101, 52, 1.0)' }, unlockMethod: 'level', unlockRequirement: 23 },
  { id: 'dinosaur_red', characterId: 'dinosaur', name: 'T-Rex Red', colors: { head: '#b91c1c', body: '#991b1b', glow: 'rgba(185, 28, 28, 1.0)' }, unlockMethod: 'chest' },
  { id: 'dinosaur_golden', characterId: 'dinosaur', name: 'Golden Dino', colors: { head: '#ca8a04', body: '#a16207', glow: 'rgba(202, 138, 4, 1.0)' }, unlockMethod: 'achievement' },
  
  // Alien skins - Otherworldly greens and grays
  { id: 'alien_green', characterId: 'alien', name: 'Classic Green', colors: { head: '#22c55e', body: '#16a34a', glow: 'rgba(34, 197, 94, 1.0)' }, unlockMethod: 'level', unlockRequirement: 24 },
  { id: 'alien_gray', characterId: 'alien', name: 'Gray Alien', colors: { head: '#9ca3af', body: '#6b7280', glow: 'rgba(156, 163, 175, 0.9)' }, unlockMethod: 'chest' },
  { id: 'alien_golden', characterId: 'alien', name: 'Golden Alien', colors: { head: '#eab308', body: '#ca8a04', glow: 'rgba(234, 179, 8, 1.0)' }, unlockMethod: 'achievement' },
  ];
// ============ CHESTS ============
export const CHESTS: Chest[] = [
  {
    id: 'wooden_chest',
    name: 'Wooden Chest',
    icon: '📦',
    rarity: 'common',
    keysRequired: 1,
    rewards: [
      { type: 'coins', amount: 50, chance: 0.5 },
      { type: 'coins', amount: 100, chance: 0.3 },
      { type: 'gems', amount: 5, chance: 0.15 },
      { type: 'skin', amount: 1, itemId: 'classic_red', chance: 0.05 }
    ]
  },
  {
    id: 'silver_chest',
    name: 'Silver Chest',
    icon: '🎁',
    rarity: 'rare',
    keysRequired: 2,
    rewards: [
      { type: 'coins', amount: 150, chance: 0.4 },
      { type: 'gems', amount: 10, chance: 0.3 },
      { type: 'skin', amount: 1, itemId: 'dragon_ice', chance: 0.2 },
      { type: 'skin', amount: 1, itemId: 'phoenix_crimson', chance: 0.1 }
    ]
  },
  {
    id: 'golden_chest',
    name: 'Golden Chest',
    icon: '👑',
    rarity: 'epic',
    keysRequired: 3,
    rewards: [
      { type: 'coins', amount: 300, chance: 0.3 },
      { type: 'gems', amount: 25, chance: 0.3 },
      { type: 'skin', amount: 1, itemId: 'unicorn_moonlight', chance: 0.25 },
      { type: 'skin', amount: 1, itemId: 'kraken_storm', chance: 0.15 }
    ]
  },
  {
    id: 'legendary_chest',
    name: 'Legendary Chest',
    icon: '💎',
    rarity: 'legendary',
    keysRequired: 5,
    rewards: [
      { type: 'coins', amount: 500, chance: 0.25 },
      { type: 'gems', amount: 50, chance: 0.3 },
      { type: 'skin', amount: 1, itemId: 'cosmic_galaxy', chance: 0.3 },
      { type: 'character', amount: 1, itemId: 'kraken', chance: 0.15 }
    ]
  }
];

// ============ SUBSCRIPTION PLANS ============
export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  duration: string;
  features: string[];
  color: string;
  icon: string;
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    duration: 'Forever',
    features: ['Basic skins', 'Classic mode', 'Local multiplayer', 'Ads supported'],
    color: 'from-gray-600 to-gray-800',
    icon: '🆓',
  },
  {
    id: 'basic',
    name: 'Snake Pass Basic',
    price: 2.99,
    currency: 'USD',
    duration: '1 Month',
    features: ['Remove ads', '5 premium skins', 'Battle Pass access', 'Daily bonus gems', 'Priority support'],
    color: 'from-blue-600 to-blue-800',
    icon: '🎫',
  },
  {
    id: 'premium',
    name: 'Snake Pass Premium',
    price: 5.99,
    currency: 'USD',
    duration: '1 Month',
    features: ['All Basic features', 'All premium skins', 'Online multiplayer', 'Exclusive titles', '2x XP boost', 'Custom trails', 'Early access to new features'],
    color: 'from-purple-600 to-purple-800',
    icon: '⭐',
    popular: true,
  },
  {
    id: 'ultimate',
    name: 'Snake Pass Ultimate',
    price: 9.99,
    currency: 'USD',
    duration: '1 Month',
    features: ['All Premium features', 'All current & future skins', 'Unlimited friends', 'Tournament access', 'VIP support', 'Exclusive events', 'Beta features', '3x XP boost'],
    color: 'from-yellow-600 to-orange-700',
    icon: '👑',
  },
];

// ============ PREMIUM SKINS ============
export const PREMIUM_SKINS: ShopItem[] = [
  { id: 'diamond', name: 'Diamond Serpent', description: 'Sparkling diamond scales', icon: '💎', type: 'skin', price: 0, currency: 'gems', rarity: 'legendary' },
  { id: 'neon_glow', name: 'Neon Glow', description: 'Glowing neon colors', icon: '✨', type: 'skin', price: 0, currency: 'gems', rarity: 'legendary' },
  { id: 'galaxy', name: 'Galaxy Worm', description: 'Cosmic galaxy pattern', icon: '🌌', type: 'skin', price: 0, currency: 'gems', rarity: 'legendary' },
  { id: 'fire_dragon', name: 'Fire Dragon', description: 'Blazing fire dragon', icon: '🐉', type: 'skin', price: 0, currency: 'gems', rarity: 'legendary' },
  { id: 'ice_crystal', name: 'Ice Crystal', description: 'Frozen crystal scales', icon: '❄️', type: 'skin', price: 0, currency: 'gems', rarity: 'legendary' },
  { id: 'rainbow_pride', name: 'Rainbow Pride', description: 'All rainbow colors', icon: '🌈', type: 'skin', price: 0, currency: 'gems', rarity: 'legendary' },
  { id: 'shadow_ninja', name: 'Shadow Ninja', description: 'Stealth shadow mode', icon: '🥷', type: 'skin', price: 0, currency: 'gems', rarity: 'legendary' },
  { id: 'golden_king', name: 'Golden King', description: 'Royal golden scales', icon: '👑', type: 'skin', price: 0, currency: 'gems', rarity: 'legendary' },
];

// ============ BATTLE PASS REWARDS ============
export interface BattlePassReward {
  level: number;
  reward: string;
  type: 'coins' | 'gems' | 'skin' | 'title' | 'xp';
  amount: number;
  premium: boolean;
  itemId?: string;
}

export const BATTLE_PASS_REWARDS: BattlePassReward[] = [
  { level: 1, reward: '100 Coins', type: 'coins', amount: 100, premium: false },
  { level: 2, reward: '5 Gems', type: 'gems', amount: 5, premium: false },
  { level: 3, reward: '200 Coins', type: 'coins', amount: 200, premium: false },
  { level: 4, reward: '10 Gems', type: 'gems', amount: 10, premium: false },
  { level: 5, reward: 'Diamond Skin', type: 'skin', amount: 1, premium: true, itemId: 'diamond' },
  { level: 6, reward: '300 Coins', type: 'coins', amount: 300, premium: false },
  { level: 7, reward: '15 Gems', type: 'gems', amount: 15, premium: false },
  { level: 8, reward: '500 Coins', type: 'coins', amount: 500, premium: false },
  { level: 9, reward: 'Neon Glow Skin', type: 'skin', amount: 1, premium: true, itemId: 'neon_glow' },
  { level: 10, reward: '20 Gems', type: 'gems', amount: 20, premium: false },
  { level: 11, reward: 'Galaxy Skin', type: 'skin', amount: 1, premium: true, itemId: 'galaxy' },
  { level: 12, reward: '1000 Coins', type: 'coins', amount: 1000, premium: false },
  { level: 13, reward: '30 Gems', type: 'gems', amount: 30, premium: false },
  { level: 14, reward: 'Fire Dragon Skin', type: 'skin', amount: 1, premium: true, itemId: 'fire_dragon' },
  { level: 15, reward: 'VIP Title', type: 'title', amount: 1, premium: true, itemId: 'vip' },
];

// ============ MOCK FRIENDS (for online multiplayer) ============
export const MOCK_FRIENDS: Friend[] = [
  { id: 'friend1', username: 'SnakeMaster99', avatar: '🐍', level: 15, lastSeen: '2 mins ago', isOnline: true, subscriptionTier: 'premium' },
  { id: 'friend2', username: 'ProGamer', avatar: '🎮', level: 22, lastSeen: '5 mins ago', isOnline: true, subscriptionTier: 'ultimate' },
  { id: 'friend3', username: 'NoodleKing', avatar: '🍜', level: 8, lastSeen: '1 hour ago', isOnline: false, subscriptionTier: 'basic' },
  { id: 'friend4', username: 'SpeedDemon', avatar: '⚡', level: 18, lastSeen: '30 mins ago', isOnline: true, subscriptionTier: 'premium' },
  { id: 'friend5', username: 'ChillPlayer', avatar: '😎', level: 12, lastSeen: '3 hours ago', isOnline: false, subscriptionTier: 'free' },
];

// ============ TITLES ============
export const TITLES: Title[] = [
  // Beginner
  { id: 'newbie', name: 'Newbie', icon: '🐣', description: 'Start your journey', category: 'beginner', rarity: 'common', coinReward: 0, condition: () => true },
  { id: 'first_steps', name: 'First Steps', icon: '👣', description: 'Play your first game', category: 'beginner', rarity: 'common', coinReward: 5, condition: (p) => p.gamesPlayed >= 1 },
  { id: 'getting_warmer', name: 'Getting Warmer', icon: '🔥', description: 'Play 10 games', category: 'beginner', rarity: 'common', coinReward: 15, condition: (p) => p.gamesPlayed >= 10 },
  { id: 'regular_player', name: 'Regular', icon: '🎮', description: 'Play 25 games', category: 'beginner', rarity: 'uncommon', coinReward: 30, condition: (p) => p.gamesPlayed >= 25 },
  
  // Score
  { id: 'scorer', name: 'Scorer', icon: '🎯', description: 'Score 50 points', category: 'score', rarity: 'common', coinReward: 10, condition: (p) => p.totalScore >= 50 },
  { id: 'century', name: 'Century', icon: '💯', description: 'Score 100 in one game', category: 'score', rarity: 'uncommon', coinReward: 25, condition: (p) => p.highScores && Math.max(...Object.values(p.highScores)) >= 100 },
  { id: 'double_century', name: 'Double Century', icon: '🏆', description: 'Score 200 in one game', category: 'score', rarity: 'rare', coinReward: 50, condition: (p) => p.highScores && Math.max(...Object.values(p.highScores)) >= 200 },
  { id: 'score_king', name: 'Score King', icon: '👑', description: 'Reach 1000 total score', category: 'score', rarity: 'rare', coinReward: 75, condition: (p) => p.totalScore >= 1000 },
  { id: 'score_legend', name: 'Score Legend', icon: '🌟', description: 'Reach 5000 total score', category: 'score', rarity: 'epic', coinReward: 150, condition: (p) => p.totalScore >= 5000 },
  { id: 'mythic_scorer', name: 'Mythic Scorer', icon: '💎', description: 'Reach 10000 total score', category: 'score', rarity: 'legendary', coinReward: 300, condition: (p) => p.totalScore >= 10000 },
  
  // Collection
  { id: 'food_lover', name: 'Food Lover', icon: '🍎', description: 'Eat 50 food items', category: 'collection', rarity: 'common', coinReward: 10, condition: (p) => p.totalFoodEaten >= 50 },
  { id: 'glutton', name: 'Glutton', icon: '🍕', description: 'Eat 200 food items', category: 'collection', rarity: 'uncommon', coinReward: 25, condition: (p) => p.totalFoodEaten >= 200 },
  { id: 'insatiable', name: 'Insatiable', icon: '🍔', description: 'Eat 500 food items', category: 'collection', rarity: 'rare', coinReward: 60, condition: (p) => p.totalFoodEaten >= 500 },
  { id: 'long_boi', name: 'Long Boi', icon: '📏', description: 'Reach length 25', category: 'collection', rarity: 'uncommon', coinReward: 30, condition: (p) => p.longestSnake >= 25 },
  { id: 'mega_snake', name: 'Mega Snake', icon: '🐍', description: 'Reach length 50', category: 'collection', rarity: 'rare', coinReward: 75, condition: (p) => p.longestSnake >= 50 },
  { id: 'trophy_hunter', name: 'Trophy Hunter', icon: '🏅', description: 'Collect 10 trophies', category: 'collection', rarity: 'rare', coinReward: 50, condition: (p) => p.trophies.length >= 10 },
  { id: 'trophy_master', name: 'Trophy Master', icon: '🏆', description: 'Collect 20 trophies', category: 'collection', rarity: 'epic', coinReward: 120, condition: (p) => p.trophies.length >= 20 },
  
  // Combat
  { id: 'bot_slayer', name: 'Bot Slayer', icon: '🤖', description: 'Beat the bot 3 times', category: 'combat', rarity: 'uncommon', coinReward: 30, condition: (p) => (p.gamesWonVsBot || 0) >= 3 },
  { id: 'bot_crusher', name: 'Bot Crusher', icon: '💪', description: 'Beat the bot 10 times', category: 'combat', rarity: 'rare', coinReward: 75, condition: (p) => (p.gamesWonVsBot || 0) >= 10 },
  { id: 'hard_master', name: 'Hard Master', icon: '🔴', description: 'Score 200+ on Hard', category: 'combat', rarity: 'rare', coinReward: 60, condition: (p) => p.highScores?.hard >= 200 },
  { id: 'insane_god', name: 'Insane God', icon: '💀', description: 'Score 100+ on Insane', category: 'combat', rarity: 'epic', coinReward: 150, condition: (p) => p.highScores?.insane >= 100 },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', description: 'Score 50+ in timed mode', category: 'combat', rarity: 'uncommon', coinReward: 35, condition: (p) => p.timedHighScores && Math.max(...Object.values(p.timedHighScores)) >= 50 },
  
  // Special
  { id: 'dedicated', name: 'Dedicated', icon: '📅', description: '7 day login streak', category: 'special', rarity: 'uncommon', coinReward: 30, condition: (p) => p.dailyStreak >= 7 },
  { id: 'unstoppable', name: 'Unstoppable', icon: '🔥', description: '30 day login streak', category: 'special', rarity: 'epic', coinReward: 120, condition: (p) => p.dailyStreak >= 30 },
  { id: 'zen_master', name: 'Zen Master', icon: '🧘', description: 'Play 10 zen games', category: 'special', rarity: 'uncommon', coinReward: 25, condition: (p) => (p.zenGamesPlayed || 0) >= 10 },
  { id: 'level_5', name: 'Rising Star', icon: '⭐', description: 'Reach level 5', category: 'special', rarity: 'common', coinReward: 15, condition: (p) => p.level >= 5 },
  { id: 'level_10', name: 'Champion', icon: '🌟', description: 'Reach level 10', category: 'special', rarity: 'rare', coinReward: 60, condition: (p) => p.level >= 10 },
  { id: 'level_25', name: 'Grand Master', icon: '💫', description: 'Reach level 25', category: 'special', rarity: 'epic', coinReward: 150, condition: (p) => p.level >= 25 },
  { id: 'veteran', name: 'Veteran', icon: '🎖️', description: 'Play 100 games', category: 'special', rarity: 'rare', coinReward: 80, condition: (p) => p.gamesPlayed >= 100 },
  
  // Legendary
  { id: 'snake_god', name: 'Snake God', icon: '👁️', description: 'Score 10000 total', category: 'legendary', rarity: 'legendary', coinReward: 500, condition: (p) => p.totalScore >= 10000 },
  { id: 'eternal', name: 'Eternal', icon: '♾️', description: 'Reach length 100', category: 'legendary', rarity: 'legendary', coinReward: 500, condition: (p) => p.longestSnake >= 100 },
  { id: 'completionist', name: 'Completionist', icon: '✨', description: 'Collect all trophies', category: 'legendary', rarity: 'legendary', coinReward: 1000, condition: (p) => p.trophies.length >= TROPHIES.length },
  
  // NEW FREE TITLES - More Achievements
  { id: 'quick_starter', name: 'Quick Starter', icon: '⚡', description: 'Play 5 games', category: 'beginner', rarity: 'common', coinReward: 10, condition: (p) => p.gamesPlayed >= 5 },
  { id: 'hungry_snake', name: 'Hungry Snake', icon: '🍎', description: 'Eat 25 food items', category: 'collection', rarity: 'common', coinReward: 15, condition: (p) => p.totalFoodEaten >= 25 },
  { id: 'growing_up', name: 'Growing Up', icon: '📈', description: 'Reach length 15', category: 'collection', rarity: 'common', coinReward: 20, condition: (p) => p.longestSnake >= 15 },
  { id: 'score_chaser', name: 'Score Chaser', icon: '🎯', description: 'Score 25 points', category: 'score', rarity: 'common', coinReward: 10, condition: (p) => p.totalScore >= 25 },
  { id: 'survivor', name: 'Survivor', icon: '🛡️', description: 'Survive for 1 minute', category: 'special', rarity: 'common', coinReward: 15, condition: (p) => p.totalTimePlayed >= 60 },
  { id: 'map_explorer', name: 'Map Explorer', icon: '🗺️', description: 'Play on 3 different maps', category: 'special', rarity: 'common', coinReward: 20, condition: (p) => (p.ownedMaps?.length || 1) >= 3 },
  { id: 'mode_master', name: 'Mode Master', icon: '🎮', description: 'Play all game modes', category: 'special', rarity: 'uncommon', coinReward: 30, condition: (p) => p.gamesPlayed >= 50 },
  { id: 'combo_king', name: 'Combo King', icon: '🔥', description: 'Get a 10x combo', category: 'combat', rarity: 'uncommon', coinReward: 35, condition: (p) => p.totalScore >= 200 },
  { id: 'power_collector', name: 'Power Collector', icon: '⚡', description: 'Collect 20 power-ups', category: 'collection', rarity: 'uncommon', coinReward: 30, condition: (p) => p.totalFoodEaten >= 100 },
  { id: 'zen_peace', name: 'Zen Peace', icon: '☮️', description: 'Play 5 zen games', category: 'special', rarity: 'common', coinReward: 15, condition: (p) => (p.zenGamesPlayed || 0) >= 5 },
  { id: 'bot_begyner', name: 'Bot Beginner', icon: '🤖', description: 'Win against bot once', category: 'combat', rarity: 'common', coinReward: 15, condition: (p) => (p.gamesWonVsBot || 0) >= 1 },
  { id: 'streak_3', name: 'Streak Master', icon: '🔥', description: '3 day login streak', category: 'special', rarity: 'common', coinReward: 20, condition: (p) => p.dailyStreak >= 3 },
  { id: 'level_3', name: 'Rising Player', icon: '⭐', description: 'Reach level 3', category: 'special', rarity: 'common', coinReward: 15, condition: (p) => p.level >= 3 },
  { id: 'level_7', name: 'Skilled Player', icon: '🌟', description: 'Reach level 7', category: 'special', rarity: 'uncommon', coinReward: 30, condition: (p) => p.level >= 7 },
  { id: 'level_15', name: 'Expert Player', icon: '💫', description: 'Reach level 15', category: 'special', rarity: 'rare', coinReward: 60, condition: (p) => p.level >= 15 },
  { id: 'level_20', name: 'Master Player', icon: '👑', description: 'Reach level 20', category: 'special', rarity: 'epic', coinReward: 100, condition: (p) => p.level >= 20 },
  { id: 'food_frenzy', name: 'Food Frenzy', icon: '🍔', description: 'Eat 100 food items', category: 'collection', rarity: 'uncommon', coinReward: 30, condition: (p) => p.totalFoodEaten >= 100 },
  { id: 'snake_charmer', name: 'Snake Charmer', icon: '🐍', description: 'Reach length 35', category: 'collection', rarity: 'uncommon', coinReward: 40, condition: (p) => p.longestSnake >= 35 },
  { id: 'high_roller', name: 'High Roller', icon: '💰', description: 'Score 500 in one game', category: 'score', rarity: 'rare', coinReward: 60, condition: (p) => p.highScores && Math.max(...Object.values(p.highScores)) >= 500 },
  { id: 'marathon', name: 'Marathon', icon: '🏃', description: 'Play for 30 minutes total', category: 'special', rarity: 'uncommon', coinReward: 35, condition: (p) => p.totalTimePlayed >= 1800 },
  { id: 'dedicated_week', name: 'Dedicated Week', icon: '📅', description: '14 day login streak', category: 'special', rarity: 'rare', coinReward: 60, condition: (p) => p.dailyStreak >= 14 },
  { id: 'bot_fighter', name: 'Bot Fighter', icon: '⚔️', description: 'Win against bot 5 times', category: 'combat', rarity: 'uncommon', coinReward: 40, condition: (p) => (p.gamesWonVsBot || 0) >= 5 },
  { id: 'bot_warrior', name: 'Bot Warrior', icon: '🛡️', description: 'Win against bot 15 times', category: 'combat', rarity: 'rare', coinReward: 80, condition: (p) => (p.gamesWonVsBot || 0) >= 15 },
  { id: 'medium_master', name: 'Medium Master', icon: '🟡', description: 'Score 150+ on Medium', category: 'combat', rarity: 'uncommon', coinReward: 40, condition: (p) => p.highScores?.medium >= 150 },
  { id: 'hard_hero', name: 'Hard Hero', icon: '🔴', description: 'Score 100+ on Hard', category: 'combat', rarity: 'rare', coinReward: 70, condition: (p) => p.highScores?.hard >= 100 },
  { id: 'insane_warrior', name: 'Insane Warrior', icon: '💀', description: 'Score 50+ on Insane', category: 'combat', rarity: 'rare', coinReward: 80, condition: (p) => p.highScores?.insane >= 50 },
  { id: 'timed_pro', name: 'Timed Pro', icon: '⏱️', description: 'Score 30+ in timed mode', category: 'combat', rarity: 'uncommon', coinReward: 35, condition: (p) => p.timedHighScores && Math.max(...Object.values(p.timedHighScores)) >= 30 },
  { id: 'timed_master', name: 'Timed Master', icon: '⏰', description: 'Score 75+ in timed mode', category: 'combat', rarity: 'rare', coinReward: 70, condition: (p) => p.timedHighScores && Math.max(...Object.values(p.timedHighScores)) >= 75 },
  { id: 'collector', name: 'Collector', icon: '🎁', description: 'Open 5 chests', category: 'collection', rarity: 'common', coinReward: 25, condition: (p) => (p.chests?.wooden_chest || 0) + (p.chests?.silver_chest || 0) + (p.chests?.golden_chest || 0) + (p.chests?.legendary_chest || 0) >= 5 },
  { id: 'skin_collector', name: 'Skin Collector', icon: '🎨', description: 'Own 3 skins', category: 'collection', rarity: 'common', coinReward: 20, condition: (p) => p.ownedSkins?.length >= 3 },
  { id: 'character_collector', name: 'Character Collector', icon: '🎭', description: 'Unlock 3 characters', category: 'collection', rarity: 'uncommon', coinReward: 35, condition: (p) => p.ownedCharacters?.length >= 3 },
];

// ============ REAL MONEY SHOP PACKAGES ============
export const SHOP_PACKAGES: ShopPackage[] = [
  {
    id: 'starter_pack',
    name: 'Starter Pack',
    description: 'Perfect for beginners',
    icon: '🎁',
    price: 0,
    currency: 'USD',
    coins: 100,
    gems: 5,
    free: true,
  },
  {
    id: 'coin_pile',
    name: 'Coin Pile',
    description: 'A heap of shiny coins',
    icon: '🪙',
    price: 0.99,
    currency: 'USD',
    coins: 500,
    gems: 0,
  },
  {
    id: 'gem_pouch',
    name: 'Gem Pouch',
    description: 'Precious gems collection',
    icon: '💎',
    price: 1.99,
    currency: 'USD',
    coins: 0,
    gems: 50,
  },
  {
    id: 'value_bundle',
    name: 'Value Bundle',
    description: 'Best value for coins and gems',
    icon: '💰',
    price: 4.99,
    currency: 'USD',
    coins: 2000,
    gems: 100,
    bonusCoins: 500,
    bonusGems: 25,
    popular: true,
  },
  {
    id: 'mega_pack',
    name: 'Mega Pack',
    description: 'Massive amount of currency',
    icon: '🏆',
    price: 9.99,
    currency: 'USD',
    coins: 5000,
    gems: 250,
    bonusCoins: 1500,
    bonusGems: 75,
    bestValue: true,
  },
  {
    id: 'ultimate_pack',
    name: 'Ultimate Pack',
    description: 'The ultimate currency package',
    icon: '👑',
    price: 19.99,
    currency: 'USD',
    coins: 12000,
    gems: 600,
    bonusCoins: 4000,
    bonusGems: 200,
    bonusItems: ['exclusive_skin_1'],
  },
];

// ============ REAL MONEY SKINS ============
export const REAL_MONEY_SKINS: RealMoneySkin[] = [
  {
    id: 'neon_starter',
    name: 'Neon Starter',
    description: 'Glowing neon green skin',
    icon: '💚',
    price: 0,
    currency: 'USD',
    rarity: 'rare',
    colors: { head: '#00ff00', body: '#00cc00', glow: 'rgba(0, 255, 0, 0.8)' },
    free: true,
  },
  {
    id: 'fire_starter',
    name: 'Fire Starter',
    description: 'Blazing fire skin',
    icon: '🔥',
    price: 0.99,
    currency: 'USD',
    rarity: 'rare',
    colors: { head: '#ff4500', body: '#ff6347', glow: 'rgba(255, 69, 0, 0.8)' },
  },
  {
    id: 'ice_crystal',
    name: 'Ice Crystal',
    description: 'Frozen ice crystal skin',
    icon: '❄️',
    price: 1.99,
    currency: 'USD',
    rarity: 'epic',
    colors: { head: '#00bfff', body: '#1e90ff', glow: 'rgba(0, 191, 255, 0.8)' },
  },
  {
    id: 'golden_dragon',
    name: 'Golden Dragon',
    description: 'Majestic golden dragon skin',
    icon: '🐉',
    price: 2.99,
    currency: 'USD',
    rarity: 'epic',
    colors: { head: '#ffd700', body: '#daa520', glow: 'rgba(255, 215, 0, 0.8)' },
  },
  {
    id: 'rainbow_pride',
    name: 'Rainbow Pride',
    description: 'Colorful rainbow skin',
    icon: '🌈',
    price: 3.99,
    currency: 'USD',
    rarity: 'legendary',
    colors: { head: '#ff0000', body: '#00ff00', glow: 'rgba(255, 0, 255, 0.8)' },
  },
  {
    id: 'galaxy_explorer',
    name: 'Galaxy Explorer',
    description: 'Cosmic galaxy skin',
    icon: '🌌',
    price: 4.99,
    currency: 'USD',
    rarity: 'legendary',
    colors: { head: '#9370db', body: '#4b0082', glow: 'rgba(147, 112, 219, 0.8)' },
  },
  {
    id: 'exclusive_diamond',
    name: 'Exclusive Diamond',
    description: 'Only available in Ultimate Pack',
    icon: '💎',
    price: 9.99,
    currency: 'USD',
    rarity: 'exclusive',
    colors: { head: '#b9f2ff', body: '#00ced1', glow: 'rgba(185, 242, 255, 0.9)' },
  },
];

// ============ GAME MAPS ============
export const GAME_MAPS: GameMap[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original Snake Rush experience',
    icon: '🎮',
    type: 'classic',
    price: 0,
    currency: 'coins',
    difficulty: 'easy',
    features: ['Standard gameplay', 'No obstacles'],
    backgroundGradient: 'from-gray-900 via-slate-900 to-gray-800',
    wallColor: '#4b5563',
    gridColor: 'rgba(255, 255, 255, 0.05)',
    free: true,
  },
  {
    id: 'maze',
    name: 'Maze Runner',
    description: 'Navigate through tricky maze walls',
    icon: '🏰',
    type: 'maze',
    price: 200,
    currency: 'coins',
    difficulty: 'medium',
    features: ['Maze walls', 'Strategic navigation'],
    backgroundGradient: 'from-purple-900 via-indigo-900 to-blue-900',
    wallColor: '#7c3aed',
    gridColor: 'rgba(124, 58, 237, 0.1)',
    obstacles: [
      { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 7 }, { x: 5, y: 8 }, { x: 5, y: 9 },
      { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 },
      { x: 15, y: 10 }, { x: 15, y: 11 }, { x: 15, y: 12 }, { x: 15, y: 13 }, { x: 15, y: 14 },
      { x: 7, y: 15 }, { x: 8, y: 15 }, { x: 9, y: 15 }, { x: 10, y: 15 },
    ],
  },
  {
    id: 'portal',
    name: 'Portal Jump',
    description: 'Use portals to teleport across the map',
    icon: '🌀',
    type: 'portal',
    price: 300,
    currency: 'coins',
    difficulty: 'medium',
    features: ['Teleportation portals', 'Quick traversal'],
    backgroundGradient: 'from-cyan-900 via-teal-900 to-green-900',
    wallColor: '#06b6d4',
    gridColor: 'rgba(6, 182, 212, 0.1)',
    portals: [
      { from: { x: 2, y: 2 }, to: { x: 17, y: 17 } },
      { from: { x: 17, y: 2 }, to: { x: 2, y: 17 } },
      { from: { x: 10, y: 10 }, to: { x: 5, y: 15 } },
    ],
  },
  {
    id: 'obstacles',
    name: 'Obstacle Course',
    description: 'Dodge static obstacles scattered around',
    icon: '🚧',
    type: 'obstacles',
    price: 15,
    currency: 'gems',
    difficulty: 'hard',
    features: ['Static obstacles', 'Precision required'],
    backgroundGradient: 'from-red-900 via-orange-900 to-yellow-900',
    wallColor: '#dc2626',
    gridColor: 'rgba(220, 38, 38, 0.1)',
    obstacles: [
      { x: 3, y: 3 }, { x: 7, y: 7 }, { x: 12, y: 5 }, { x: 16, y: 9 },
      { x: 5, y: 14 }, { x: 9, y: 11 }, { x: 14, y: 14 }, { x: 18, y: 3 },
      { x: 4, y: 8 }, { x: 11, y: 16 }, { x: 15, y: 7 }, { x: 8, y: 4 },
    ],
  },
  {
    id: 'arena',
    name: 'Battle Arena',
    description: 'Compact arena for intense gameplay',
    icon: '⚔️',
    type: 'arena',
    price: 25,
    currency: 'gems',
    difficulty: 'hard',
    features: ['Smaller play area', 'Fast-paced action'],
    backgroundGradient: 'from-rose-900 via-pink-900 to-fuchsia-900',
    wallColor: '#e11d48',
    gridColor: 'rgba(225, 29, 72, 0.1)',
  },
  {
    id: 'labyrinth',
    name: 'Labyrinth',
    description: 'Complex labyrinth with multiple paths',
    icon: '🏛️',
    type: 'labyrinth',
    price: 2.99,
    currency: 'USD',
    difficulty: 'hard',
    features: ['Complex paths', 'Multiple routes'],
    backgroundGradient: 'from-amber-900 via-yellow-900 to-orange-900',
    wallColor: '#d97706',
    gridColor: 'rgba(217, 119, 6, 0.1)',
    obstacles: [
      { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 6, y: 4 }, { x: 6, y: 5 },
      { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 10, y: 8 }, { x: 10, y: 9 },
      { x: 12, y: 12 }, { x: 12, y: 13 }, { x: 12, y: 14 }, { x: 14, y: 12 }, { x: 14, y: 13 },
      { x: 16, y: 4 }, { x: 16, y: 5 }, { x: 16, y: 6 }, { x: 18, y: 4 }, { x: 18, y: 5 },
    ],
  },
  {
    id: 'space',
    name: 'Space Station',
    description: 'Zero gravity space environment',
    icon: '🚀',
    type: 'space',
    price: 3.99,
    currency: 'USD',
    difficulty: 'medium',
    features: ['Space theme', 'Floating obstacles'],
    backgroundGradient: 'from-slate-900 via-blue-950 to-indigo-950',
    wallColor: '#3b82f6',
    gridColor: 'rgba(59, 130, 246, 0.1)',
    obstacles: [
      { x: 5, y: 5 }, { x: 15, y: 5 }, { x: 5, y: 15 }, { x: 15, y: 15 },
      { x: 10, y: 10 }, { x: 3, y: 10 }, { x: 17, y: 10 }, { x: 10, y: 3 }, { x: 10, y: 17 },
    ],
  },
  {
    id: 'underwater',
    name: 'Underwater Reef',
    description: 'Dive into the deep ocean',
    icon: '🐠',
    type: 'underwater',
    price: 4.99,
    currency: 'USD',
    difficulty: 'medium',
    features: ['Ocean theme', 'Coral obstacles'],
    backgroundGradient: 'from-blue-900 via-cyan-900 to-teal-900',
    wallColor: '#0891b2',
    gridColor: 'rgba(8, 145, 178, 0.1)',
    obstacles: [
      { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 14, y: 6 }, { x: 15, y: 6 }, { x: 16, y: 6 },
      { x: 4, y: 14 }, { x: 5, y: 14 }, { x: 6, y: 14 }, { x: 14, y: 14 }, { x: 15, y: 14 }, { x: 16, y: 14 },
      { x: 10, y: 4 }, { x: 10, y: 16 },
    ],
  },
  // NEW FREE MAPS
  {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'Navigate through mystical woods',
    icon: '🌲',
    type: 'maze',
    price: 0,
    currency: 'coins',
    difficulty: 'easy',
    features: ['Forest theme', 'Tree obstacles', 'Free map'],
    backgroundGradient: 'from-green-900 via-emerald-900 to-teal-900',
    wallColor: '#16a34a',
    gridColor: 'rgba(22, 163, 74, 0.1)',
    obstacles: [
      { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 3 },
      { x: 8, y: 8 }, { x: 8, y: 9 }, { x: 9, y: 8 }, { x: 9, y: 9 },
      { x: 15, y: 5 }, { x: 15, y: 6 }, { x: 16, y: 5 },
      { x: 5, y: 15 }, { x: 6, y: 15 }, { x: 5, y: 16 }, { x: 6, y: 16 },
      { x: 12, y: 12 }, { x: 13, y: 12 }, { x: 12, y: 13 },
    ],
    free: true,
  },
  {
    id: 'desert',
    name: 'Desert Dunes',
    description: 'Survive the scorching sands',
    icon: '🏜️',
    type: 'obstacles',
    price: 0,
    currency: 'coins',
    difficulty: 'medium',
    features: ['Desert theme', 'Sand dunes', 'Free map'],
    backgroundGradient: 'from-yellow-900 via-orange-900 to-red-900',
    wallColor: '#ca8a04',
    gridColor: 'rgba(202, 138, 4, 0.1)',
    obstacles: [
      { x: 2, y: 2 }, { x: 6, y: 4 }, { x: 10, y: 2 }, { x: 14, y: 6 },
      { x: 4, y: 10 }, { x: 8, y: 8 }, { x: 12, y: 12 }, { x: 16, y: 14 },
      { x: 18, y: 18 }, { x: 2, y: 16 }, { x: 6, y: 18 }, { x: 10, y: 16 },
    ],
    free: true,
  },
  {
    id: 'volcano',
    name: 'Volcanic Lair',
    description: 'Dance around the lava flows',
    icon: '🌋',
    type: 'obstacles',
    price: 0,
    currency: 'coins',
    difficulty: 'hard',
    features: ['Volcano theme', 'Lava obstacles', 'Free map'],
    backgroundGradient: 'from-red-950 via-orange-950 to-yellow-950',
    wallColor: '#dc2626',
    gridColor: 'rgba(220, 38, 38, 0.15)',
    obstacles: [
      { x: 5, y: 5 }, { x: 6, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 6 },
      { x: 13, y: 5 }, { x: 14, y: 5 }, { x: 13, y: 6 }, { x: 14, y: 6 },
      { x: 9, y: 9 }, { x: 10, y: 9 }, { x: 9, y: 10 }, { x: 10, y: 10 },
      { x: 5, y: 13 }, { x: 6, y: 13 }, { x: 5, y: 14 }, { x: 6, y: 14 },
      { x: 13, y: 13 }, { x: 14, y: 13 }, { x: 13, y: 14 }, { x: 14, y: 14 },
    ],
    free: true,
  },
  {
    id: 'arctic',
    name: 'Arctic Tundra',
    description: 'Brave the frozen wilderness',
    icon: '❄️',
    type: 'maze',
    price: 0,
    currency: 'coins',
    difficulty: 'medium',
    features: ['Ice theme', 'Frozen paths', 'Free map'],
    backgroundGradient: 'from-blue-950 via-cyan-950 to-slate-950',
    wallColor: '#0ea5e9',
    gridColor: 'rgba(14, 165, 233, 0.1)',
    obstacles: [
      { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 }, { x: 4, y: 6 },
      { x: 10, y: 4 }, { x: 10, y: 5 }, { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 10, y: 8 },
      { x: 16, y: 2 }, { x: 16, y: 3 }, { x: 16, y: 4 }, { x: 16, y: 5 }, { x: 16, y: 6 },
      { x: 7, y: 12 }, { x: 7, y: 13 }, { x: 7, y: 14 }, { x: 7, y: 15 }, { x: 7, y: 16 },
      { x: 13, y: 12 }, { x: 13, y: 13 }, { x: 13, y: 14 }, { x: 13, y: 15 }, { x: 13, y: 16 },
    ],
    free: true,
  },
  {
    id: 'candy',
    name: 'Candy Land',
    description: 'Sweet treats everywhere!',
    icon: '🍭',
    type: 'classic',
    price: 0,
    currency: 'coins',
    difficulty: 'easy',
    features: ['Candy theme', 'No obstacles', 'Free map'],
    backgroundGradient: 'from-pink-900 via-purple-900 to-indigo-900',
    wallColor: '#ec4899',
    gridColor: 'rgba(236, 72, 153, 0.1)',
    free: true,
  },
  {
    id: 'haunted',
    name: 'Haunted Mansion',
    description: 'Spooky scares at every turn',
    icon: '👻',
    type: 'labyrinth',
    price: 0,
    currency: 'coins',
    difficulty: 'hard',
    features: ['Horror theme', 'Complex maze', 'Free map'],
    backgroundGradient: 'from-gray-950 via-purple-950 to-black',
    wallColor: '#7c3aed',
    gridColor: 'rgba(124, 58, 237, 0.15)',
    obstacles: [
      { x: 3, y: 3 }, { x: 3, y: 4 }, { x: 4, y: 3 }, { x: 4, y: 4 },
      { x: 7, y: 7 }, { x: 7, y: 8 }, { x: 8, y: 7 }, { x: 8, y: 8 },
      { x: 11, y: 11 }, { x: 11, y: 12 }, { x: 12, y: 11 }, { x: 12, y: 12 },
      { x: 15, y: 15 }, { x: 15, y: 16 }, { x: 16, y: 15 }, { x: 16, y: 16 },
      { x: 5, y: 10 }, { x: 6, y: 10 }, { x: 10, y: 5 }, { x: 10, y: 6 },
    ],
    free: true,
  },
];
