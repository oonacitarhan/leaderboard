import React, { useState } from 'react';

const Leaderboard = ({ data, onPlayerClick }) => {
  const [sortBy, setSortBy] = useState('totalScore');
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedData = [...data.finalScores].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (sortOrder === 'desc') {
      return bVal - aVal;
    } else {
      return aVal - bVal;
    }
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getScoreBadge = (score) => {
    if (score >= 1000) return '🔥';
    if (score >= 500) return '⭐';
    if (score >= 250) return '✨';
    return '';
  };

  if (data.finalScores.length === 0) {
    return (
      <div className="leaderboard-empty">
        <h2>🏆 Overall Leaderboard</h2>
        <p>No player data available. Make sure your Excel file contains a "Final Scores" sheet.</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <header className="leaderboard-header">
        <h2>🏆 Overall Leaderboard</h2>
        <p>Top performers across all categories</p>
      </header>

      <div className="leaderboard-table">
        <div className="table-header">
          <div className="header-cell rank-cell">Rank</div>
          <div className="header-cell player-cell">Player</div>
          <div 
            className="header-cell score-cell sortable" 
            onClick={() => handleSort('totalScore')}
          >
            Total Score {getSortIcon('totalScore')}
          </div>
          <div 
            className="header-cell stat-cell sortable" 
            onClick={() => handleSort('correctAnswers')}
          >
            Correct {getSortIcon('correctAnswers')}
          </div>
          <div 
            className="header-cell stat-cell sortable" 
            onClick={() => handleSort('incorrectAnswers')}
          >
            Incorrect {getSortIcon('incorrectAnswers')}
          </div>
          <div 
            className="header-cell stat-cell sortable" 
            onClick={() => handleSort('accuracy')}
          >
            Accuracy {getSortIcon('accuracy')}
          </div>
          <div 
            className="header-cell stat-cell sortable" 
            onClick={() => handleSort('gamesPlayed')}
          >
            Games {getSortIcon('gamesPlayed')}
          </div>
        </div>

        <div className="table-body">
          {sortedData.map((player, index) => (
            <div 
              key={player.player} 
              className={`table-row ${index < 3 ? 'podium' : ''}`}
              onClick={() => onPlayerClick(player.player)}
            >
              <div className="cell rank-cell">
                <span className="rank-badge">{getRankBadge(index + 1)}</span>
              </div>
              <div className="cell player-cell">
                <div className="player-info">
                  <span className="player-name">{player.player}</span>
                  {getScoreBadge(player.totalScore) && (
                    <span className="score-badge">{getScoreBadge(player.totalScore)}</span>
                  )}
                </div>
              </div>
              <div className="cell score-cell">
                <span className="score-value">{player.totalScore.toLocaleString()}</span>
                <span className="score-label">points</span>
              </div>
              <div className="cell stat-cell">
                <span className="stat-value">{player.correctAnswers}</span>
              </div>
              <div className="cell stat-cell">
                <span className="stat-value">{player.incorrectAnswers}</span>
              </div>
              <div className="cell stat-cell">
                <span className="stat-value">{player.accuracy.toFixed(1)}%</span>
              </div>
              <div className="cell stat-cell">
                <span className="stat-value">{player.gamesPlayed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="leaderboard-stats">
        <div className="stat-card">
          <div className="stat-number">{data.finalScores.length}</div>
          <div className="stat-label">Total Players</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Math.round(data.finalScores.reduce((sum, p) => sum + p.accuracy, 0) / data.finalScores.length)}%
          </div>
          <div className="stat-label">Avg Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {Math.round(data.finalScores.reduce((sum, p) => sum + p.totalScore, 0) / data.finalScores.length).toLocaleString()}
          </div>
          <div className="stat-label">Avg Score</div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;