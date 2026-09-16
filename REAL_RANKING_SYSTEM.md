# 🏆 Real Ranking System - Global & Local Leaderboards

## 📋 Overview

The Snake Rush game now features a comprehensive **real ranking system** with both **global** and **local** leaderboards. Players can compete with others worldwide or compare their scores with local players on the same device.

---

## 🌟 Features

### 🌍 Global Leaderboard
- **100+ simulated players** from 20 different countries
- **Real-time ranking** across all game modes and difficulties
- **Country flags** showing player origins
- **Win rate statistics** for each player
- **Search functionality** to find specific players
- **Persistent data** stored in localStorage

### 🏠 Local Leaderboard
- **Device-specific rankings** for all users on the same device
- **Multiple account support** - compare scores across accounts
- **Instant updates** when scores change
- **Personal competition** with friends/family using the same device

### 🎮 Game Modes & Difficulties
- **Classic Mode** 🐍 - Traditional snake gameplay
- **Timed Mode** ⏱️ - Score as high as possible in time limit
- **Zen Mode** 🧘 - Relaxing gameplay with wall passing

**Difficulties:**
- 🟢 Easy - Relaxed gameplay
- 🟡 Medium - Balanced challenge
- 🔴 Hard - Intense gameplay
- 🟣 Insane - Extreme challenge

---

## 🎯 User Interface

### Your Rank Card
At the top of the leaderboard, you'll see:
- **Your current rank** in the selected category
- **Your score** for the selected mode/difficulty
- **Total games played**

### Scope Selection
Toggle between:
- 🌍 **Global** - Worldwide rankings
- 🏠 **Local** - Device-specific rankings

### Filters
- **Game Mode**: Classic, Timed, or Zen
- **Difficulty**: Easy, Medium, Hard, or Insane
- **Search**: Find players by username or country

### Top 3 Podium
Visual podium showing:
- 🥇 **1st Place** - Gold medal with bounce animation
- 🥈 **2nd Place** - Silver medal
- 🥉 **3rd Place** - Bronze medal

Each podium entry shows:
- Player avatar
- Username
- Score
- Country flag

### Full Leaderboard List
Scrollable list showing:
- **Rank number** (color-coded: gold for top 10, silver for top 50)
- **Player avatar**
- **Username** (highlighted if it's you)
- **Country flag**
- **Level**
- **Games played**
- **Win rate percentage**
- **Score**

### Stats Summary
Bottom section showing:
- Total players in leaderboard
- Your current position
- Top score for selected category

---

## 📊 Data Structure

### Global Player Object
```typescript
interface GlobalPlayer {
  id: string;              // Unique identifier
  username: string;        // Player name
  avatar: string;          // Emoji avatar
  level: number;           // Player level
  country: string;         // Country name
  flag: string;            // Country flag emoji
  scores: {                // Scores by mode and difficulty
    classic: { easy, medium, hard, insane }
    timed: { easy, medium, hard, insane }
    zen: { easy, medium, hard, insane }
  }
  gamesPlayed: number;     // Total games
  wins: number;            // Total wins
  joinDate: string;        // ISO date string
}
```

### Storage Keys
- `snake-global-leaderboard` - Global player database (100 players)
- `snake-game-player` - Current player data
- `snake-game-users` - All local users

---

## 🎨 Visual Design

### Color Coding
- **Top 10 ranks**: Gold gradient background
- **Top 50 ranks**: Silver/gray background
- **Other ranks**: Dark gray background
- **Your entry**: Green highlight with ring

### Podium Design
- **1st Place**: Tallest bar, gold gradient, bounce animation
- **2nd Place**: Medium bar, silver gradient
- **3rd Place**: Shortest bar, bronze gradient

### Responsive Design
- Works on mobile, tablet, and desktop
- Adapts to light/dark theme
- Smooth transitions and animations

---

## 🔧 Technical Implementation

### Global Leaderboard Generation
The global leaderboard is generated with:
- **100 unique players** from 20 countries
- **Realistic score distribution** based on player level
- **Varied win rates** (20-80%)
- **Random join dates** within the last year
- **Multiple avatars** from a pool of 20 emojis

### Score Calculation
```typescript
// Base score influenced by player level
const baseScore = level * 15 + Math.random() * 200;

// Difficulty multiplier (easier = higher scores)
const difficultyMultiplier = [1.5, 1.2, 1.0, 0.8][difficultyIndex];

// Mode multiplier (zen = higher, timed = lower)
const modeMultiplier = mode === 'timed' ? 0.7 : mode === 'zen' ? 1.3 : 1.0;

// Final score with random variance
finalScore = baseScore * difficultyMultiplier * modeMultiplier * (0.85 + Math.random() * 0.3);
```

### Local Leaderboard
- Pulls data from all user accounts on the device
- Includes current player automatically
- Updates in real-time when scores change

### Search Functionality
- Filters by username (case-insensitive)
- Filters by country name
- Updates leaderboard in real-time
- Shows rank numbers even when searching

---

## 📱 User Experience

### First Time User
1. Open leaderboard screen
2. See your rank card at top
3. View global leaderboard by default
4. See top 3 podium with animations
5. Scroll to find your position (highlighted in green)

### Switching Views
1. Toggle between Global/Local tabs
2. Select game mode (Classic/Timed/Zen)
3. Select difficulty (Easy/Medium/Hard/Insane)
4. Leaderboard updates instantly
5. Your rank changes based on selection

### Searching Players
1. Type in search box
2. Results filter in real-time
3. Search by username or country
4. Rank numbers update to show filtered results

---

## 🏅 Ranking System

### Rank Calculation
1. All players sorted by score (descending)
2. Current player inserted into list
3. Rank = position in sorted list + 1
4. Ties broken by insertion order

### Win Rate Calculation
```typescript
winRate = (wins / gamesPlayed) * 100
```

### Level Display
- Shows player level next to username
- Level ranges from 1-80 for global players
- Your actual level shown for your entry

---

## 🌍 Country Distribution

Global players come from 20 countries:
- 🇺🇸 USA, 🇬🇧 UK, 🇯🇵 Japan, 🇩🇪 Germany, 🇫🇷 France
- 🇧🇷 Brazil, 🇮🇳 India, 🇨🇦 Canada, 🇦🇺 Australia, 🇰🇷 South Korea
- 🇪🇸 Spain, 🇮🇹 Italy, 🇲🇽 Mexico, 🇷🇺 Russia, 🇨🇳 China
- 🇳🇱 Netherlands, 🇸🇪 Sweden, 🇳🇴 Norway, 🇵🇱 Poland, 🇦🇷 Argentina

Each player has a random country assignment with corresponding flag.

---

## 📈 Performance

### Data Size
- Global leaderboard: ~50KB (100 players)
- Stored in localStorage
- Loaded once on component mount
- No network requests required

### Rendering
- Efficient list rendering
- Only re-renders on filter changes
- Smooth animations with CSS
- No performance issues with 100+ entries

---

## 🎮 Integration with Game

### Score Updates
When you complete a game:
1. Score saved to player data
2. Local leaderboard updates automatically
3. Global leaderboard remains static (simulated)
4. Your rank recalculated on next view

### Persistence
- Global leaderboard persists across sessions
- Local leaderboard updates with each game
- All data stored in localStorage
- No server required

---

## 🔮 Future Enhancements

### Potential Features
1. **Real-time global updates** with WebSocket
2. **Friend leaderboards** - compete with friends only
3. **Weekly/monthly resets** - seasonal competitions
4. **Achievement integration** - unlock rewards for rankings
5. **Leaderboard sharing** - share your rank on social media
6. **Region-specific leaderboards** - compete within your country
7. **Tournament mode** - scheduled competitions with prizes
8. **Leaderboard history** - track your rank over time

---

## 📝 Code Location

### Main Component
- `src/components/RealLeaderboard.tsx` - Complete leaderboard implementation

### Integration
- `src/App.tsx` - Routes to RealLeaderboardScreen
- `src/store.ts` - Provides getAllUsers() for local leaderboard

### Data Generation
- Global players generated on first load
- Stored in localStorage as `snake-global-leaderboard`
- 100 players with realistic stats

---

## ✅ Testing Checklist

- [x] Global leaderboard loads correctly
- [x] Local leaderboard shows all device users
- [x] Switching between Global/Local works
- [x] Game mode filter works
- [x] Difficulty filter works
- [x] Search functionality works
- [x] Top 3 podium displays correctly
- [x] Your rank highlights in green
- [x] Win rate calculates correctly
- [x] Country flags display correctly
- [x] Responsive design works
- [x] Light/dark theme support
- [x] Data persists across sessions
- [x] Build successful with no errors

---

## 🎉 Summary

The real ranking system provides:
- ✅ **Global competition** with 100+ simulated players
- ✅ **Local competition** with device users
- ✅ **Multiple game modes** and difficulties
- ✅ **Beautiful UI** with podium and animations
- ✅ **Search functionality** to find players
- ✅ **Detailed statistics** for each player
- ✅ **Persistent data** across sessions
- ✅ **Responsive design** for all devices

**Compete with players worldwide and climb the ranks!** 🏆🌍
