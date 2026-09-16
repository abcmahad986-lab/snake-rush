import { useState } from 'react';
import { Player, Theme, SHOP_PACKAGES, REAL_MONEY_SKINS, GAME_MAPS } from '../types';
import { savePlayer } from '../store';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// ============ REAL MONEY SHOP SCREEN ============
export function RealMoneyShopScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [tab, setTab] = useState<'packages' | 'skins'>('packages');

  const purchasePackage = (packageId: string) => {
    const pkg = SHOP_PACKAGES.find(p => p.id === packageId);
    if (!pkg) return;

    audioManager.playSuccessSound();

    const updated = {
      ...player,
      coins: player.coins + pkg.coins + (pkg.bonusCoins || 0),
      gems: player.gems + pkg.gems + (pkg.bonusGems || 0),
      purchasedPackages: [...player.purchasedPackages, packageId],
    };

    // Add bonus items if any
    if (pkg.bonusItems) {
      updated.ownedRealMoneySkins = [...updated.ownedRealMoneySkins, ...pkg.bonusItems];
    }

    setPlayer(updated);
    savePlayer(updated);
    setShowPayment(null);
  };

  const purchaseSkin = (skinId: string) => {
    const skin = REAL_MONEY_SKINS.find(s => s.id === skinId);
    if (!skin) return;

    audioManager.playSuccessSound();

    const updated = {
      ...player,
      ownedRealMoneySkins: [...player.ownedRealMoneySkins, skinId],
    };

    setPlayer(updated);
    savePlayer(updated);
    setShowPayment(null);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>💎 Premium Shop</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Support the game and get awesome rewards!</p>
          <div className="flex justify-center gap-4 mt-3">
            <span className="text-sm text-yellow-400">🪙 {player.coins}</span>
            <span className="text-sm text-purple-400">💎 {player.gems}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('packages')}
            className={`flex-1 py-3 rounded-lg font-bold ${
              tab === 'packages'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            } transition-all`}
          >
            💰 Currency Packages
          </button>
          <button
            onClick={() => setTab('skins')}
            className={`flex-1 py-3 rounded-lg font-bold ${
              tab === 'skins'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : t(theme, 'bg-gray-800 text-gray-400', 'bg-gray-200 text-gray-600')
            } transition-all`}
          >
            🎨 Premium Skins
          </button>
        </div>

        {/* Currency Packages */}
        {tab === 'packages' && (
          <div className="grid md:grid-cols-2 gap-4">
            {SHOP_PACKAGES.map(pkg => {
              const isOwned = player.purchasedPackages.includes(pkg.id);
              return (
                <div
                  key={pkg.id}
                  className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-lg')} rounded-xl p-5 border relative overflow-hidden ${
                    pkg.popular ? 'ring-2 ring-yellow-500' : ''
                  } ${pkg.bestValue ? 'ring-2 ring-green-500' : ''}`}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                      POPULAR
                    </div>
                  )}
                  {pkg.bestValue && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                      BEST VALUE
                    </div>
                  )}
                  {pkg.free && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                      FREE
                    </div>
                  )}

                  <div className="text-5xl mb-3">{pkg.icon}</div>
                  <h3 className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>{pkg.name}</h3>
                  <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-3`}>{pkg.description}</p>

                  <div className="space-y-2 mb-4">
                    {pkg.coins > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400">🪙</span>
                        <span className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{pkg.coins} Coins</span>
                        {pkg.bonusCoins && (
                          <span className="text-green-400 text-sm">+{pkg.bonusCoins} Bonus</span>
                        )}
                      </div>
                    )}
                    {pkg.gems > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400">💎</span>
                        <span className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{pkg.gems} Gems</span>
                        {pkg.bonusGems && (
                          <span className="text-green-400 text-sm">+{pkg.bonusGems} Bonus</span>
                        )}
                      </div>
                    )}
                    {pkg.bonusItems && pkg.bonusItems.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-pink-400">🎁</span>
                        <span className={`font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Exclusive Items</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowPayment(pkg.id)}
                    disabled={pkg.free && isOwned}
                    className={`w-full py-3 rounded-lg font-bold transition-all ${
                      pkg.free
                        ? isOwned
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white'
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                    }`}
                  >
                    {pkg.free ? (isOwned ? '✓ Claimed' : 'Claim Free') : `$${pkg.price.toFixed(2)}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Premium Skins */}
        {tab === 'skins' && (
          <div className="grid md:grid-cols-2 gap-4">
            {REAL_MONEY_SKINS.map(skin => {
              const isOwned = player.ownedRealMoneySkins.includes(skin.id);
              return (
                <div
                  key={skin.id}
                  className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-lg')} rounded-xl p-5 border relative overflow-hidden`}
                >
                  {skin.free && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
                      FREE
                    </div>
                  )}

                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
                      style={{
                        background: `linear-gradient(135deg, ${skin.colors.head}, ${skin.colors.body})`,
                        boxShadow: `0 0 20px ${skin.colors.glow}`
                      }}
                    >
                      {skin.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>{skin.name}</h3>
                      <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-2`}>{skin.description}</p>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        skin.rarity === 'rare' ? 'bg-blue-600/30 text-blue-300' :
                        skin.rarity === 'epic' ? 'bg-purple-600/30 text-purple-300' :
                        skin.rarity === 'legendary' ? 'bg-yellow-600/30 text-yellow-300' :
                        'bg-pink-600/30 text-pink-300'
                      }`}>
                        {skin.rarity.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowPayment(skin.id)}
                    disabled={skin.free && isOwned}
                    className={`w-full py-2.5 rounded-lg font-bold transition-all ${
                      skin.free
                        ? isOwned
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white'
                        : isOwned
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white'
                    }`}
                  >
                    {skin.free ? (isOwned ? '✓ Owned' : 'Get Free') : isOwned ? '✓ Owned' : `$${skin.price.toFixed(2)}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${t(theme, 'bg-gray-800 border-gray-700', 'bg-white border-gray-300')} rounded-2xl p-6 max-w-md w-full border`}>
              <h3 className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-4`}>Complete Purchase</h3>
              
              <div className={`${t(theme, 'bg-gray-900/50', 'bg-gray-100')} rounded-lg p-4 mb-4`}>
                {(() => {
                  const pkg = SHOP_PACKAGES.find(p => p.id === showPayment);
                  const skin = REAL_MONEY_SKINS.find(s => s.id === showPayment);
                  const item = pkg || skin;
                  if (!item) return null;

                  return (
                    <>
                      <div className="text-4xl mb-2">{item.icon}</div>
                      <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>{item.name}</div>
                      <div className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                        {item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`}
                      </div>
                    </>
                  );
                })()}
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
                  onClick={() => setShowPayment(null)}
                  className={`flex-1 py-2.5 ${t(theme, 'bg-gray-700 hover:bg-gray-600 text-gray-300', 'bg-gray-200 hover:bg-gray-300 text-gray-700')} rounded-lg font-medium`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const pkg = SHOP_PACKAGES.find(p => p.id === showPayment);
                    if (pkg) {
                      purchasePackage(showPayment);
                    } else {
                      purchaseSkin(showPayment);
                    }
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg"
                >
                  {SHOP_PACKAGES.find(p => p.id === showPayment)?.price === 0 || REAL_MONEY_SKINS.find(s => s.id === showPayment)?.price === 0 ? 'Claim' : 'Pay Now'}
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

// ============ MAPS SCREEN ============
export function MapsScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const selectMap = (mapId: string) => {
    if (!player.ownedMaps.includes(mapId)) return;

    audioManager.playClickSound();

    const updated = {
      ...player,
      activeMap: mapId,
    };

    setPlayer(updated);
    savePlayer(updated);
  };

  const purchaseMap = (mapId: string) => {
    const map = GAME_MAPS.find(m => m.id === mapId);
    if (!map) return;

    if (map.currency === 'coins' && player.coins < map.price) return;
    if (map.currency === 'gems' && player.gems < map.price) return;

    audioManager.playSuccessSound();

    const updated = {
      ...player,
      coins: map.currency === 'coins' ? player.coins - map.price : player.coins,
      gems: map.currency === 'gems' ? player.gems - map.price : player.gems,
      ownedMaps: [...player.ownedMaps, mapId],
      activeMap: mapId,
    };

    setPlayer(updated);
    savePlayer(updated);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>🗺️ Game Maps</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Choose your battlefield!</p>
          <div className="flex justify-center gap-4 mt-3">
            <span className="text-sm text-yellow-400">🪙 {player.coins}</span>
            <span className="text-sm text-purple-400">💎 {player.gems}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {GAME_MAPS.map(map => {
            const isOwned = player.ownedMaps.includes(map.id);
            const isActive = player.activeMap === map.id;
            const canAfford = map.currency === 'coins' ? player.coins >= map.price : player.gems >= map.price;

            return (
              <div
                key={map.id}
                className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-lg')} rounded-xl border relative overflow-hidden ${
                  isActive ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {/* Map Preview */}
                <div className={`h-40 bg-gradient-to-br ${map.backgroundGradient} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">{map.icon}</div>
                  </div>
                  {map.free && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg font-bold">
                      FREE
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg font-bold">
                      ACTIVE
                    </div>
                  )}
                </div>

                {/* Map Info */}
                <div className={`${t(theme, 'bg-gray-800/80', 'bg-white')} p-4`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>{map.name}</h3>
                      <p className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-2`}>{map.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      map.difficulty === 'easy' ? 'bg-green-600/30 text-green-400' :
                      map.difficulty === 'medium' ? 'bg-yellow-600/30 text-yellow-400' :
                      'bg-red-600/30 text-red-400'
                    }`}>
                      {map.difficulty.toUpperCase()}
                    </span>
                    {map.features.map((feature, i) => (
                      <span key={i} className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>• {feature}</span>
                    ))}
                  </div>

                  <button
                    onClick={() => isOwned ? selectMap(map.id) : purchaseMap(map.id)}
                    disabled={!isOwned && !canAfford}
                    className={`w-full py-2.5 rounded-lg font-bold transition-all ${
                      isActive
                        ? 'bg-green-600/30 text-green-400 border border-green-500/30'
                        : isOwned
                        ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30 hover:bg-blue-600/50'
                        : canAfford
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white'
                        : t(theme, 'bg-gray-700/30 text-gray-500 border border-gray-600/30 cursor-not-allowed', 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed')
                    } border`}
                  >
                    {isActive ? '✓ Active' : isOwned ? 'Select Map' : `${map.currency === 'coins' ? '🪙' : '💎'} ${map.price}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
