import React, { useState, useEffect } from 'react';
import './App.css';
import Leaderboard from './components/Leaderboard';
import PlayerProfile from './components/PlayerProfile';
import { loadExcelData } from './utils/dataLoader';

function App() {
  const [data, setData] = useState({ finalScores: [], rawData: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const excelData = await loadExcelData('/leaderboard/results.xlsx');
        setData(excelData);
      } catch (err) {
        setError('Failed to load leaderboard data. Make sure results.xlsx is in the public folder.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading leaderboard data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <h2>⚠️ Error Loading Data</h2>
          <p>{error}</p>
          <div className="error-help">
            <h3>To get started:</h3>
            <ol>
              <li>Add your <code>results.xlsx</code> file to the <code>public</code> folder</li>
              <li>Make sure it has "Final Scores" and "RawReportData" sheets</li>
              <li>Refresh the page</li>
            </ol>
          </div>
        </div>
      );
    }

    if (selectedPlayer) {
      return (
        <PlayerProfile
          player={selectedPlayer}
          rawData={data.rawData}
          onBack={() => setSelectedPlayer(null)}
        />
      );
    }

    return <Leaderboard data={data} onPlayerClick={setSelectedPlayer} />;
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🏆 Quiz Champions Leaderboard</h1>
      </header>

      {/* Navigation removed to show only Overall Rankings */}

      <main className="app-main">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>Total Players: {data.finalScores.length} | Total Questions Answered: {data.rawData.length}</p>
      </footer>
    </div>
  );
}

export default App;
