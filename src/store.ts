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
    // Premium features
    subscription: {
      tier: 'free',
      status: 'none',
      startDate: '',
      endDate: '',
      autoRenew: false,
    },
    friends: [],
    friendRequests: [],
    googleAccount: undefined,
    isPremium: false,
    premiumSkinsUnlocked: [],
    battlePassLevel: 1,
    battlePassXp: 0,
    battlePassRewards: [],
    // Characters & Chests
    equippedCharacter: 'snake_classic',
    ownedCharacters: ['snake_classic'],
    ownedCharacterSkins: ['classic_green'],
    equippedCharacterSkin: 'classic_green',
    keys: 0,
    chests: {
      wooden_chest: 0,
      silver_chest: 0,
      golden_chest: 0,
      legendary_chest: 0,
    },
    gamesWon: 0,
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
    const player = JSON.parse(data) as Player;
    
    // Migration: Add missing fields for existing players
    if (!player.titles) {
      player.titles = ['newbie'];
    }
    if (!player.equippedTitle) {
      player.equippedTitle = 'newbie';
    }
    if (player.gamesWonVsBot === undefined) {
      player.gamesWonVsBot = 0;
    }
    if (player.zenGamesPlayed === undefined) {
      player.zenGamesPlayed = 0;
    }
    
    // Migration: Premium features
    if (!player.subscription) {
      player.subscription = {
        tier: 'free',
        status: 'none',
        startDate: '',
        endDate: '',
        autoRenew: false,
      };
    }
    if (!player.friends) {
      player.friends = [];
    }
    if (!player.friendRequests) {
      player.friendRequests = [];
    }
    if (player.isPremium === undefined) {
      player.isPremium = false;
    }
    if (!player.premiumSkinsUnlocked) {
      player.premiumSkinsUnlocked = [];
    }
    if (player.battlePassLevel === undefined) {
      player.battlePassLevel = 1;
    }
    if (player.battlePassXp === undefined) {
      player.battlePassXp = 0;
    }
    if (!player.battlePassRewards) {
      player.battlePassRewards = [];
    }
    
    // Migration: Characters & Chests
    if (!player.equippedCharacter) {
      player.equippedCharacter = 'snake_classic';
    }
    if (!player.ownedCharacters) {
      player.ownedCharacters = ['snake_classic'];
    }
    if (!player.ownedCharacterSkins) {
      player.ownedCharacterSkins = ['classic_green'];
    }
    if (!player.equippedCharacterSkin) {
      player.equippedCharacterSkin = 'classic_green';
    }
    if (player.keys === undefined) {
      player.keys = 0;
    }
    if (!player.chests) {
      player.chests = {
        wooden_chest: 0,
        silver_chest: 0,
        golden_chest: 0,
        legendary_chest: 0,
      };
    }
    if (player.gamesWon === undefined) {
      player.gamesWon = 0;
    }
    
    return player;
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
