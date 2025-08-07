import * as XLSX from 'xlsx';

export const loadExcelData = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Read Final Scores sheet (headers in row 3)
    const finalScoresSheet = workbook.Sheets['Final Scores'] || workbook.Sheets['FinalScores'];
    const finalScores = finalScoresSheet ? XLSX.utils.sheet_to_json(finalScoresSheet, { range: 2 }): [];
    console.log('📊 Final Scores parsing: Using row 3 as headers');
    
    // Read Raw Report Data sheet (headers in row 1)
    const rawDataSheet = workbook.Sheets['RawReportData Data'] || workbook.Sheets['Raw Report Data'];
    const rawData = rawDataSheet ? XLSX.utils.sheet_to_json(rawDataSheet, { range: 0 }) : [];
    console.log('📋 Raw Data parsing: Using row 1 as headers');
    
    const processedFinalScores = processScoreData(finalScores);
    const processedRawData = processRawData(rawData);
    
    // Debug: Check processed data
    console.log('🔄 Processed Final Scores:', processedFinalScores.length);
    console.log('🔄 Processed Raw Data:', processedRawData.length);
    
    if (processedFinalScores.length > 0) {
      console.log('👤 First final score player:', processedFinalScores[0].player);
    }
    if (processedRawData.length > 0) {
      console.log('👤 First raw data player:', processedRawData[0].player);
    }
    
    // Check for player name mismatches
    if (processedFinalScores.length > 0 && processedRawData.length > 0) {
      const finalScorePlayers = new Set(processedFinalScores.map(p => p.player));
      const rawDataPlayers = new Set(processedRawData.map(p => p.player));
      
      console.log('🎯 Final Score Players (first 3):', [...finalScorePlayers].slice(0, 3));
      console.log('🎯 Raw Data Players (first 3):', [...rawDataPlayers].slice(0, 3));
      
      const matchingPlayers = [...finalScorePlayers].filter(p => rawDataPlayers.has(p));
      console.log('✅ Matching players:', matchingPlayers.length, 'out of', finalScorePlayers.size);
    }

    return {
      finalScores: processedFinalScores,
      rawData: processedRawData
    };
  } catch (error) {
    console.error('Error loading Excel data:', error);
    throw error;
  }
};

const processScoreData = (data) => {
  // Debug: Check field names in final scores
  if (data.length > 0) {
    console.log('🔍 Final scores fields available:', Object.keys(data[0]));
  }
  
  return data.map((row, index) => ({
    rank: row.Rank || index + 1,
    player: row.Player || row.player || `Player ${index + 1}`,
    totalScore: parseFloat(row['Total Score (points)'] || row.totalScore || 0),
    correctAnswers: parseInt(row['Correct Answers'] || row.correctAnswers || 0),
    incorrectAnswers: parseInt(row['Incorrect Answers'] || row.incorrectAnswers || 0),
    gamesPlayed: parseInt(row['Games Played'] || row.gamesPlayed || 0),
    accuracy: 0 // Will be calculated
  })).map(player => ({
    ...player,
    accuracy: player.correctAnswers + player.incorrectAnswers > 0 
      ? (player.correctAnswers / (player.correctAnswers + player.incorrectAnswers)) * 100 
      : 0
  }));
};

const processRawData = (data) => {
  // Debug: Check field names in raw data
  if (data.length > 0) {
    console.log('🔍 Raw data fields available:', Object.keys(data[0]));
  }
  
  return data.map(row => ({
    quizQuestionNumber: row['Quiz Question Number'] || row.quizQuestionNumber,
    question: row.Question || row.question,
    answer1: row['Answer 1'] || row.answer1,
    answer2: row['Answer 2'] || row.answer2,
    answer3: row['Answer 3'] || row.answer3,
    answer4: row['Answer 4'] || row.answer4,
    answer5: row['Answer 5'] || row.answer5,
    answer6: row['Answer 6'] || row.answer6,
    correctAnswers: row['Correct Answers'] || row.correctAnswers,
    timeAllotted: parseFloat(row['Time Allotted to Answer (seconds)'] || row.timeAllotted || 0),
    playerAnswer: row['Player Answer'] || row.playerAnswer,
    isCorrect: (row['Correct / Incorrect'] || row.isCorrect || '').toLowerCase() === 'correct',
    score: parseFloat(row['Score (points)'] || row.score || 0),
    scoreWithoutBonus: parseFloat(row['Score without Answer Streak Bonus (points)'] || row.scoreWithoutBonus || 0),
    currentTotalScore: parseFloat(row['Current Total Score (points)'] || row.currentTotalScore || 0),
    answerTimePercent: parseFloat(row['Answer Time (%)'] || row.answerTimePercent || 0),
    answerTimeSeconds: parseFloat(row['Answer Time (seconds)'] || row.answerTimeSeconds || 0),
    player: row.Player || row.player || 'Unknown Player'
  }));
};

