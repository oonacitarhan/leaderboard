import React from 'react';
import { getSpeedLeaderboard } from '../utils/dataLoader';

const SpeedLeaderboard = ({ data, onPlayerClick }) => {
  const speedData = getSpeedLeaderboard(data.rawData, 20);

  const formatTime = (seconds) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const getSpeedBadge = (avgTime) => {
    if (avgTime < 5) return '🚀';
    if (avgTime < 10) return '⚡';
    if (avgTime < 15) return '🏃';
    return '🚶';
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'excellent';
    if (accuracy >= 80) return 'good';
    if (accuracy >= 70) return 'average';
    return 'poor';
  };

  if (speedData.length === 0) {
    return (
      <div className="leaderboard-empty">
        <h2>⚡ Speed Champions</h2>
        <p>No speed data available. Players need at least 5 answered questions to appear here.</p>
      </div>
    );
  }

  return (
    <div className="speed-leaderboard">
      <header className="leaderboard-header">
        <h2>⚡ Speed Champions</h2>
        <p>Fastest average response times (minimum 5 questions)</p>
      </header>

      <div className="speed-stats-overview">
        <div className="speed-stat-card">
          <div className="stat-number">{formatTime(speedData[0]?.avgTime || 0)}</div>
          <div className="stat-label">Fastest Average</div>
          <div className="stat-player">{speedData[0]?.player}</div>
        </div>
        <div className="speed-stat-card">
          <div className="stat-number">
            {formatTime(speedData.reduce((sum, p) => sum + p.avgTime, 0) / speedData.length)}
          </div>
          <div className="stat-label">Overall Average</div>
        </div>
        <div className="speed-stat-card">
          <div className="stat-number">{speedData.length}</div>
          <div className="stat-label">Qualified Players</div>
        </div>
      </div>

      <div className="speed-leaderboard-list">
        {speedData.map((player, index) => (
          <div 
            key={player.player} 
            className={`speed-player-card ${index < 3 ? 'podium' : ''}`}
            onClick={() => onPlayerClick(player.player)}
          >
            <div className="speed-rank">
              <span className="rank-number">#{index + 1}</span>
              {index < 3 && (
                <span className="podium-badge">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </span>
              )}
            </div>

            <div className="speed-player-info">
              <div className="player-header">
                <span className="speed-badge">{getSpeedBadge(player.avgTime)}</span>
                <span className="player-name">{player.player}</span>
              </div>
              
              <div className="speed-metrics">
                <div className="metric">
                  <span className="metric-label">Avg Time:</span>
                  <span className="metric-value primary">{formatTime(player.avgTime)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Accuracy:</span>
                  <span className={`metric-value ${getAccuracyColor(player.accuracy)}`}>
                    {player.accuracy.toFixed(1)}%
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Questions:</span>
                  <span className="metric-value">{player.totalQuestions}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Correct:</span>
                  <span className="metric-value">{player.correctQuestions}</span>
                </div>
              </div>
            </div>

            <div className="speed-visualization">
              <div className="speed-bar-container">
                <div 
                  className="speed-bar"
                  style={{
                    width: `${Math.max(5, 100 - (player.avgTime / speedData[speedData.length - 1].avgTime) * 100)}%`
                  }}
                ></div>
              </div>
              <div className="speed-score">
                Speed Score: {Math.round(1000 / player.avgTime)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="speed-insights">
        <h3>💡 Speed Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <div className="insight-title">Speed vs Accuracy</div>
              <div className="insight-text">
                Top speed players maintain {speedData.slice(0, 3).reduce((sum, p) => sum + p.accuracy, 0) / 3 > 80 ? 'excellent' : 'good'} accuracy
              </div>
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <div className="insight-content">
              <div className="insight-title">Performance Range</div>
              <div className="insight-text">
                {formatTime(speedData[speedData.length - 1].avgTime - speedData[0].avgTime)} difference between fastest and slowest
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedLeaderboard;