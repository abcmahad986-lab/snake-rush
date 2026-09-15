import { Player, getXpForLevel, AVATARS } from './types';

const STORAGE_KEY = 'snake-game-player';
const USERS_KEY = 'snake-game-users';

export function createNewPlayer(username: string): Player {
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    username,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    level: 1,
    xp: 0,
    xpToNext: getXpForLevel(1),
    coins: 50,
    gems: 5,
    totalScore: 0,
    gamesPlayed: 0,
    totalFoodEaten: 0,
    longestSnake: 3,
    totalTimePlayed: 0,
    highScores: { easy: 0, medium: 0, hard: 0, insane: 0 },
    timedHighScores: { easy: 0, medium: 0, hard: 0, insane: 0 },
    trophies: [],
    titles: ['newbie'],
    equippedTitle: 'newbie',
    equippedSkin: 'classic',
    ownedSkins: ['classic'],
    equippedTrail: 'none',
    ownedTrails: ['none'],
    dailyStreak: 0,
    lastDailyClaim: '',
    lastLogin: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    achievements: {},
    eventProgress: {},
    gamesWonVsBot: 0,
    zenGamesPlayed: 0,
  };
}

export function savePlayer(player: Player): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  // Also save to users list
  const users = getAllUsers();
  const existing = users.findIndex(u => u.id === player.id);
  if (existing >= 0) {
    users[existing] = player;
  } else {
    users.push(player);
  }
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function loadPlayer(): Player | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as Player;
  } catch {
    return null;
  }
}

export function getAllUsers(): Player[] {
  const data = localStorage.getItem(USERS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data) as Player[];
  } catch {
    return [];
  }
}

export function switchUser(userId: string): Player | null {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function addXp(player: Player, amount: number): Player {
  let newXp = player.xp + amount;
  let newLevel = player.level;
  let xpToNext = player.xpToNext;

  while (newXp >= xpToNext) {
    newXp -= xpToNext;
    newLevel++;
    xpToNext = getXpForLevel(newLevel);
  }

  return { ...player, xp: newXp, level: newLevel, xpToNext: xpToNext };
}

export function getLoginReward(player: Player): { coins: number; gems: number; xp: number; streakDay: number } | null {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (player.lastDailyClaim === today) return null;

  let streak = player.dailyStreak;
  if (player.lastLogin === yesterday || player.lastLogin === '') {
    streak = (streak % 7) + 1;
  } else if (player.lastLogin !== today) {
    streak = 1;
  }

  const rewardIndex = (streak - 1) % 7;
  const rewards = [
    { coins: 20, gems: 0, xp: 10 },
    { coins: 30, gems: 1, xp: 15 },
    { coins: 50, gems: 1, xp: 20 },
    { coins: 40, gems: 2, xp: 25 },
    { coins: 60, gems: 2, xp: 30 },
    { coins: 80, gems: 3, xp: 40 },
    { coins: 150, gems: 5, xp: 100 },
  ];

  return { ...rewards[rewardIndex], streakDay: streak };
}

export function claimDailyReward(player: Player): Player {
  const reward = getLoginReward(player);
  if (!reward) return player;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  let streak = player.dailyStreak;
  if (player.lastLogin === yesterday || player.lastLogin === '') {
    streak = (streak % 7) + 1;
  } else if (player.lastLogin !== today) {
    streak = 1;
  }

  return {
    ...player,
    coins: player.coins + reward.coins,
    gems: player.gems + reward.gems,
    dailyStreak: streak,
    lastDailyClaim: today,
    lastLogin: today,
  };
}
