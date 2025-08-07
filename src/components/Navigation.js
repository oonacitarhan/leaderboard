import React from 'react';

const Navigation = ({ currentView, onViewChange }) => {
  const views = [
    { id: 'leaderboard', label: '🏆 Overall Rankings', icon: '🏆' },
    { id: 'speed', label: '⚡ Speed Champions', icon: '⚡' },
    { id: 'accuracy', label: '🎯 Accuracy Masters', icon: '🎯' },
    { id: 'analytics', label: '📊 Analytics', icon: '📊' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-buttons">
        {views.map((view) => (
          <button
            key={view.id}
            className={`nav-button ${currentView === view.id ? 'active' : ''}`}
            onClick={() => onViewChange(view.id)}
          >
            <span className="nav-icon">{view.icon}</span>
            <span className="nav-label">{view.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;