// Utility functions for analytics
export const calculatePlayerStats = (player, rawData) => {
  console.log('🔍 Looking for player:', `"${player}"`);
  
  const playerData = rawData.filter(row => row.player === player);
  console.log('🎯 Found player data rows:', playerData.length);
  
  if (playerData.length === 0) {
    console.log('❌ Player not found. Available players:', [...new Set(rawData.map(row => row.player))].slice(0, 3));
    return null;
  }
  
  const totalQuestions = playerData.length;
  const correctAnswers = playerData.filter(row => row.isCorrect).length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  
  const avgResponseTime = playerData.reduce((sum, row) => sum + row.answerTimeSeconds, 0) / totalQuestions;
  const avgResponseTimePercent = playerData.reduce((sum, row) => sum + row.answerTimePercent, 0) / totalQuestions;
  
  const bestStreak = calculateBestStreak(playerData);
  const categoryStats = calculateCategoryStats(playerData);
  
  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    accuracy,
    avgResponseTime,
    avgResponseTimePercent,
    bestStreak,
    categoryStats,
    totalScore: playerData[playerData.length - 1]?.currentTotalScore || 0
  };
};

const calculateBestStreak = (playerData) => {
  let currentStreak = 0;
  let bestStreak = 0;
  
  playerData.forEach(row => {
    if (row.isCorrect) {
      currentStreak++;
      bestStreak = Math.max(bestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return bestStreak;
};

const calculateCategoryStats = (playerData) => {
  // This would need to be implemented based on your question categorization
  // For now, return empty object
  return {};
};

export const getTopPlayers = (data, metric = 'totalScore', limit = 10) => {
  const sortedData = [...data].sort((a, b) => {
    switch (metric) {
      case 'accuracy':
        return b.accuracy - a.accuracy;
      case 'correctAnswers':
        return b.correctAnswers - a.correctAnswers;
      case 'gamesPlayed':
        return b.gamesPlayed - a.gamesPlayed;
      default:
        return b.totalScore - a.totalScore;
    }
  });
  
  return sortedData.slice(0, limit);
};

export const getSpeedLeaderboard = (rawData, limit = 10) => {
  console.log('⚡ Speed Leaderboard - Raw data rows:', rawData.length);
  
  const playerStats = {};
  
  rawData.forEach(row => {
    const player = row.player;
    if (!playerStats[player]) {
      playerStats[player] = {
        player,
        totalTime: 0,
        totalQuestions: 0,
        correctQuestions: 0
      };
    }
    
    playerStats[player].totalTime += row.answerTimeSeconds;
    playerStats[player].totalQuestions++;
    if (row.isCorrect) {
      playerStats[player].correctQuestions++;
    }
  });
  
  const speedStats = Object.values(playerStats)
    .filter(player => player.totalQuestions >= 5) // Minimum questions requirement
    .map(player => ({
      ...player,
      avgTime: player.totalTime / player.totalQuestions,
      accuracy: (player.correctQuestions / player.totalQuestions) * 100
    }))
    .sort((a, b) => a.avgTime - b.avgTime) // Fastest first
    .slice(0, limit);
    
  console.log('⚡ Speed Stats calculated:', speedStats.length, 'qualified players');
  if (speedStats.length > 0) {
    console.log('⚡ First speed player:', speedStats[0].player, speedStats[0].avgTime);
  }
  
  return speedStats;
};