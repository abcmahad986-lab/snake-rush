import { useState, useEffect } from 'react';
import { Player, Theme, SUBSCRIPTION_PLANS, BATTLE_PASS_REWARDS, MOCK_FRIENDS } from '../types';
import { savePlayer } from '../store';
import { audioManager } from '../audio';
import { supabase } from '../lib/supabase';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// ============ SUBSCRIPTION SCREEN ============
export function SubscriptionScreen({ player, setPlayer, onBack, theme }: { 
  player: Player; 
  setPlayer: (p: Player) => void; 
  onBack: () => void; 
  theme: Theme;
}) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
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
        tier: plan.id as any,
        status: 'active' as const,
        startDate: now.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: true,
        paymentMethod: 'Credit Card',
      },
      isPremium: plan.id !== 'free',
      premiumSkinsUnlocked: plan.id === 'premium' || plan.id === 'ultimate' 
        ? ['diamond', 'neon_glow', 'galaxy', 'fire_dragon', 'ice_crystal', 'rainbow_pride', 'shadow_ninja', 'golden_king']
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
  const [tab, setTab] = useState<'rewards' | 'missions'>('rewards');
  
  // Mock missions
  const missions = [
    { id: 'm1', name: 'Score 100 points', description: 'Reach 100 points in any game', progress: 75, target: 100, xpReward: 50, icon: '🎯' },
    { id: 'm2', name: 'Eat 50 food items', description: 'Collect 50 food items total', progress: 32, target: 50, xpReward: 40, icon: '🍎' },
    { id: 'm3', name: 'Play 5 games', description: 'Complete 5 games', progress: 3, target: 5, xpReward: 60, icon: '🎮' },
    { id: 'm4', name: 'Win vs Bot', description: 'Defeat the bot 3 times', progress: 2, target: 3, xpReward: 80, icon: '🤖' },
    { id: 'm5', name: 'Reach length 20', description: 'Grow your snake to length 20', progress: 15, target: 20, xpReward: 70, icon: '📏' },
    { id: 'm6', name: 'Play Zen mode', description: 'Play 3 games in Zen mode', progress: 1, target: 3, xpReward: 45, icon: '🧘' },
  ];

  const claimReward = (level: number, isPremium: boolean) => {
    const reward = BATTLE_PASS_REWARDS.find(r => r.level === level && r.premium === isPremium);
    if (!reward) return;
    
    const rewardKey = `${isPremium ? 'premium' : 'free'}_level_${level}`;
    if (player.battlePassRewards.includes(rewardKey)) return;
    if (isPremium && !player.isPremium) return;
    if (player.battlePassLevel < level) return;

    // Play success sound
    audioManager.playSuccessSound();

    const updated = {
      ...player,
      battlePassRewards: [...player.battlePassRewards, rewardKey],
    };

    // Handle different reward types
    switch (reward.type) {
      case 'coins':
        updated.coins = player.coins + reward.amount;
        break;
      case 'gems':
        updated.gems = player.gems + reward.amount;
        break;
      case 'xp':
        // Add XP and check for level up
        let newXp = player.xp + reward.amount;
        let newLevel = player.level;
        let xpToNext = player.xpToNext;
        
        while (newXp >= xpToNext) {
          newXp -= xpToNext;
          newLevel++;
          xpToNext = Math.floor(xpToNext * 1.5);
        }
        
        updated.xp = newXp;
        updated.level = newLevel;
        updated.xpToNext = xpToNext;
        break;
      case 'skin':
        if (reward.itemId && !player.ownedSkins.includes(reward.itemId)) {
          updated.ownedSkins = [...player.ownedSkins, reward.itemId];
        }
        break;
      case 'title':
        if (reward.itemId && !player.titles.includes(reward.itemId)) {
          updated.titles = [...player.titles, reward.itemId];
        }
        break;
    }

    setPlayer(updated);
    savePlayer(updated);
  };

  const getRewardIcon = (type: string) => {
    switch(type) {
      case 'coins': return '🪙';
      case 'gems': return '💎';
      case 'skin': return '🎨';
      case 'title': return '🏆';
      default: return '🎁';
    }
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎖️</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Season 1: Snake Legends</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Complete missions and unlock rewards</p>
        </div>

        {/* Progress Bar */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 mb-6 border`}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Battle Pass Level</div>
              <div className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.battlePassLevel}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Season XP</div>
              <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.battlePassXp} / 1000</div>
            </div>
          </div>
          <div className={`h-4 ${t(theme, 'bg-gray-900', 'bg-gray-200')} rounded-full overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full transition-all relative"
              style={{ width: `${(player.battlePassXp / 1000) * 100}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-400')} mt-2 text-center`}>
            {1000 - player.battlePassXp} XP to next level
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('rewards')}
            className={`flex-1 py-3 rounded-lg font-bold ${
              tab === 'rewards'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            } transition-all`}
          >
            🎁 Rewards
          </button>
          <button
            onClick={() => setTab('missions')}
            className={`flex-1 py-3 rounded-lg font-bold ${
              tab === 'missions'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            } transition-all`}
          >
            🎯 Missions
          </button>
        </div>

        {/* Missions Tab */}
        {tab === 'missions' && (
          <div className="space-y-3">
            {missions.map(mission => {
              const progress = (mission.progress / mission.target) * 100;
              const isComplete = mission.progress >= mission.target;
              
              return (
                <div
                  key={mission.id}
                  className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{mission.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{mission.name}</div>
                        {isComplete && <span className="text-green-400 text-sm">✓ Complete</span>}
                      </div>
                      <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-2`}>
                        {mission.description}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`flex-1 h-2 ${t(theme, 'bg-gray-900', 'bg-gray-200')} rounded-full overflow-hidden`}>
                          <div
                            className={`h-full rounded-full transition-all ${
                              isComplete 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                : 'bg-gradient-to-r from-purple-500 to-pink-500'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                          {mission.progress}/{mission.target}
                        </div>
                      </div>
                      <div className="text-xs text-yellow-400 mt-2">+{mission.xpReward} XP</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rewards Tab - Dual Track */}
        {tab === 'rewards' && (
          <div className="space-y-3">
            {/* Track Headers */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`${t(theme, 'bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-blue-500/30', 'bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300')} rounded-xl p-3 border text-center`}>
                <div className="text-2xl mb-1">🆓</div>
                <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Free Track</div>
                <div className={`text-xs ${t(theme, 'text-gray-300', 'text-gray-600')}`}>Available to all</div>
              </div>
              <div className={`${t(theme, 'bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/30', 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300')} rounded-xl p-3 border text-center relative`}>
                {!player.isPremium && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    🔒 Premium
                  </div>
                )}
                <div className="text-2xl mb-1">⭐</div>
                <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Premium Track</div>
                <div className={`text-xs ${t(theme, 'text-gray-300', 'text-gray-600')}`}>Snake Pass only</div>
              </div>
            </div>

            {/* Rewards by Level */}
            {Array.from({ length: 15 }, (_, i) => i + 1).map(level => {
              const freeReward = BATTLE_PASS_REWARDS.find(r => r.level === level && !r.premium);
              const premiumReward = BATTLE_PASS_REWARDS.find(r => r.level === level && r.premium);
              const isUnlocked = player.battlePassLevel >= level;
              const freeRewardKey = `free_level_${level}`;
              const premiumRewardKey = `premium_level_${level}`;
              const freeClaimed = player.battlePassRewards.includes(freeRewardKey);
              const premiumClaimed = player.battlePassRewards.includes(premiumRewardKey);

              return (
                <div
                  key={level}
                  className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-sm')} rounded-xl p-4 border ${
                    !isUnlocked ? 'opacity-50' : ''
                  }`}
                >
                  {/* Level Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg ${
                        isUnlocked 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                          : t(theme, 'bg-gray-700', 'bg-gray-300')
                      } flex items-center justify-center text-white font-bold`}>
                        {level}
                      </div>
                      <div>
                        <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Level {level}</div>
                        <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                          {isUnlocked ? '✓ Unlocked' : `🔒 Reach level ${level}`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dual Rewards */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Free Reward */}
                    {freeReward && (
                      <div className={`${t(theme, 'bg-blue-900/20 border-blue-500/30', 'bg-blue-50 border-blue-200')} rounded-lg p-3 border`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">{getRewardIcon(freeReward.type)}</div>
                          <div className="flex-1">
                            <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                              {freeReward.reward}
                            </div>
                            <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Free</div>
                          </div>
                        </div>
                        {freeClaimed ? (
                          <div className="text-center text-green-400 font-bold text-sm">✓ Claimed</div>
                        ) : isUnlocked ? (
                          <button
                            onClick={() => claimReward(level, false)}
                            className="w-full py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-lg text-sm"
                          >
                            Claim
                          </button>
                        ) : (
                          <div className={`text-center ${t(theme, 'text-gray-500', 'text-gray-400')} text-sm`}>🔒 Locked</div>
                        )}
                      </div>
                    )}

                    {/* Premium Reward */}
                    {premiumReward && (
                      <div className={`${
                        player.isPremium 
                          ? t(theme, 'bg-yellow-900/20 border-yellow-500/30', 'bg-yellow-50 border-yellow-200')
                          : t(theme, 'bg-gray-900/40 border-gray-700/30', 'bg-gray-100 border-gray-300')
                      } rounded-lg p-3 border relative`}>
                        {!player.isPremium && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                            ⭐
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-2xl">{getRewardIcon(premiumReward.type)}</div>
                          <div className="flex-1">
                            <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                              {premiumReward.reward}
                            </div>
                            <div className={`text-xs ${player.isPremium ? 'text-yellow-400' : t(theme, 'text-gray-400', 'text-gray-600')}`}>
                              Premium
                            </div>
                          </div>
                        </div>
                        {premiumClaimed ? (
                          <div className="text-center text-green-400 font-bold text-sm">✓ Claimed</div>
                        ) : isUnlocked && player.isPremium ? (
                          <button
                            onClick={() => claimReward(level, true)}
                            className="w-full py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-lg text-sm"
                          >
                            Claim
                          </button>
                        ) : !player.isPremium ? (
                          <div className={`text-center ${t(theme, 'text-gray-500', 'text-gray-400')} text-sm`}>
                            🔒 Premium
                          </div>
                        ) : (
                          <div className={`text-center ${t(theme, 'text-gray-500', 'text-gray-400')} text-sm`}>🔒 Locked</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

                {friend.isOnline && (
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // OAuth redirect will happen automatically
      // After redirect, the user will be back at the app with a session
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      // Clear Google account from player data
      const updated = {
        ...player,
        googleAccount: undefined,
      };
      
      setPlayer(updated);
      savePlayer(updated);
      setShowSuccess(false);
      
      // Reset loading state
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      setLoading(false);
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.email) {
        const updated = {
          ...player,
          googleAccount: user.email,
        };
        setPlayer(updated);
        savePlayer(updated);
        setShowSuccess(true);
      }
    };
    checkUser();
  }, []);

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

        {error && (
          <div className={`${t(theme, 'bg-red-900/20 border-red-500/30', 'bg-red-50 border-red-300')} rounded-xl p-4 border mb-4`}>
            <div className="text-red-400 text-sm text-center">{error}</div>
          </div>
        )}

        {player.googleAccount ? (
          <div className={`${t(theme, 'bg-green-900/20 border-green-500/30', 'bg-green-50 border-green-300')} rounded-xl p-6 border text-center`}>
            <div className="text-5xl mb-3">✅</div>
            <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Connected!</div>
            <div className={`${t(theme, 'text-gray-300', 'text-gray-700')} mb-4`}>{player.googleAccount}</div>
            <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-4`}>
              Your progress is synced and backed up
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={onBack}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg"
              >
                Continue
              </button>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className={`px-6 py-2 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300', 'bg-gray-200 hover:bg-gray-300 text-gray-700')} font-medium rounded-lg border ${t(theme, 'border-gray-700/50', 'border-gray-300')} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading ? (
                  <>
                    <div className={`w-4 h-4 border-2 ${t(theme, 'border-gray-600 border-t-gray-300', 'border-gray-300 border-t-gray-700')} rounded-full animate-spin`}></div>
                    Signing out...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </>
                )}
              </button>
            </div>
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

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-lg border border-gray-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className={`text-xs ${t(theme, 'text-gray-500', 'text-gray-400')} text-center mt-4`}>
              🔒 Secure authentication powered by Supabase
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
