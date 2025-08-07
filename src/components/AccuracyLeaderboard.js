import React from 'react';
import { getTopPlayers } from '../utils/dataLoader';

const AccuracyLeaderboard = ({ data, onPlayerClick }) => {
  const accuracyData = getTopPlayers(data.finalScores, 'accuracy', 20);

  const getAccuracyBadge = (accuracy) => {
    if (accuracy >= 95) return '🎯';
    if (accuracy >= 90) return '🏹';
    if (accuracy >= 85) return '🔥';
    if (accuracy >= 80) return '⭐';
    return '📈';
  };

  const getAccuracyGrade = (accuracy) => {
    if (accuracy >= 97) return 'S+';
    if (accuracy >= 95) return 'S';
    if (accuracy >= 90) return 'A+';
    if (accuracy >= 85) return 'A';
    if (accuracy >= 80) return 'B+';
    if (accuracy >= 75) return 'B';
    if (accuracy >= 70) return 'C+';
    if (accuracy >= 65) return 'C';
    return 'D';
  };

  const getGradeColor = (grade) => {
    if (grade.startsWith('S')) return 'grade-s';
    if (grade.startsWith('A')) return 'grade-a';
    if (grade.startsWith('B')) return 'grade-b';
    if (grade.startsWith('C')) return 'grade-c';
    return 'grade-d';
  };

  const getConsistencyRating = (player) => {
    const totalQuestions = player.correctAnswers + player.incorrectAnswers;
    if (totalQuestions < 10) return 'Limited Data';
    if (player.accuracy >= 90 && totalQuestions >= 50) return 'Exceptional';
    if (player.accuracy >= 85 && totalQuestions >= 30) return 'Excellent';
    if (player.accuracy >= 80 && totalQuestions >= 20) return 'Very Good';
    if (player.accuracy >= 75) return 'Good';
    return 'Needs Improvement';
  };

  if (accuracyData.length === 0) {
    return (
      <div className="leaderboard-empty">
        <h2>🎯 Accuracy Masters</h2>
        <p>No accuracy data available.</p>
      </div>
    );
  }

  return (
    <div className="accuracy-leaderboard">
      <header className="leaderboard-header">
        <h2>🎯 Accuracy Masters</h2>
        <p>Players with the highest percentage of correct answers</p>
      </header>

      <div className="accuracy-podium">
        {accuracyData.slice(0, 3).map((player, index) => (
          <div 
            key={player.player}
            className={`podium-position position-${index + 1}`}
            onClick={() => onPlayerClick(player.player)}
          >
            <div className="podium-medal">
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
            </div>
            <div className="podium-player">
              <div className="player-name">{player.player}</div>
              <div className="accuracy-score">{player.accuracy.toFixed(1)}%</div>
              <div className={`accuracy-grade ${getGradeColor(getAccuracyGrade(player.accuracy))}`}>
                {getAccuracyGrade(player.accuracy)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="accuracy-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">{accuracyData[0]?.accuracy.toFixed(1)}%</div>
          <div className="stat-label">Highest Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-number">
            {(accuracyData.reduce((sum, p) => sum + p.accuracy, 0) / accuracyData.length).toFixed(1)}%
          </div>
          <div className="stat-label">Average Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-number">
            {accuracyData.filter(p => p.accuracy >= 90).length}
          </div>
          <div className="stat-label">90%+ Club</div>
        </div>
      </div>

      <div className="accuracy-detailed-list">
        <h3>Complete Rankings</h3>
        {accuracyData.map((player, index) => (
          <div 
            key={player.player}
            className={`accuracy-player-row ${index < 3 ? 'top-three' : ''}`}
            onClick={() => onPlayerClick(player.player)}
          >
            <div className="row-rank">
              <span className="rank-number">#{index + 1}</span>
            </div>

            <div className="row-player">
              <div className="player-info">
                <span className="accuracy-badge">{getAccuracyBadge(player.accuracy)}</span>
                <span className="player-name">{player.player}</span>
                <span className={`grade-badge ${getGradeColor(getAccuracyGrade(player.accuracy))}`}>
                  {getAccuracyGrade(player.accuracy)}
                </span>
              </div>
            </div>

            <div className="row-stats">
              <div className="main-stat">
                <span className="accuracy-percentage">{player.accuracy.toFixed(1)}%</span>
              </div>
              <div className="sub-stats">
                <div className="sub-stat">
                  <span className="stat-label">Correct:</span>
                  <span className="stat-value">{player.correctAnswers}</span>
                </div>
                <div className="sub-stat">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{player.correctAnswers + player.incorrectAnswers}</span>
                </div>
                <div className="sub-stat">
                  <span className="stat-label">Score:</span>
                  <span className="stat-value">{player.totalScore.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="row-consistency">
              <div className="consistency-rating">
                {getConsistencyRating(player)}
              </div>
            </div>

            <div className="row-visualization">
              <div className="accuracy-bar-container">
                <div 
                  className="accuracy-bar"
                  style={{ width: `${player.accuracy}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="accuracy-insights">
        <h3>📈 Accuracy Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <div className="insight-title">Perfect Performers</div>
              <div className="insight-text">
                {accuracyData.filter(p => p.accuracy === 100).length} players have 100% accuracy
              </div>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <div className="insight-title">Elite Group</div>
              <div className="insight-text">
                {accuracyData.filter(p => p.accuracy >= 95).length} players in the 95%+ elite group
              </div>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🔥</div>
            <div className="insight-content">
              <div className="insight-title">Top Accuracy Range</div>
              <div className="insight-text">
                {(accuracyData[0]?.accuracy - accuracyData[Math.min(9, accuracyData.length - 1)]?.accuracy).toFixed(1)}% 
                difference in top 10
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccuracyLeaderboard;
