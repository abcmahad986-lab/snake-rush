import { useState } from 'react';
import { Player, Theme, CHARACTERS, CHARACTER_SKINS, CHESTS } from '../types';
import { savePlayer } from '../store';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// ============ CHARACTERS SCREEN ============
export function CharactersScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [previewSkin, setPreviewSkin] = useState<string | null>(null);

  const selectCharacter = (characterId: string) => {
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character || player.level < character.unlockLevel) return;
    
    // Get all skins for this character
    const characterSkins = CHARACTER_SKINS.filter(s => s.characterId === characterId);
    
    if (characterSkins.length === 0) {
      console.error(`No skins found for character: ${characterId}`);
      return;
    }
    
    // Find the first unlocked skin (check owned skins first, then level-based)
    const unlockedSkin = characterSkins.find(s => 
      player.ownedCharacterSkins.includes(s.id) ||
      (s.unlockMethod === 'level' && player.level >= (s.unlockRequirement || 0))
    );
    
    // Use unlocked skin, or first skin as default, or first skin in the list
    const skinToEquip = unlockedSkin?.id || characterSkins[0].id;
    
    console.log(`Equipping character: ${characterId} with skin: ${skinToEquip}`);
    
    const updated = {
      ...player,
      equippedCharacter: characterId,
      equippedCharacterSkin: skinToEquip
    };

    setPlayer(updated);
    savePlayer(updated);
  };

  const selectSkin = (skinId: string) => {
    const skin = CHARACTER_SKINS.find(s => s.id === skinId);
    if (!skin) {
      console.error(`Skin not found: ${skinId}`);
      return;
    }
    
    // Verify skin belongs to the currently equipped character
    if (skin.characterId !== player.equippedCharacter) {
      console.error(`Skin ${skinId} does not belong to equipped character ${player.equippedCharacter}`);
      return;
    }
    
    // Check if skin is unlocked
    const isUnlocked = 
      (skin.unlockMethod === 'level' && player.level >= (skin.unlockRequirement || 0)) ||
      player.ownedCharacterSkins.includes(skinId);
    
    if (!isUnlocked) {
      console.error(`Skin ${skinId} is not unlocked`);
      return;
    }
    
    console.log(`Equipping skin: ${skinId} for character: ${player.equippedCharacter}`);
    
    const updated = {
      ...player,
      equippedCharacterSkin: skinId
    };

    setPlayer(updated);
    savePlayer(updated);
  };

  const selectedChar = selectedCharacter 
    ? CHARACTERS.find(c => c.id === selectedCharacter)
    : CHARACTERS.find(c => c.id === player.equippedCharacter);

  const characterSkins = selectedChar 
    ? CHARACTER_SKINS.filter(s => s.characterId === selectedChar.id)
    : [];

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎭</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Characters</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Unlock and customize your heroes</p>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {CHARACTERS.map(character => {
            const isUnlocked = player.level >= character.unlockLevel;
            const isEquipped = player.equippedCharacter === character.id;

            return (
              <div
                key={character.id}
                className={`${
                  isEquipped
                    ? t(theme, 'bg-gradient-to-br from-purple-900/60 to-blue-900/60 border-purple-500/50', 'bg-gradient-to-br from-purple-100 to-blue-100 border-purple-400')
                    : isUnlocked
                    ? t(theme, 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600', 'bg-white border-gray-200 hover:border-gray-400 shadow-sm')
                    : t(theme, 'bg-gray-900/40 border-gray-800/30', 'bg-gray-100 border-gray-300')
                } rounded-xl p-4 border transition-all ${isEquipped ? 'ring-2 ring-purple-500' : ''}`}
              >
                <div className="text-5xl mb-2 text-center">{character.emoji}</div>
                <div className={`font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1 text-center`}>{character.name}</div>
                <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-2 text-center`}>{character.description}</div>
                
                {!isUnlocked ? (
                  <div className="text-xs text-red-400 text-center mb-2">🔒 Level {character.unlockLevel}</div>
                ) : isEquipped ? (
                  <div className="text-xs text-purple-400 font-bold text-center mb-2">✓ Equipped</div>
                ) : (
                  <div className="text-xs text-green-400 text-center mb-2">✓ Unlocked</div>
                )}

                <div className={`mb-3 text-xs px-2 py-1 rounded-full inline-block w-full text-center ${
                  character.rarity === 'common' ? 'bg-gray-600/30 text-gray-300' :
                  character.rarity === 'rare' ? 'bg-blue-600/30 text-blue-300' :
                  character.rarity === 'epic' ? 'bg-purple-600/30 text-purple-300' :
                  'bg-yellow-600/30 text-yellow-300'
                }`}>
                  {character.rarity.toUpperCase()}
                </div>

                {/* Equip Button - Only show for unlocked characters that aren't equipped */}
                {isUnlocked && !isEquipped && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectCharacter(character.id);
                    }}
                    className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all transform hover:scale-105 active:scale-95"
                  >
                    ⚔️ Equip
                  </button>
                )}

                {/* View Details Button - Show for unlocked characters */}
                {isUnlocked && (
                  <button
                    onClick={() => setSelectedCharacter(character.id)}
                    className={`w-full mt-2 px-3 py-2 ${
                      isEquipped 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500'
                        : t(theme, 'bg-gray-700 hover:bg-gray-600', 'bg-gray-200 hover:bg-gray-300')
                    } ${t(theme, 'text-white', 'text-gray-900')} font-bold text-sm rounded-lg transition-all transform hover:scale-105 active:scale-95`}
                  >
                    {isEquipped ? '✓ View Skins' : '👁️ View Details'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Character Details */}
        {selectedChar && (
          <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-lg')} rounded-xl p-6 border`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="text-6xl">{selectedChar.emoji}</div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>{selectedChar.name}</h3>
                <p className={`${t(theme, 'text-gray-400', 'text-gray-600')} mb-2`}>{selectedChar.description}</p>
                <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                  selectedChar.rarity === 'common' ? 'bg-gray-600/30 text-gray-300' :
                  selectedChar.rarity === 'rare' ? 'bg-blue-600/30 text-blue-300' :
                  selectedChar.rarity === 'epic' ? 'bg-purple-600/30 text-purple-300' :
                  'bg-yellow-600/30 text-yellow-300'
                }`}>
                  {selectedChar.rarity.toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => setSelectedCharacter(null)}
                className={`px-3 py-1 ${t(theme, 'bg-gray-700 hover:bg-gray-600 text-white', 'bg-gray-200 hover:bg-gray-300 text-gray-900')} rounded-lg text-sm`}
              >
                ✕ Close
              </button>
            </div>

            {/* Skins */}
            <div className="mb-4">
              <h4 className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-3`}>Skins</h4>
              
              {/* Skin Preview Panel */}
              {previewSkin && (
                <div className={`${t(theme, 'bg-blue-900/20 border-blue-500/50', 'bg-blue-50 border-blue-300')} rounded-xl p-4 mb-4 border-2 shadow-lg`}>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className={`text-sm font-bold ${t(theme, 'text-blue-300', 'text-blue-700')}`}>👁️ Skin Preview</h5>
                    <button 
                      onClick={() => setPreviewSkin(null)}
                      className={`text-xs px-3 py-1 ${t(theme, 'bg-blue-700 hover:bg-blue-600 text-white', 'bg-blue-300 hover:bg-blue-400 text-blue-900')} rounded font-bold`}
                    >
                      ✕ Close Preview
                    </button>
                  </div>
                  
                  {(() => {
                    const skin = characterSkins.find(s => s.id === previewSkin);
                    if (!skin) return null;
                    
                    return (
                      <div className="space-y-3">
                        {/* Large Color Preview */}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1`}>Head Color</div>
                            <div 
                              className="w-full h-16 rounded-lg border-2 border-white/20"
                              style={{
                                backgroundColor: skin.colors.head,
                                boxShadow: `0 0 30px ${skin.colors.glow}`
                              }}
                            />
                            <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mt-1 text-center font-mono`}>
                              {skin.colors.head}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1`}>Body Color</div>
                            <div 
                              className="w-full h-16 rounded-lg border-2 border-white/20"
                              style={{
                                backgroundColor: skin.colors.body,
                                boxShadow: `0 0 30px ${skin.colors.glow}`
                              }}
                            />
                            <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mt-1 text-center font-mono`}>
                              {skin.colors.body}
                            </div>
                          </div>
                        </div>
                        
                        {/* Snake Preview */}
                        <div>
                          <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-2`}>Snake Preview</div>
                          <div className={`${t(theme, 'bg-black/40', 'bg-white/60')} rounded-lg p-4 flex items-center justify-center`}>
                            <div className="flex gap-1">
                              {/* Head */}
                              <div 
                                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                style={{
                                  backgroundColor: skin.colors.head,
                                  boxShadow: `0 0 25px ${skin.colors.glow}`
                                }}
                              >
                                {selectedChar.emoji}
                              </div>
                              {/* Body segments */}
                              {[0.9, 0.8, 0.7, 0.6, 0.5].map((opacity, i) => (
                                <div 
                                  key={i}
                                  className="w-10 h-10 rounded-lg"
                                  style={{
                                    backgroundColor: skin.colors.body,
                                    opacity: opacity,
                                    boxShadow: `0 0 15px ${skin.colors.glow}`
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Skin Info */}
                        <div className={`${t(theme, 'bg-gray-800/40', 'bg-gray-200/40')} rounded-lg p-3`}>
                          <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>
                            {skin.name}
                          </div>
                          <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                            Glow: <span className="font-mono">{skin.colors.glow}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {/* Skins Grid */}
              <div className="grid grid-cols-3 gap-2">
                {characterSkins.map(skin => {
                  // Check if skin is unlocked based on unlock method
                  const isUnlocked = 
                    (skin.unlockMethod === 'level' && player.level >= (skin.unlockRequirement || 0)) ||
                    player.ownedCharacterSkins.includes(skin.id);
                  const isEquipped = player.equippedCharacterSkin === skin.id;
                  const isPreviewing = previewSkin === skin.id;

                  return (
                    <div
                      key={skin.id}
                      className={`${
                        isEquipped
                          ? 'ring-2 ring-purple-500'
                          : isPreviewing
                          ? 'ring-2 ring-blue-500'
                          : ''
                      } ${t(theme, 'bg-gray-900/40 border-gray-700/50', 'bg-gray-50 border-gray-200')} rounded-lg p-3 border transition-all`}
                    >
                      {/* Color Preview */}
                      <div
                        className={`w-full h-16 rounded-lg mb-2 cursor-pointer transition-all ${
                          isPreviewing ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                        }`}
                        style={{
                          background: `linear-gradient(135deg, ${skin.colors.head}, ${skin.colors.body})`,
                          boxShadow: `0 0 20px ${skin.colors.glow}`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isUnlocked) {
                            console.log('Color preview clicked for skin:', skin.id);
                            setPreviewSkin(isPreviewing ? null : skin.id);
                          }
                        }}
                      />
                      
                      {/* Skin Name */}
                      <div className={`text-xs font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1 text-center`}>
                        {skin.name}
                      </div>
                      
                      {/* Status */}
                      {isEquipped && (
                        <div className="text-xs text-purple-400 text-center font-bold">✓ Equipped</div>
                      )}
                      
                      {/* Actions */}
                      {isUnlocked && !isEquipped && (
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('View button clicked for skin:', skin.id);
                              setPreviewSkin(isPreviewing ? null : skin.id);
                            }}
                            className={`flex-1 text-xs px-2 py-1.5 font-bold ${
                              isPreviewing
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                                : t(theme, 'bg-blue-700 hover:bg-blue-600 text-white', 'bg-blue-200 hover:bg-blue-300 text-blue-900')
                            } rounded transition-all transform hover:scale-105`}
                          >
                            {isPreviewing ? '✓ Previewing' : '👁️ View'}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectSkin(skin.id);
                            }}
                            className="flex-1 text-xs px-2 py-1.5 font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded transition-all transform hover:scale-105"
                          >
                            ⚔️ Equip
                          </button>
                        </div>
                      )}
                      
                      {/* Locked Status */}
                      {!isUnlocked && (
                        <div className="text-xs text-red-400 mt-1 text-center">
                          {skin.unlockMethod === 'level' && `🔒 Level ${skin.unlockRequirement}`}
                          {skin.unlockMethod === 'chest' && '🎁 From Chest'}
                          {skin.unlockMethod === 'purchase' && `💰 ${skin.unlockRequirement} coins`}
                          {skin.unlockMethod === 'achievement' && '🏆 Achievement'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {player.level < selectedChar.unlockLevel && (
              <div className={`${t(theme, 'bg-red-900/20 border-red-500/30', 'bg-red-50 border-red-300')} rounded-lg p-3 border`}>
                <div className="text-sm text-red-400">🔒 Reach level {selectedChar.unlockLevel} to unlock this character</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ CHESTS SCREEN ============
export function ChestsScreen({ player, setPlayer, onBack, theme }: {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  theme: Theme;
}) {
  const [openingChest, setOpeningChest] = useState<string | null>(null);
  const [reward, setReward] = useState<any>(null);

  const openChest = (chestId: string) => {
    const chest = CHESTS.find(c => c.id === chestId);
    if (!chest || (player.chests[chestId] || 0) <= 0 || player.keys < chest.keysRequired) return;

    setOpeningChest(chestId);

    // Calculate reward based on chances
    const rand = Math.random();
    let cumulative = 0;
    let selectedReward = chest.rewards[0];

    for (const r of chest.rewards) {
      cumulative += r.chance;
      if (rand <= cumulative) {
        selectedReward = r;
        break;
      }
    }

    // Apply reward
    setTimeout(() => {
      const updated = { ...player };
      updated.keys -= chest.keysRequired;
      updated.chests[chestId] = (updated.chests[chestId] || 0) - 1;

      if (selectedReward.type === 'coins') {
        updated.coins += selectedReward.amount;
      } else if (selectedReward.type === 'gems') {
        updated.gems += selectedReward.amount;
      } else if (selectedReward.type === 'skin' && selectedReward.itemId) {
        if (!updated.ownedCharacterSkins.includes(selectedReward.itemId)) {
          updated.ownedCharacterSkins.push(selectedReward.itemId);
        }
      } else if (selectedReward.type === 'character' && selectedReward.itemId) {
        if (!updated.ownedCharacters.includes(selectedReward.itemId)) {
          updated.ownedCharacters.push(selectedReward.itemId);
        }
      }

      setPlayer(updated);
      savePlayer(updated);
      setReward(selectedReward);
    }, 1500);
  };

  const closeReward = () => {
    setOpeningChest(null);
    setReward(null);
  };

  return (
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className={`mb-3 px-3 py-1.5 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700/50', 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300')} rounded-lg text-sm border`}>
          ← Back
        </button>

        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🎁</div>
          <h2 className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Chests</h2>
          <p className={`${t(theme, 'text-gray-400', 'text-gray-600')}`}>Win games to earn keys and chests</p>
        </div>

        {/* Keys Display */}
        <div className={`${t(theme, 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-yellow-500/30', 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300')} rounded-xl p-4 mb-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')}`}>Your Keys</div>
              <div className={`text-3xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>🔑 {player.keys}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm ${t(theme, 'text-gray-300', 'text-gray-700')}`}>Games Won</div>
              <div className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>{player.gamesWon}</div>
            </div>
          </div>
          <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mt-2`}>
            Win games to earn keys and chests!
          </div>
        </div>

        {/* Chests Grid */}
        <div className="grid grid-cols-2 gap-4">
          {CHESTS.map(chest => {
            const count = player.chests[chest.id] || 0;
            const canOpen = count > 0 && player.keys >= chest.keysRequired;

            return (
              <div
                key={chest.id}
                className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200 shadow-lg')} rounded-xl p-5 border relative overflow-hidden`}
              >
                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-xs font-bold ${
                  chest.rarity === 'common' ? 'bg-gray-600 text-white' :
                  chest.rarity === 'rare' ? 'bg-blue-600 text-white' :
                  chest.rarity === 'epic' ? 'bg-purple-600 text-white' :
                  'bg-yellow-600 text-white'
                }`}>
                  {chest.rarity.toUpperCase()}
                </div>

                <div className="text-6xl text-center mb-3">{chest.icon}</div>
                <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} text-center mb-2`}>{chest.name}</h3>
                
                <div className={`text-center text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-3`}>
                  You have: <span className="font-bold">{count}</span>
                </div>

                <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} text-center mb-3`}>
                  Requires: 🔑 {chest.keysRequired} keys
                </div>

                <button
                  onClick={() => canOpen && openChest(chest.id)}
                  disabled={!canOpen}
                  className={`w-full py-2.5 rounded-lg font-bold transition-all ${
                    canOpen
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white transform hover:scale-105'
                      : t(theme, 'bg-gray-700 text-gray-500 cursor-not-allowed', 'bg-gray-200 text-gray-400 cursor-not-allowed')
                  }`}
                >
                  {canOpen ? '🔓 Open' : count === 0 ? 'No Chests' : 'Need Keys'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Opening Animation */}
        {openingChest && !reward && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="text-8xl animate-bounce mb-4">
                {CHESTS.find(c => c.id === openingChest)?.icon}
              </div>
              <div className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>Opening...</div>
            </div>
          </div>
        )}

        {/* Reward Display */}
        {reward && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${t(theme, 'bg-gray-800 border-gray-700', 'bg-white border-gray-300')} rounded-2xl p-8 max-w-md w-full border text-center`}>
              <div className="text-6xl mb-4 animate-bounce">
                {reward.type === 'coins' && '🪙'}
                {reward.type === 'gems' && '💎'}
                {reward.type === 'skin' && '🎨'}
                {reward.type === 'character' && '🎭'}
              </div>
              <h3 className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>
                {reward.type === 'coins' && `${reward.amount} Coins!`}
                {reward.type === 'gems' && `${reward.amount} Gems!`}
                {reward.type === 'skin' && 'New Skin!'}
                {reward.type === 'character' && 'New Character!'}
              </h3>
              {reward.itemId && (
                <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-4`}>
                  {reward.type === 'skin' && CHARACTER_SKINS.find(s => s.id === reward.itemId)?.name}
                  {reward.type === 'character' && CHARACTERS.find(c => c.id === reward.itemId)?.name}
                </div>
              )}
              <button
                onClick={closeReward}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
