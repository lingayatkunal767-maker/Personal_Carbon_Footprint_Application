import React, { useState } from 'react';

const LeaderboardCard = () => {
  const [showFull, setShowFull] = useState(false);
  const topTeams = [
    { rank: '🥇', icon: '🌿', name: 'Team Green', score: 845, barWidth: '100%', bg: '#2d7a4f' },
    { rank: '🥈', icon: '🌍', name: 'Team Earth', score: 720, barWidth: '85%', bg: '#e8a624' },
    { rank: '🥉', icon: '♻️', name: 'Team Eco', score: 690, barWidth: '82%', bg: '#5aaa72' }
  ];
  const extraTeams = [
    { rank: '#4', icon: '🌊', name: 'Team Ocean', score: 620, barWidth: '72%', bg: '#4a90d9' },
    { rank: '#5', icon: '🌋', name: 'Team Ember', score: 490, barWidth: '58%', bg: '#e05c5c' }
  ];
  const visibleTeams = showFull ? [...topTeams, ...extraTeams] : topTeams;

  return (
    <div className="card">
      <div className="card-title">
        🏆 Leaderboard
        <button className="card-action" onClick={() => setShowFull((prev) => !prev)}>
          {showFull ? 'Hide Standings' : 'Full Standings →'}
        </button>
      </div>
      {visibleTeams.map((team, index) => (
        <div key={index} className="lb-row">
          <span className="lb-rank">{team.rank}</span>
          <div className="lb-av" style={{ background: team.bg }}>{team.icon}</div>
          <span className="lb-name">{team.name}</span>
          <div className="lb-bar-wrap">
            <div className="lb-bar" style={{ width: team.barWidth }}></div>
          </div>
          <span className="lb-score">{team.score}</span>
        </div>
      ))}
      <div className="lb-row lb-you">
        <span className="lb-rank" style={{ color: 'var(--sky)' }}>#5</span>
        <div className="lb-av" style={{ background: 'var(--sky)' }}>👤</div>
        <span className="lb-name" style={{ fontWeight: '700' }}>You</span>
        <div className="lb-bar-wrap">
          <div className="lb-bar" style={{ width: '58%', background: 'var(--sky)' }}></div>
        </div>
        <span className="lb-score" style={{ color: 'var(--sky)' }}>490</span>
      </div>
      <button className="btn-lb" onClick={() => setShowFull((prev) => !prev)}>
        {showFull ? 'Show Top 3' : 'View Full Leaderboard'}
      </button>
    </div>
  );
};

export default LeaderboardCard;
