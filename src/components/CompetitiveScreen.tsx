import { useState } from 'react';
import { Player, Theme, MatchType, Rank } from '../types';
import { audioManager } from '../audio';

const t = (theme: Theme, dark: string, light: string) => theme === 'dark' ? dark : light;

// Helper function to calculate rank from ELO
export function getRankFromElo(elo: number): Rank {
  if (elo >= 2400) return 'grandmaster';
  if (elo >= 2000) return 'master';
  if (elo >= 1600) return 'diamond';
  if (elo >= 1200) return 'platinum';
  if (elo >= 800) return 'gold';
  if (elo >= 400) return 'silver';
  return 'bronze';
}

// Helper function to get rank color
export function getRankColor(rank: Rank): string {
  switch (rank) {
    case 'bronze': return 'from-amber-700 to-amber-900';
    case 'silver': return 'from-gray-400 to-gray-600';
    case 'gold': return 'from-yellow-400 to-yellow-600';
    case 'platinum': return 'from-cyan-300 to-cyan-500';
    case 'diamond': return 'from-blue-400 to-blue-600';
    case 'master': return 'from-purple-500 to-purple-700';
    case 'grandmaster': return 'from-red-500 to-red-700';
  }
}

// Helper function to get rank icon
export function getRankIcon(rank: Rank): string {
  switch (rank) {
    case 'bronze': return '🥉';
    case 'silver': return '🥈';
    case 'gold': return '🥇';
    case 'platinum': return '💎';
    case 'diamond': return '💠';
    case 'master': return '👑';
    case 'grandmaster': return '🏆';
  }
}

interface CompetitiveScreenProps {
  player: Player;
  setPlayer: (p: Player) => void;
  onBack: () => void;
  onStartMatch: (matchType: MatchType) => void;
  theme: Theme;
}

export function CompetitiveScreen({ player, setPlayer, onBack, onStartMatch, theme }: CompetitiveScreenProps) {
  const [selectedMatchType, setSelectedMatchType] = useState<MatchType | null>(null);

  const handleStartMatch = () => {
    if (!selectedMatchType) return;
    audioManager.playClickSound();
    onStartMatch(selectedMatchType);
  };

  const currentRank = getRankFromElo(player.elo);
  const rankColor = getRankColor(currentRank);
  const rankIcon = getRankIcon(currentRank);

  return (
    <div className={`min-h-screen ${t(theme, 'bg-black', 'bg-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => {
              audioManager.playClickSound();
              onBack();
            }}
            className={`px-4 py-2 ${t(theme, 'bg-black text-white border-white', 'bg-white text-black border-black')} border-2 rounded-lg font-bold transition-all w-20`}
          >
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>🏆 Competitive</h2>
          <div className="w-20"></div>
        </div>

        {/* Player Rank Card */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-xl p-6 mb-6 border-2`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-left">
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1 uppercase tracking-wider`}>Your Rank</div>
              <div className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>
                {rankIcon} {currentRank.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1 uppercase tracking-wider`}>ELO Rating</div>
              <div className={`text-2xl font-black ${t(theme, 'text-white', 'text-black')}`}>{player.elo}</div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-gray-700/30">
            <div className="text-center">
              <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.rankedWins}</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} uppercase tracking-wider`}>Wins</div>
            </div>
            <div className="text-center border-x-2 border-gray-700/30">
              <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-black')}`}>{player.rankedLosses}</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} uppercase tracking-wider`}>Losses</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-black')}`}>
                {player.rankedWins + player.rankedLosses > 0 
                  ? Math.round((player.rankedWins / (player.rankedWins + player.rankedLosses)) * 100)
                  : 0}%
              </div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} uppercase tracking-wider`}>Win Rate</div>
            </div>
          </div>
        </div>

        {/* Match Type Selection */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-xl p-6 mb-6 border-2`}>
          <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-4 text-center uppercase tracking-wider`}>Select Match Type</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Ranked Match */}
            <button
              onClick={() => {
                audioManager.playClickSound();
                setSelectedMatchType('ranked');
              }}
              className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[140px] ${
                selectedMatchType === 'ranked'
                  ? t(theme, 'bg-gray-900 border-yellow-400 scale-105', 'bg-gray-100 border-yellow-600 scale-105')
                  : t(theme, 'bg-black border-white hover:border-yellow-400/50', 'bg-white border-black hover:border-yellow-600/50')
              }`}
            >
              <div className="text-4xl mb-2">🏆</div>
              <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-1`}>Ranked</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} text-center`}>
                Affects ELO rating
              </div>
            </button>

            {/* Unranked Match */}
            <button
              onClick={() => {
                audioManager.playClickSound();
                setSelectedMatchType('unranked');
              }}
              className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[140px] ${
                selectedMatchType === 'unranked'
                  ? t(theme, 'bg-gray-900 border-blue-400 scale-105', 'bg-gray-100 border-blue-600 scale-105')
                  : t(theme, 'bg-black border-white hover:border-blue-400/50', 'bg-white border-black hover:border-blue-600/50')
              }`}
            >
              <div className="text-4xl mb-2">🎮</div>
              <div className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-1`}>Unranked</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')} text-center`}>
                No ELO changes
              </div>
            </button>
          </div>
        </div>

        {/* Start Match Button */}
        <button
          onClick={handleStartMatch}
          disabled={!selectedMatchType}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all border-2 mb-6 ${
            selectedMatchType
              ? selectedMatchType === 'ranked'
                ? t(theme, 'bg-black text-yellow-400 border-yellow-400 hover:bg-gray-900', 'bg-white text-yellow-600 border-yellow-600 hover:bg-gray-100')
                : t(theme, 'bg-black text-blue-400 border-blue-400 hover:bg-gray-900', 'bg-white text-blue-600 border-blue-600 hover:bg-gray-100')
              : t(theme, 'bg-black text-gray-500 border-gray-700 cursor-not-allowed', 'bg-white text-gray-400 border-gray-300 cursor-not-allowed')
          }`}
        >
          {selectedMatchType ? `Start ${selectedMatchType === 'ranked' ? 'Ranked' : 'Unranked'} Match` : 'Select Match Type'}
        </button>

        {/* Rank Tiers */}
        <div className={`${t(theme, 'bg-black border-white', 'bg-white border-black')} rounded-xl p-6 border-2`}>
          <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-black')} mb-4 text-center uppercase tracking-wider`}>Rank Tiers</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>🥉 Bronze</span>
              <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>0 - 399 ELO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>🥈 Silver</span>
              <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>400 - 799 ELO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>🥇 Gold</span>
              <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>800 - 1199 ELO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>💎 Platinum</span>
              <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>1200 - 1599 ELO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>💠 Diamond</span>
              <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>1600 - 1999 ELO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>👑 Master</span>
              <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>2000 - 2399 ELO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-bold ${t(theme, 'text-white', 'text-black')}`}>🏆 Grandmaster</span>
              <span className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>2400+ ELO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
