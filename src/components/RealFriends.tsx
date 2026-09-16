import { useState, useEffect } from 'react';
import { Player, Theme, Friend } from '../types';
import { savePlayer, getAllUsers } from '../store';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// ============ REAL FRIEND SYSTEM ============
export function RealFriendsScreen({ player, setPlayer, onBack, theme, onSelectMode }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
  onSelectMode: (mode: 'online', difficulty: any) => void;
}) {
  const [tab, setTab] = useState<'friends' | 'search' | 'games'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Player[]>([]);
  const [showGiftModal, setShowGiftModal] = useState<string | null>(null);
  const [giftAmount, setGiftAmount] = useState(10);

  // Get all registered players (simulating online players)
  const getAllPlayers = (): Player[] => {
    const users = getAllUsers();
    // Filter out current player
    return users.filter(u => u.id !== player.id);
  };

  // Get friend details with online status
  const getFriendDetails = (friendId: string): Friend | null => {
    const allPlayers = getAllPlayers();
    const friendPlayer = allPlayers.find(p => p.id === friendId);
    
    if (!friendPlayer) return null;

    // Simulate online status (random for demo)
    const isOnline = Math.random() > 0.5;
    const lastSeen = isOnline ? 'Online' : `${Math.floor(Math.random() * 60)} mins ago`;

    return {
      id: friendPlayer.id,
      username: friendPlayer.username,
      avatar: friendPlayer.avatar,
      level: friendPlayer.level,
      lastSeen,
      isOnline,
      subscriptionTier: friendPlayer.subscription.tier,
    };
  };

  // Get all friends with details
  const friends: Friend[] = player.friends
    .map(friendId => getFriendDetails(friendId))
    .filter((f): f is Friend => f !== null);

  // Search players
  useEffect(() => {
    if (searchQuery.trim()) {
      const allPlayers = getAllPlayers();
      const results = allPlayers.filter(p => 
        p.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !player.friends.includes(p.id)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, player.friends]);

  // Add friend
  const addFriend = (friendId: string) => {
    audioManager.playSuccessSound();
    
    const updated = {
      ...player,
      friends: [...player.friends, friendId],
      coins: player.coins + 50, // Bonus for adding friend
    };
    
    setPlayer(updated);
    savePlayer(updated);
  };

  // Remove friend
  const removeFriend = (friendId: string) => {
    audioManager.playClickSound();
    
    const updated = {
      ...player,
      friends: player.friends.filter(id => id !== friendId),
    };
    
    setPlayer(updated);
    savePlayer(updated);
  };

  // Send gift
  const sendGift = (friendId: string) => {
    if (player.coins < giftAmount) return;

    audioManager.playSuccessSound();
    
    const updated = {
      ...player,
      coins: player.coins - giftAmount,
    };
    
    setPlayer(updated);
    savePlayer(updated);
    setShowGiftModal(null);
  };

  // Play with friend
  const playWithFriend = (friendId: string) => {
    audioManager.playClickSound();
    onSelectMode('online', 'medium');
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">👥</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Friends</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Connect and play with friends!</p>
          <div className="flex justify-center gap-4 mt-3">
            <span className="text-sm text-yellow-400">🪙 {player.coins}</span>
            <span className="text-sm text-purple-400">💎 {player.gems}</span>
          </div>
        </div>

        {/* Player ID Display */}
        <div className={`${t(theme, 'bg-blue-900/20 border-blue-500/30', 'bg-blue-50 border-blue-300')} rounded-xl p-4 mb-4 border`}>
          <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1`}>Your Player ID</div>
          <div className={`text-sm font-mono ${t(theme, 'text-white', 'text-gray-900')} break-all`}>{player.id}</div>
          <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mt-1`}>Share this ID with friends to add you!</div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              tab === 'friends'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            }`}
          >
            👥 Friends ({friends.length})
          </button>
          <button
            onClick={() => setTab('search')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              tab === 'search'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            }`}
          >
            🔍 Search
          </button>
          <button
            onClick={() => setTab('games')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              tab === 'games'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            }`}
          >
            🎮 Play
          </button>
        </div>

        {/* Friends Tab */}
        {tab === 'friends' && (
          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-8 border text-center`}>
                <div className="text-5xl mb-3">👋</div>
                <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>No friends yet</div>
                <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-4`}>
                  Search for players and add them as friends!
                </div>
                <button
                  onClick={() => setTab('search')}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white font-bold rounded-lg"
                >
                  🔍 Find Friends
                </button>
              </div>
            ) : (
              friends.map(friend => (
                <div
                  key={friend.id}
                  className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="text-3xl">{friend.avatar}</div>
                      {friend.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{friend.username}</div>
                        {friend.subscriptionTier !== 'free' && (
                          <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full">
                            {friend.subscriptionTier === 'premium' ? '⭐' : friend.subscriptionTier === 'ultimate' ? '👑' : '🎫'}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                        Level {friend.level} • {friend.isOnline ? '🟢 Online' : `⚫ ${friend.lastSeen}`}
                      </div>
                      <div className={`text-xs font-mono ${t(theme, 'text-gray-500', 'text-gray-400')} mt-1`}>
                        ID: {friend.id.slice(0, 8)}...
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {friend.isOnline && (
                        <button
                          onClick={() => playWithFriend(friend.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg text-xs"
                        >
                          ▶ Play
                        </button>
                      )}
                      <button
                        onClick={() => setShowGiftModal(friend.id)}
                        className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-lg text-xs"
                      >
                        🎁 Gift
                      </button>
                      <button
                        onClick={() => removeFriend(friend.id)}
                        className={`px-3 py-1.5 ${t(theme, 'bg-red-900/30 hover:bg-red-900/50 text-red-400', 'bg-red-100 hover:bg-red-200 text-red-600')} font-bold rounded-lg text-xs`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Search Tab */}
        {tab === 'search' && (
          <div>
            <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border mb-4`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className={`w-full px-4 py-2 ${t(theme, 'bg-gray-900 border-gray-700 text-white placeholder-gray-500', 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400')} border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
            </div>

            {searchResults.length === 0 ? (
              <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-8 border text-center`}>
                <div className="text-5xl mb-3">🔍</div>
                <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>
                  {searchQuery ? 'No players found' : 'Search for players'}
                </div>
                <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                  {searchQuery ? 'Try a different search term' : 'Enter a username to find players'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map(searchPlayer => (
                  <div
                    key={searchPlayer.id}
                    className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{searchPlayer.avatar}</div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{searchPlayer.username}</div>
                          {searchPlayer.subscription.tier !== 'free' && (
                            <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full">
                              {searchPlayer.subscription.tier === 'premium' ? '⭐' : searchPlayer.subscription.tier === 'ultimate' ? '👑' : '🎫'}
                            </span>
                          )}
                        </div>
                        <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                          Level {searchPlayer.level}
                        </div>
                        <div className={`text-xs font-mono ${t(theme, 'text-gray-500', 'text-gray-400')} mt-1`}>
                          ID: {searchPlayer.id.slice(0, 8)}...
                        </div>
                      </div>

                      <button
                        onClick={() => addFriend(searchPlayer.id)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg text-sm"
                      >
                        ➕ Add Friend
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Games Tab */}
        {tab === 'games' && (
          <div className="space-y-3">
            <button
              onClick={() => onSelectMode('online', 'medium')}
              className={`w-full ${t(theme, 'bg-gray-800/60 border-gray-700/50 hover:scale-105', 'bg-white border-gray-200 shadow-sm hover:scale-105')} rounded-xl p-6 border text-left transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⚡</div>
                <div className="flex-1">
                  <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Quick Match</div>
                  <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Find an opponent instantly</div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </button>

            <button
              onClick={() => onSelectMode('online', 'hard')}
              className={`w-full ${t(theme, 'bg-gray-800/60 border-gray-700/50 hover:scale-105', 'bg-white border-gray-200 shadow-sm hover:scale-105')} rounded-xl p-6 border text-left transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏆</div>
                <div className="flex-1">
                  <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Ranked Match</div>
                  <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Compete for leaderboard position</div>
                </div>
                <div className="text-2xl">→</div>
              </div>
            </button>

            {friends.filter(f => f.isOnline).length > 0 && (
              <div className={`${t(theme, 'bg-green-900/20 border-green-500/30', 'bg-green-50 border-green-300')} rounded-xl p-4 border`}>
                <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>
                  🟢 {friends.filter(f => f.isOnline).length} friends online
                </div>
                <div className="space-y-2">
                  {friends.filter(f => f.isOnline).map(friend => (
                    <div key={friend.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{friend.avatar}</span>
                        <span className={`text-sm ${t(theme, 'text-white', 'text-gray-900')}`}>{friend.username}</span>
                      </div>
                      <button
                        onClick={() => playWithFriend(friend.id)}
                        className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg text-xs"
                      >
                        ▶ Invite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gift Modal */}
        {showGiftModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${t(theme, 'bg-gray-800 border-gray-700', 'bg-white border-gray-300')} rounded-2xl p-6 max-w-sm w-full border`}>
              <h3 className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-4`}>🎁 Send Gift</h3>
              
              <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-4`}>
                Send coins to your friend!
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1 block`}>Amount</label>
                  <input
                    type="number"
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    min="1"
                    max={player.coins}
                    className={`w-full px-3 py-2 ${t(theme, 'bg-gray-900 border-gray-700 text-white', 'bg-white border-gray-300 text-gray-900')} border rounded-lg`}
                  />
                </div>

                <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-400')}`}>
                  Your balance: 🪙 {player.coins}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowGiftModal(null)}
                  className={`flex-1 py-2.5 ${t(theme, 'bg-gray-700 hover:bg-gray-600 text-gray-300', 'bg-gray-200 hover:bg-gray-300 text-gray-700')} rounded-lg font-medium`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendGift(showGiftModal)}
                  disabled={player.coins < giftAmount}
                  className="flex-1 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send 🪙 {giftAmount}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
