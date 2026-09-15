import { useState } from 'react';
import { Player, Screen, Theme, SubscriptionTier, SUBSCRIPTION_PLANS, PREMIUM_SKINS, BATTLE_PASS_REWARDS, MOCK_FRIENDS, Friend } from '../types';
import { savePlayer } from '../store';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// ============ SUBSCRIPTION SCREEN ============
export function SubscriptionScreen({ player, setPlayer, onBack, theme }: { 
  player: Player; 
  setPlayer: (p: Player) => void; 
  onBack: () => void; 
  theme: Theme;
}) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSubscribe = (tier: SubscriptionTier) => {
    setSelectedPlan(tier);
    setShowPayment(true);
  };

  const confirmPayment = () => {
    if (!selectedPlan) return;

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const updated = {
      ...player,
      subscription: {
        tier: selectedPlan,
        status: 'active' as const,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: true,
        paymentMethod: 'Credit Card',
      },
      isPremium: selectedPlan !== 'free',
      premiumSkinsUnlocked: selectedPlan === 'premium' || selectedPlan === 'ultimate' 
        ? PREMIUM_SKINS.map(s => s.id) 
        : player.premiumSkinsUnlocked,
    };

    setPlayer(updated);
    savePlayer(updated);
    setShowPayment(false);
    setSelectedPlan(null);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎫</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Snake Pass</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Unlock premium features and exclusive content</p>
        </div>

        {/* Current Subscription */}
        {player.isPremium && (
          <div className={`${t(theme, 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30', 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300')} rounded-xl p-4 mb-6 border`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Current Plan</div>
                <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                  {SUBSCRIPTION_PLANS.find(p => p.id === player.subscription.tier)?.icon}{' '}
                  {SUBSCRIPTION_PLANS.find(p => p.id === player.subscription.tier)?.name}
                </div>
                <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mt-1`}>
                  Expires: {new Date(player.subscription.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-4xl">✨</div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {SUBSCRIPTION_PLANS.filter(p => p.id !== 'free').map(plan => (
            <div
              key={plan.id}
              className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-lg')} rounded-xl p-5 border relative overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                  POPULAR
                </div>
              )}

              <div className={`text-4xl mb-2`}>{plan.icon}</div>
              <h3 className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>${plan.price}</span>
                <span className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>/{plan.duration}</span>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')} flex items-start gap-2`}>
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full py-2.5 bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95`}
              >
                {player.subscription.tier === plan.id ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {showPayment && selectedPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${t(theme, 'bg-gray-800 border-gray-700', 'bg-white border-gray-300')} rounded-2xl p-6 max-w-md w-full border`}>
              <h3 className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-4`}>Complete Payment</h3>
              
              <div className={`${t(theme, 'bg-gray-900/50', 'bg-gray-100')} rounded-lg p-4 mb-4`}>
                <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1`}>Plan</div>
                <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                  {SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.name}
                </div>
                <div className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mt-2`}>
                  ${SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.price}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1 block`}>Card Number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className={`w-full px-3 py-2 ${t(theme, 'bg-gray-900 border-gray-700 text-white', 'bg-white border-gray-300 text-gray-900')} border rounded-lg`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1 block`}>Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className={`w-full px-3 py-2 ${t(theme, 'bg-gray-900 border-gray-700 text-white', 'bg-white border-gray-300 text-gray-900')} border rounded-lg`}
                    />
                  </div>
                  <div>
                    <label className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1 block`}>CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className={`w-full px-3 py-2 ${t(theme, 'bg-gray-900 border-gray-700 text-white', 'bg-white border-gray-300 text-gray-900')} border rounded-lg`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPayment(false)}
                  className={`flex-1 py-2.5 ${t(theme, 'bg-gray-700 hover:bg-gray-600 text-gray-300', 'bg-gray-200 hover:bg-gray-300 text-gray-700')} rounded-lg font-medium`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPayment}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg"
                >
                  Pay Now
                </button>
              </div>

              <p className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-400')} text-center mt-3`}>
                🔒 This is a demo. No real payment will be processed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ BATTLE PASS SCREEN ============
