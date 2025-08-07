import React, { useMemo } from 'react';

const Analytics = ({ data }) => {
  const analytics = useMemo(() => {
    const { finalScores, rawData } = data;
    
    if (!finalScores.length || !rawData.length) {
      return null;
    }

    // Question difficulty analysis
    const questionDifficulty = rawData.reduce((acc, row) => {
      const questionNum = row.quizQuestionNumber;
      if (!acc[questionNum]) {
        acc[questionNum] = {
          questionNumber: questionNum,
          question: row.question,
          totalAttempts: 0,
          correctAttempts: 0,
          totalTime: 0,
          players: new Set()
        };
      }
      
      acc[questionNum].totalAttempts++;
      acc[questionNum].totalTime += row.answerTimeSeconds;
      acc[questionNum].players.add(row.player);
      if (row.isCorrect) {
        acc[questionNum].correctAttempts++;
      }
      
      return acc;
    }, {});

    const questionStats = Object.values(questionDifficulty).map(q => ({
      ...q,
      difficulty: ((q.totalAttempts - q.correctAttempts) / q.totalAttempts) * 100,
      avgTime: q.totalTime / q.totalAttempts,
      playerCount: q.players.size
    })).sort((a, b) => b.difficulty - a.difficulty);

    // Player performance distribution
    const accuracyDistribution = {
      '90-100%': finalScores.filter(p => p.accuracy >= 90).length,
      '80-89%': finalScores.filter(p => p.accuracy >= 80 && p.accuracy < 90).length,
      '70-79%': finalScores.filter(p => p.accuracy >= 70 && p.accuracy < 80).length,
      '60-69%': finalScores.filter(p => p.accuracy >= 60 && p.accuracy < 70).length,
      'Below 60%': finalScores.filter(p => p.accuracy < 60).length
    };

    // Score distribution
    const scoreRanges = {
      '1000+': finalScores.filter(p => p.totalScore >= 1000).length,
      '500-999': finalScores.filter(p => p.totalScore >= 500 && p.totalScore < 1000).length,
      '250-499': finalScores.filter(p => p.totalScore >= 250 && p.totalScore < 500).length,
      '100-249': finalScores.filter(p => p.totalScore >= 100 && p.totalScore < 250).length,
      'Below 100': finalScores.filter(p => p.totalScore < 100).length
    };

    // Speed analysis
    const speedData = rawData.reduce((acc, row) => {
      if (!acc[row.player]) {
        acc[row.player] = { totalTime: 0, totalQuestions: 0 };
      }
      acc[row.player].totalTime += row.answerTimeSeconds;
      acc[row.player].totalQuestions++;
      return acc;
    }, {});

    const avgResponseTimes = Object.entries(speedData).map(([player, data]) => ({
      player,
      avgTime: data.totalTime / data.totalQuestions
    }));

    const speedDistribution = {
      'Under 5s': avgResponseTimes.filter(p => p.avgTime < 5).length,
      '5-10s': avgResponseTimes.filter(p => p.avgTime >= 5 && p.avgTime < 10).length,
      '10-15s': avgResponseTimes.filter(p => p.avgTime >= 10 && p.avgTime < 15).length,
      '15-20s': avgResponseTimes.filter(p => p.avgTime >= 15 && p.avgTime < 20).length,
      'Over 20s': avgResponseTimes.filter(p => p.avgTime >= 20).length
    };

    return {
      questionStats,
      accuracyDistribution,
      scoreRanges,
      speedDistribution,
      totalPlayers: finalScores.length,
      totalQuestions: Object.keys(questionDifficulty).length,
      totalAttempts: rawData.length,
      avgAccuracy: finalScores.reduce((sum, p) => sum + p.accuracy, 0) / finalScores.length,
      avgScore: finalScores.reduce((sum, p) => sum + p.totalScore, 0) / finalScores.length
    };
  }, [data]);

  if (!analytics) {
    return (
      <div className="analytics-empty">
        <h2>📊 Analytics Dashboard</h2>
        <p>No data available for analysis. Please ensure your Excel file contains both score and question data.</p>
      </div>
    );
  }

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty >= 80) return 'very-hard';
    if (difficulty >= 60) return 'hard';
    if (difficulty >= 40) return 'medium';
    if (difficulty >= 20) return 'easy';
    return 'very-easy';
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty >= 80) return 'Very Hard';
    if (difficulty >= 60) return 'Hard';
    if (difficulty >= 40) return 'Medium';
    if (difficulty >= 20) return 'Easy';
    return 'Very Easy';
  };

  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <h2>📊 Analytics Dashboard</h2>
        <p>Deep insights into quiz performance and patterns</p>
      </header>

      <div className="analytics-overview">
        <div className="overview-card">
          <div className="overview-icon">👥</div>
          <div className="overview-number">{analytics.totalPlayers}</div>
          <div className="overview-label">Total Players</div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">❓</div>
          <div className="overview-number">{analytics.totalQuestions}</div>
          <div className="overview-label">Unique Questions</div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">📝</div>
          <div className="overview-number">{analytics.totalAttempts.toLocaleString()}</div>
          <div className="overview-label">Total Attempts</div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">📊</div>
          <div className="overview-number">{analytics.avgAccuracy.toFixed(1)}%</div>
          <div className="overview-label">Average Accuracy</div>
        </div>
      </div>

      <div className="analytics-sections">
        <div className="analytics-section">
          <h3>🎯 Accuracy Distribution</h3>
          <div className="distribution-chart">
            {Object.entries(analytics.accuracyDistribution).map(([range, count]) => (
              <div key={range} className="distribution-item">
                <div className="distribution-label">{range}</div>
                <div className="distribution-bar-container">
                  <div 
                    className="distribution-bar accuracy-bar"
                    style={{ width: `${(count / analytics.totalPlayers) * 100}%` }}
                  ></div>
                  <span className="distribution-count">{count} players</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h3>🏆 Score Distribution</h3>
          <div className="distribution-chart">
            {Object.entries(analytics.scoreRanges).map(([range, count]) => (
              <div key={range} className="distribution-item">
                <div className="distribution-label">{range} points</div>
                <div className="distribution-bar-container">
                  <div 
                    className="distribution-bar score-bar"
                    style={{ width: `${(count / analytics.totalPlayers) * 100}%` }}
                  ></div>
                  <span className="distribution-count">{count} players</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h3>⚡ Response Time Distribution</h3>
          <div className="distribution-chart">
            {Object.entries(analytics.speedDistribution).map(([range, count]) => (
              <div key={range} className="distribution-item">
                <div className="distribution-label">{range}</div>
                <div className="distribution-bar-container">
                  <div 
                    className="distribution-bar speed-bar"
                    style={{ width: `${(count / analytics.totalPlayers) * 100}%` }}
                  ></div>
                  <span className="distribution-count">{count} players</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h3>🧩 Question Difficulty Analysis</h3>
          <div className="question-difficulty-list">
            <div className="difficulty-header">
              <div className="difficulty-legend">
                <span className="legend-item very-hard">Very Hard (80%+ miss rate)</span>
                <span className="legend-item hard">Hard (60-79%)</span>
                <span className="legend-item medium">Medium (40-59%)</span>
                <span className="legend-item easy">Easy (20-39%)</span>
                <span className="legend-item very-easy">Very Easy (&lt;20%)</span>
              </div>
            </div>
            
            {analytics.questionStats.slice(0, 15).map((question) => (
              <div key={question.questionNumber} className="difficulty-item">
                <div className="question-info">
                  <div className="question-header">
                    <span className="question-number">Q{question.questionNumber}</span>
                    <span className={`difficulty-badge ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyLabel(question.difficulty)}
                    </span>
                  </div>
                  <div className="question-text">
                    {question.question || 'Question text not available'}
                  </div>
                </div>
                
                <div className="question-stats">
                  <div className="stat-item">
                    <span className="stat-label">Miss Rate:</span>
                    <span className="stat-value">{question.difficulty.toFixed(1)}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Time:</span>
                    <span className="stat-value">{formatTime(question.avgTime)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Attempts:</span>
                    <span className="stat-value">{question.totalAttempts}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Players:</span>
                    <span className="stat-value">{question.playerCount}</span>
                  </div>
                </div>

                <div className="difficulty-visualization">
                  <div className="difficulty-bar-container">
                    <div 
                      className={`difficulty-bar ${getDifficultyColor(question.difficulty)}`}
                      style={{ width: `${question.difficulty}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-section">
          <h3>🔍 Key Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <div className="insight-title">Hardest Question</div>
                <div className="insight-text">
                  Question {analytics.questionStats[0]?.questionNumber} has {analytics.questionStats[0]?.difficulty.toFixed(1)}% miss rate
                </div>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">⚡</div>
              <div className="insight-content">
                <div className="insight-title">Speed vs Accuracy</div>
                <div className="insight-text">
                  {analytics.speedDistribution['Under 5s']} players answer in under 5 seconds
                </div>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">🏆</div>
              <div className="insight-content">
                <div className="insight-title">Elite Performance</div>
                <div className="insight-text">
                  {analytics.accuracyDistribution['90-100%']} players ({((analytics.accuracyDistribution['90-100%'] / analytics.totalPlayers) * 100).toFixed(1)}%) achieve 90%+ accuracy
                </div>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <div className="insight-title">High Scorers</div>
                <div className="insight-text">
                  {analytics.scoreRanges['1000+']} players break the 1000 point barrier
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;