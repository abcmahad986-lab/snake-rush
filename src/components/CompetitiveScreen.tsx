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
    <div className={`min-h-screen ${t(theme, 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800', 'bg-gradient-to-br from-gray-50 via-slate-50 to-white')} p-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => {
              audioManager.playClickSound();
              onBack();
            }}
            className={`px-4 py-2 ${t(theme, 'bg-gray-800 hover:bg-gray-700 text-gray-300', 'bg-white hover:bg-gray-100 text-gray-700')} rounded-lg font-bold transition-all`}
          >
            ← Back
          </button>
          <h2 className={`text-2xl font-black ${t(theme, 'text-white', 'text-gray-900')}`}>🏆 Competitive</h2>
          <div className="w-20"></div>
        </div>

        {/* Player Rank Card */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-2xl p-6 mb-6 border-2`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1`}>Your Rank</div>
              <div className={`text-3xl font-black bg-gradient-to-r ${rankColor} bg-clip-text text-transparent`}>
                {rankIcon} {currentRank.toUpperCase()}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm ${t(theme, 'text-gray-400', 'text-gray-600')} mb-1`}>ELO Rating</div>
              <div className={`text-3xl font-black ${t(theme, 'text-white', 'text-gray-900')}`}>{player.elo}</div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700/30">
            <div className="text-center">
              <div className={`text-2xl font-bold text-green-400`}>{player.rankedWins}</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Wins</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold text-red-400`}>{player.rankedLosses}</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Losses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${t(theme, 'text-white', 'text-gray-900')}`}>
                {player.rankedWins + player.rankedLosses > 0 
                  ? Math.round((player.rankedWins / (player.rankedWins + player.rankedLosses)) * 100)
                  : 0}%
              </div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>Win Rate</div>
            </div>
          </div>
        </div>

        {/* Match Type Selection */}
        <div className={`${t(theme, 'bg-gray-800/60 border-gray-700/50', 'bg-white border-gray-200')} rounded-2xl p-6 mb-6 border-2`}>
          <h3 className={`text-lg font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-4`}>Select Match Type</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Ranked Match */}
            <button
              onClick={() => {
                audioManager.playClickSound();
                setSelectedMatchType('ranked');
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedMatchType === 'ranked'
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500 scale-105'
                  : t(theme, 'bg-gray-900/40 border-gray-700/50 hover:border-yellow-500/50', 'bg-gray-50 border-gray-300 hover:border-yellow-500/50')
              }`}
            >
              <div className="text-5xl mb-3">🏆</div>
              <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Ranked</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                Affects your ELO rating. Compete to climb the ranks!
              </div>
            </button>

            {/* Unranked Match */}
            <button
              onClick={() => {
                audioManager.playClickSound();
                setSelectedMatchType('unranked');
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedMatchType === 'unranked'
                  ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500 scale-105'
                  : t(theme, 'bg-gray-900/40 border-gray-700/50 hover:border-blue-500/50', 'bg-gray-50 border-gray-300 hover:border-blue-500/50')
              }`}
            >
              <div className="text-5xl mb-3">🎮</div>
              <div className={`text-xl font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-2`}>Unranked</div>
              <div className={`text-xs ${t(theme, 'text-gray-400', 'text-gray-600')}`}>
                Casual match. No ELO changes. Just for fun!
              </div>
            </button>
          </div>
        </div>

        {/* Start Match Button */}
        <button
          onClick={handleStartMatch}
          disabled={!selectedMatchType}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            selectedMatchType
              ? selectedMatchType === 'ranked'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg shadow-yellow-500/50'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/50'
              : t(theme, 'bg-gray-700 text-gray-500 cursor-not-allowed', 'bg-gray-300 text-gray-500 cursor-not-allowed')
          }`}
        >
          {selectedMatchType ? `Start ${selectedMatchType === 'ranked' ? 'Ranked' : 'Unranked'} Match` : 'Select Match Type'}
        </button>

        {/* Info Box */}
        <div className={`${t(theme, 'bg-blue-900/20 border-blue-500/30', 'bg-blue-50 border-blue-300')} rounded-xl p-4 mt-6 border-2`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <div className={`text-sm font-bold ${t(theme, 'text-white', 'text-gray-900')} mb-1`}>How ELO Works</div>
              <div className={`text-xs ${t(theme, 'text-gray-300', 'text-gray-700')}`}>
                Win matches to increase your ELO rating. Lose matches to decrease it. Your rank is determined by your ELO:
                <br />
                <span className="font-bold">Bronze (0-399)</span> → <span className="font-bold">Silver (400-799)</span> → <span className="font-bold">Gold (800-1199)</span> → <span className="font-bold">Platinum (1200-1599)</span> → <span className="font-bold">Diamond (1600-1999)</span> → <span className="font-bold">Master (2000-2399)</span> → <span className="font-bold">Grandmaster (2400+)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