export function BattlePassScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const claimReward = (level: number) => {
    const reward = BATTLE_PASS_REWARDS.find(r => r.level === level);
    if (!reward || player.battlePassRewards.includes(`level_${level}`)) return;
    if (reward.premium && !player.isPremium) return;
    if (player.battlePassLevel < level) return;

    const updated = {
      ...player,
      battlePassRewards: [...player.battlePassRewards, `level_${level}`],
      coins: reward.type === 'coins' ? player.coins + reward.amount : player.coins,
      gems: reward.type === 'gems' ? player.gems + reward.amount : player.gems,
    };

    setPlayer(updated);
    savePlayer(updated);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎖️</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Battle Pass</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Level up and unlock rewards</p>
        </div>

        {/* Progress */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 mb-6 border`}>
          <div className="flex justify-between items-center mb-2">
            <div>
              <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Level</div>
              <div className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.battlePassLevel}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>XP</div>
              <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.battlePassXp} / 1000</div>
            </div>
          </div>
          <div className={`h-3 ${t(theme, 'bg-gray-900', 'bg-gray-200')} rounded-full overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
              style={{ width: `${(player.battlePassXp / 1000) * 100}%` }}
            />
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="space-y-2">
          {BATTLE_PASS_REWARDS.map(reward => {
            const isClaimed = player.battlePassRewards.includes(`level_${reward.level}`);
            const isUnlocked = player.battlePassLevel >= reward.level;
            const canClaim = isUnlocked && !isClaimed && (!reward.premium || player.isPremium);

            return (
              <div
                key={reward.level}
                className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border flex items-center gap-4 ${
                  !isUnlocked ? 'opacity-50' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-lg ${
                  reward.premium 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
                    : t(theme, 'bg-gradient-to-br from-purple-600 to-blue-600', 'bg-gradient-to-br from-purple-500 to-blue-500')
                } flex items-center justify-center text-white font-bold`}>
                  {reward.level}
                </div>

                <div className="flex-1">
                  <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{reward.reward}</div>
                  <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                    {reward.premium && <span className="text-yellow-400">⭐ Premium </span>}
                    Level {reward.level} required
                  </div>
                </div>

                {isClaimed ? (
                  <div className="text-green-400 text-2xl">✓</div>
                ) : canClaim ? (
                  <button
                    onClick={() => claimReward(reward.level)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg"
                  >
                    Claim
                  </button>
                ) : !isUnlocked ? (
                  <div className={`text-sm ${t(theme, 'text-gray-500', 'text-gray-400')}`}>🔒</div>
                ) : reward.premium && !player.isPremium ? (
                  <div className="text-xs text-yellow-400">Premium</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============ ONLINE MULTIPLAYER SCREEN ============
export function OnlineMultiplayerScreen({ player, onBack, theme, onSelectMode }: {
  player: Player;
  onBack: () => void;
  theme: Theme;
  onSelectMode: (mode: 'online', difficulty: any) => void;
}) {
  const [tab, setTab] = useState<'friends' | 'games'>('friends');
  const onlineFriends = MOCK_FRIENDS.filter(f => f.isOnline);

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌐</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Online Multiplayer</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Play with friends online</p>
        </div>

        {!player.isPremium && (
          <div className={`${t(theme, 'bg-gradient-to-r from-purple-900/40 to-blue-900/40 border-purple-500/30', 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-300')} rounded-xl p-4 mb-6 border`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">⭐</div>
              <div className="flex-1">
                <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Premium Feature</div>
                <div className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')}`}>Upgrade to Snake Pass Premium to play online with friends</div>
              </div>
            </div>
          </div>
        )}

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
            👥 Friends ({onlineFriends.length} online)
          </button>
          <button
            onClick={() => setTab('games')}
            className={`flex-1 py-2 rounded-lg font-medium ${
              tab === 'games'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            }`}
          >
            🎮 Quick Match
          </button>
        </div>

        {tab === 'friends' && (
          <div className="space-y-2">
            {MOCK_FRIENDS.map(friend => (
              <div
                key={friend.id}
                className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border flex items-center gap-4`}
              >
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
                </div>

                {friend.isOnline && player.isPremium && (
                  <button
                    onClick={() => onSelectMode('online', 'medium')}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg text-sm"
                  >
                    Invite
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'games' && (
          <div className="space-y-3">
            <button
              onClick={() => player.isPremium && onSelectMode('online', 'medium')}
              disabled={!player.isPremium}
              className={`w-full ${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-6 border text-left ${
                player.isPremium ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
              } transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">⚡</div>
                <div className="flex-1">
                  <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Quick Match</div>
                  <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Find an opponent instantly</div>
                </div>
                {player.isPremium && <div className="text-2xl">→</div>}
              </div>
            </button>

            <button
              onClick={() => player.isPremium && onSelectMode('online', 'hard')}
              disabled={!player.isPremium}
              className={`w-full ${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-6 border text-left ${
                player.isPremium ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'
              } transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">🏆</div>
                <div className="flex-1">
                  <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Ranked Match</div>
                  <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Compete for leaderboard position</div>
                </div>
                {player.isPremium && <div className="text-2xl">→</div>}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ GOOGLE LOGIN SCREEN ============
export function GoogleLoginScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGoogleLogin = () => {
    if (!email) return;

    const updated = {
      ...player,
      googleAccount: email,
    };

    setPlayer(updated);
    savePlayer(updated);
    setShowSuccess(true);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Google Login</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Sync your progress across devices</p>
        </div>

        {player.googleAccount ? (
          <div className={`${t(theme, 'bg-green-900/20 border-green-500/30', 'bg-green-50 border-green-300')} rounded-xl p-6 border text-center`}>
            <div className="text-5xl mb-3">✅</div>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Connected!</div>
            <div className={`${t(theme, 'text-gray-300', 'text-gray-700')} mb-4`}>{player.googleAccount}</div>
            <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
              Your progress is synced and backed up
            </div>
          </div>
        ) : showSuccess ? (
          <div className={`${t(theme, 'bg-green-900/20 border-green-500/30', 'bg-green-50 border-green-300')} rounded-xl p-6 border text-center`}>
            <div className="text-5xl mb-3">🎉</div>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Successfully Linked!</div>
            <div className={`${t(theme, 'text-gray-300', 'text-gray-700')} mb-4`}>{email}</div>
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-lg')} rounded-xl p-6 border`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Sign in with Google</div>
                <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Secure & fast</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1 block`}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full px-3 py-2 ${t(theme, 'bg-gray-900 border-gray-700 text-white', 'bg-white border-gray-300 text-gray-900')} border rounded-lg`}
                />
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={!email}
                className="w-full py-3 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-lg border border-gray-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-400')} text-center mt-4`}>
              🔒 This is a demo. No real Google authentication will occur.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
