// ============ TYPES ============
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';
export type GameMode = 'classic' | 'timed' | 'multiplayer' | 'event' | 'zen' | 'online';
export type Screen = 'login' | 'home' | 'menu' | 'game' | 'profile' | 'trophies' | 'titles' | 'shop' | 'events' | 'leaderboard' | 'settings' | 'rewards' | 'subscription' | 'battlepass' | 'online' | 'google' | 'characters' | 'chests' | 'achievements' | 'spinwheel' | 'visualthemes' | 'realmoney' | 'maps' | 'games' | 'privacy' | 'terms' | 'about';
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
  easy: 180,
  medium: 120,
  hard: 75,
  insane: 45,
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
  }
];

// ============ CHARACTER SKINS ============
export const CHARACTER_SKINS: CharacterSkin[] = [
  // Classic Snake skins
  { id: 'classic_green', characterId: 'snake_classic', name: 'Forest Green', colors: { head: '#4ade80', body: '#22c55e', glow: 'rgba(74, 222, 128, 0.7)' }, unlockMethod: 'level', unlockRequirement: 1 },
  { id: 'classic_red', characterId: 'snake_classic', name: 'Ruby Red', colors: { head: '#f87171', body: '#ef4444', glow: 'rgba(248, 113, 113, 0.7)' }, unlockMethod: 'chest' },
  { id: 'classic_blue', characterId: 'snake_classic', name: 'Ocean Blue', colors: { head: '#60a5fa', body: '#3b82f6', glow: 'rgba(96, 165, 250, 0.7)' }, unlockMethod: 'purchase', unlockRequirement: 100 },
  
  // Dragon skins
  { id: 'dragon_fire', characterId: 'dragon', name: 'Inferno', colors: { head: '#fb923c', body: '#ea580c', glow: 'rgba(251, 146, 60, 0.7)' }, unlockMethod: 'level', unlockRequirement: 5 },
  { id: 'dragon_ice', characterId: 'dragon', name: 'Frost', colors: { head: '#93c5fd', body: '#3b82f6', glow: 'rgba(147, 197, 253, 0.7)' }, unlockMethod: 'chest' },
  { id: 'dragon_shadow', characterId: 'dragon', name: 'Shadow', colors: { head: '#a1a1aa', body: '#52525b', glow: 'rgba(161, 161, 170, 0.7)' }, unlockMethod: 'achievement' },
  
  // Phoenix skins
  { id: 'phoenix_gold', characterId: 'phoenix', name: 'Golden Flame', colors: { head: '#fde047', body: '#eab308', glow: 'rgba(253, 224, 71, 0.7)' }, unlockMethod: 'level', unlockRequirement: 10 },
  { id: 'phoenix_crimson', characterId: 'phoenix', name: 'Crimson Wing', colors: { head: '#f87171', body: '#dc2626', glow: 'rgba(248, 113, 113, 0.7)' }, unlockMethod: 'chest' },
  { id: 'phoenix_silver', characterId: 'phoenix', name: 'Silver Ash', colors: { head: '#d1d5db', body: '#9ca3af', glow: 'rgba(209, 213, 219, 0.7)' }, unlockMethod: 'purchase', unlockRequirement: 300 },
  
  // Unicorn skins
  { id: 'unicorn_rainbow', characterId: 'unicorn', name: 'Rainbow', colors: { head: '#f87171', body: '#a855f7', glow: 'rgba(248, 113, 113, 0.7)' }, unlockMethod: 'level', unlockRequirement: 15 },
  { id: 'unicorn_moonlight', characterId: 'unicorn', name: 'Moonlight', colors: { head: '#c4b5fd', body: '#8b5cf6', glow: 'rgba(196, 181, 253, 0.7)' }, unlockMethod: 'chest' },
  { id: 'unicorn_starlight', characterId: 'unicorn', name: 'Starlight', colors: { head: '#fde047', body: '#f59e0b', glow: 'rgba(253, 224, 71, 0.7)' }, unlockMethod: 'achievement' },
  
  // Kraken skins
  { id: 'kraken_abyss', characterId: 'kraken', name: 'Abyssal', colors: { head: '#818cf8', body: '#4f46e5', glow: 'rgba(129, 140, 248, 0.7)' }, unlockMethod: 'level', unlockRequirement: 20 },
  { id: 'kraken_storm', characterId: 'kraken', name: 'Storm', colors: { head: '#67e8f9', body: '#06b6d4', glow: 'rgba(103, 232, 249, 0.7)' }, unlockMethod: 'chest' },
  { id: 'kraken_void', characterId: 'kraken', name: 'Void', colors: { head: '#a78bfa', body: '#6d28d9', glow: 'rgba(167, 139, 250, 0.7)' }, unlockMethod: 'purchase', unlockRequirement: 500 },
  
  // Cosmic Serpent skins
  { id: 'cosmic_nebula', characterId: 'cosmic', name: 'Nebula', colors: { head: '#818cf8', body: '#4f46e5', glow: 'rgba(129, 140, 248, 0.7)' }, unlockMethod: 'level', unlockRequirement: 25 },
  { id: 'cosmic_galaxy', characterId: 'cosmic', name: 'Galaxy', colors: { head: '#c084fc', body: '#8b5cf6', glow: 'rgba(192, 132, 252, 0.7)' }, unlockMethod: 'chest' },
  { id: 'cosmic_supernova', characterId: 'cosmic', name: 'Supernova', colors: { head: '#fb923c', body: '#ea580c', glow: 'rgba(251, 146, 60, 0.7)' }, unlockMethod: 'achievement' }
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
];
