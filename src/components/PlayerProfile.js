import React from 'react';
import { calculatePlayerStats } from '../utils/dataLoader';

const PlayerProfile = ({ player, rawData, onBack }) => {
  const stats = calculatePlayerStats(player, rawData);
  const playerRawData = rawData.filter(row => row.player === player);

  if (!stats) {
    return (
      <div className="player-profile">
        <button className="back-button" onClick={onBack}>
          ← Back to Leaderboard
        </button>
        <div className="profile-error">
          <h2>Player Not Found</h2>
          <p>No data available for player "{player}"</p>
        </div>
      </div>
    );
  }

  const getPerformanceRating = (accuracy) => {
    if (accuracy >= 95) return { rating: 'Exceptional', color: 'exceptional', icon: '🌟' };
    if (accuracy >= 90) return { rating: 'Excellent', color: 'excellent', icon: '🏆' };
    if (accuracy >= 85) return { rating: 'Very Good', color: 'very-good', icon: '⭐' };
    if (accuracy >= 80) return { rating: 'Good', color: 'good', icon: '👍' };
    if (accuracy >= 70) return { rating: 'Average', color: 'average', icon: '📊' };
    return { rating: 'Needs Improvement', color: 'poor', icon: '📈' };
  };

  const getSpeedRating = (avgTime) => {
    if (avgTime < 5) return { rating: 'Lightning Fast', color: 'exceptional', icon: '🚀' };
    if (avgTime < 10) return { rating: 'Very Fast', color: 'excellent', icon: '⚡' };
    if (avgTime < 15) return { rating: 'Fast', color: 'good', icon: '🏃' };
    if (avgTime < 20) return { rating: 'Moderate', color: 'average', icon: '🚶' };
    return { rating: 'Slow', color: 'poor', icon: '🐌' };
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const performanceRating = getPerformanceRating(stats.accuracy);
  const speedRating = getSpeedRating(stats.avgResponseTime);

  const getStreakBadges = (streak) => {
    const badges = [];
    if (streak >= 20) badges.push('🔥');
    if (streak >= 15) badges.push('⚡');
    if (streak >= 10) badges.push('🎯');
    if (streak >= 5) badges.push('⭐');
    return badges;
  };

  // Calculate question difficulty performance
  const questionStats = playerRawData.reduce((acc, row) => {
    const questionNum = row.quizQuestionNumber;
    if (!acc[questionNum]) {
      acc[questionNum] = { correct: 0, total: 0, avgTime: 0 };
    }
    acc[questionNum].total++;
    acc[questionNum].avgTime = (acc[questionNum].avgTime * (acc[questionNum].total - 1) + row.answerTimeSeconds) / acc[questionNum].total;
    if (row.isCorrect) acc[questionNum].correct++;
    return acc;
  }, {});

  const recentPerformance = playerRawData.slice(-10); // Last 10 questions

  return (
    <div className="player-profile">
      <button className="back-button" onClick={onBack}>
        ← Back to Leaderboard
      </button>

      <div className="profile-header">
        <div className="player-avatar">
          <span className="avatar-text">{player.charAt(0).toUpperCase()}</span>
        </div>
        <div className="player-details">
          <h1 className="player-name">{player}</h1>
        </div>
      </div>

      <div className="profile-stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🏆</div>
          <div className="stat-number">{stats.totalScore.toLocaleString()}</div>
          <div className="stat-label">Total Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-number">{stats.accuracy.toFixed(1)}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-number">{stats.bestStreak}</div>
          <div className="stat-label">Best Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{stats.correctAnswers}</div>
          <div className="stat-label">Correct Answers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-number">{stats.incorrectAnswers}</div>
          <div className="stat-label">Incorrect Answers</div>
        </div>
      </div>

      <div className="profile-sections">
        

        <div className="profile-section">
          <h3>🎯 Recent Performance</h3>
          <div className="recent-questions">
            {recentPerformance.slice().reverse().map((question, index, array) => (
              <div 
                key={`${question.quizQuestionNumber}-${index}`}
                className={`question-result ${question.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="question-number">Q{question.quizQuestionNumber}</div>
                <div className="question-status">
                  {question.isCorrect ? '✅' : '❌'}
                </div>
                <div className="question-time">{formatTime(question.answerTimeSeconds)}</div>
                <div className="question-score">+{question.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h3>📈 Detailed Statistics</h3>
          <div className="detailed-stats">
            <div className="stat-row">
              <span className="stat-name">Total Questions Attempted:</span>
              <span className="stat-value">{stats.totalQuestions}</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Average Time (% of allotted):</span>
              <span className="stat-value">{stats.avgResponseTimePercent.toFixed(1)}%</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Best Correct Streak:</span>
              <span className="stat-value">{stats.bestStreak} questions</span>
            </div>
            <div className="stat-row">
              <span className="stat-name">Success Rate:</span>
              <span className="stat-value">
                {stats.correctAnswers} out of {stats.totalQuestions} 
                ({((stats.correctAnswers / stats.totalQuestions) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;