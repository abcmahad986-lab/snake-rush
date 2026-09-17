# 🌀 Zen Multiplayer Mode - Complete Guide

## Overview

Zen Multiplayer is a special game mode that combines the relaxing wall-passing mechanics of Zen mode with competitive multiplayer gameplay. In this mode, you compete against a bot opponent, and both snakes can pass through walls without dying!

## 🎮 How It Works

### Game Mechanics

1. **Wall Passing**: Both player and bot can pass through walls
   - When a snake hits a wall, it wraps around to the opposite side
   - No game over from wall collisions
   - Creates unique strategic opportunities

2. **Bot AI**: The bot uses intelligent pathfinding
   - Calculates shortest path to food considering wall wrapping
   - Avoids colliding with the player's snake
   - Avoids self-collision
   - Uses zen-aware distance calculations

3. **Scoring**: Same as regular multiplayer
   - Each food = 10 points
   - Combo bonuses for consecutive food
   - Higher score wins the game

### Controls

- **Player 1**: WASD or Arrow Keys
- **Bot**: AI-controlled opponent

## 🎯 Strategic Tips

### Using Wall Wrapping

1. **Escape Routes**: When cornered, use walls to escape
   - The bot might not expect you to wrap around
   - Creates unpredictable movement patterns

2. **Shortcut Paths**: Use walls to reach food faster
   - Sometimes going through a wall is shorter than going around
   - The bot calculates this too, so be strategic

3. **Ambush Tactics**: Come from unexpected directions
   - Wrap around to approach food from behind the bot
   - Use walls to create flanking maneuvers

### Avoiding Collisions

1. **Watch the Bot**: Keep track of bot's position
   - Even though walls are safe, snake-to-snake collision ends the game
   - The bot is also trying to avoid you

2. **Plan Ahead**: Think 2-3 moves in advance
   - Consider where the bot might go
   - Use wall wrapping to create distance

3. **Control the Center**: The center offers more escape routes
   - From the center, you can reach any wall quickly
   - More options for wall wrapping

## 🤖 Bot AI Behavior

### How the Bot Thinks

The bot uses a sophisticated AI algorithm that:

1. **Evaluates All Directions**: Checks UP, DOWN, LEFT, RIGHT
2. **Scores Each Option**: Based on multiple factors
   - Distance to food (closer = better)
   - Self-collision risk (very bad)
   - Player collision risk (bad)
   - Food adjacency bonus (good)
   - Small random factor (unpredictability)

3. **Zen Mode Adjustments**: In zen multiplayer, the bot:
   - Calculates wrapped distances correctly
   - Doesn't penalize wall positions
   - Uses modular arithmetic for pathfinding
   - Can wrap around walls just like the player

### Bot Difficulty

The bot's difficulty is consistent across all difficulty levels:
- **Easy**: Slower game speed, bot has more time to think
- **Medium**: Balanced speed
- **Hard**: Faster game speed, less reaction time
- **Insane**: Very fast, requires quick reflexes

## 🎨 Visual Indicators

### Zen Mode Badge

When playing Zen Multiplayer, you'll see a purple badge at the top of the game board:

```
🌀 Walls disabled - pass through!
```

This reminds you that walls are safe in this mode.

### Game Over Screen

When the game ends, the screen shows:
- **🏆 Trophy icon** if you won
- **"You Win!"** or **"Bot Wins!"** message
- Your score vs Bot score
- XP and coins earned

## 📊 Scoring and Rewards

### Points System

- **Base Food**: 10 points per food
- **Combo Bonus**: +5 points per combo level (every 3 foods)
- **Score Multiplier**: 2x with double power-up, 3x with score boost

### Rewards

After each game, you receive:
- **XP**: Based on your score and difficulty
- **Coins**: Based on your score
- **Keys**: If you beat the bot (1-5 keys based on difficulty)
- **Chests**: Based on your score tier
  - 200+ points: Legendary Chest
  - 100-199 points: Golden Chest
  - 50-99 points: Silver Chest
  - <50 points: Wooden Chest

### Achievements

Zen Multiplayer contributes to several achievements:
- **First Steps**: Play your first game
- **Getting Started**: Play 10 games
- **Dedicated Player**: Play 50 games
- **Snake Master**: Play 100 games
- **Bot Slayer**: Win 5 games against the bot
- **Bot Destroyer**: Win 20 games against the bot

## 🔄 Comparison with Other Modes

### vs Regular Multiplayer

| Feature | Regular Multiplayer | Zen Multiplayer |
|---------|-------------------|-----------------|
| Walls | Deadly | Pass-through |
| Strategy | Avoid walls | Use walls |
| Game Length | Shorter | Longer |
| Risk Level | High | Medium |
| Bot AI | Standard | Zen-aware |

### vs Single-Player Zen

| Feature | Single-Player Zen | Zen Multiplayer |
|---------|------------------|-----------------|
| Opponent | None | Bot |
| Competition | Personal best | vs Bot |
| Strategy | Relaxing | Competitive |
| Score Pressure | Low | Medium |

## 🎮 How to Access

### From Main Menu

1. Click the **"Multiplayer"** mode button
2. Select **"Zen Multiplayer"** from the options
3. Choose your difficulty level
4. Click **"Play"** to start

### Quick Access

You can also access Zen Multiplayer directly from the main menu by:
1. Selecting **"Multiplayer"** mode
2. Choosing your difficulty
3. Clicking the **"🌀 Zen Multiplayer"** option

## 🐛 Known Issues and Fixes

### Issue: Bot Not Moving

**Problem**: In earlier versions, the bot wouldn't move in Zen Multiplayer mode.

**Root Cause**: The bot AI was only triggered when `multiplayerType === 'bot'`, but Zen Multiplayer uses `multiplayerType === 'zen'`.

**Fix**: Updated the bot AI condition to include both 'bot' and 'zen' multiplayer types:
```javascript
if (isMultiplayer && (multiplayerType === 'bot' || multiplayerType === 'zen')) {
  const botDir = getBotDirection(..., multiplayerType === 'zen');
  // Bot moves correctly
}
```

### Issue: Bot Ignoring Walls

**Problem**: The bot would avoid walls even in Zen mode, making it less effective.

**Root Cause**: The bot AI didn't know about zen mode and treated walls as deadly.

**Fix**: Added `isZenMode` parameter to `getBotDirection()` function:
```javascript
function getBotDirection(..., isZenMode?: boolean) {
  if (isZenMode) {
    // Wrap coordinates around walls
    // Calculate wrapped distances
    // Don't penalize wall positions
  }
}
```

### Issue: Incorrect Game Over Message

**Problem**: Game over screen showed "Player 2 Wins!" instead of "Bot Wins!" in Zen Multiplayer.

**Root Cause**: The game over logic only checked for `multiplayerType === 'bot'`, not 'zen'.

**Fix**: Updated the condition to include both types:
```javascript
(multiplayerType === 'bot' || multiplayerType === 'zen') ? 'Bot Wins!' : 'Player 2 Wins!'
```

## 🎯 Best Practices

### For Beginners

1. **Start with Easy difficulty**: Get comfortable with wall wrapping
2. **Focus on survival**: Don't worry about winning at first
3. **Learn the map**: Understand how wall wrapping works
4. **Watch the bot**: Learn its patterns and behaviors

### For Advanced Players

1. **Use wall wrapping aggressively**: Create unexpected paths
2. **Predict bot movement**: Anticipate where the bot will go
3. **Control the pace**: Speed up or slow down as needed
4. **Aim for combos**: Chain food collection for bonus points

### For Speed Runners

1. **Optimize paths**: Use wall wrapping for shortest routes
2. **Minimize turns**: Straight lines are faster
3. **Plan ahead**: Think 5-10 moves in advance
4. **Practice patterns**: Learn common food spawn locations

## 📈 Progression System

### Level Progression

As you play Zen Multiplayer, you'll:
- Gain XP for each game
- Level up your player profile
- Unlock new titles and achievements
- Earn coins and gems

### Unlockables

Zen Multiplayer contributes to unlocking:
- **Characters**: Level up to unlock new characters
- **Skins**: Earn through gameplay or purchase
- **Titles**: Complete achievements to earn titles
- **Maps**: Unlock new game maps

## 🎉 Conclusion

Zen Multiplayer is a unique and exciting game mode that combines the relaxation of zen gameplay with the competition of multiplayer. Whether you're a beginner looking for a forgiving mode or an advanced player seeking a new challenge, Zen Multiplayer offers something for everyone.

**Key Features:**
- ✅ Wall-passing mechanics
- ✅ Intelligent bot AI
- ✅ Strategic gameplay
- ✅ Rewards and achievements
- ✅ Multiple difficulty levels

**Have fun and enjoy the zen experience!** 🌀🐍
