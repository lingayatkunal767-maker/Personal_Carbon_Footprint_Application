import React, { useState, useMemo } from 'react';

const ENTRY_COLORS = ['#2d7a4f', '#e8a624', '#5aaa72', '#4a90d9', '#e05c5c', '#c06dcc', '#2dc9a0'];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getRankDisplay(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

const LeaderboardCard = ({ entries = [], currentUserId, loading, onRefresh }) => {
  const [showFull, setShowFull] = useState(false);

  const rankedEntries = useMemo(() => {
    const sorted = [...entries].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    const maxScore = sorted[0]?.score || 1;
    return sorted.map((e, i) => ({
      ...e,
      barWidth: `${Math.max(4, Math.round(((e.score || 0) / maxScore) * 100))}%`,
      color: ENTRY_COLORS[i % ENTRY_COLORS.length],
    }));
  }, [entries]);

  const visibleEntries = showFull ? rankedEntries : rankedEntries.slice(0, 3);
  const currentUserEntry = rankedEntries.find(e => String(e.id) === String(currentUserId));
  const currentUserInVisible = visibleEntries.some(e => String(e.id) === String(currentUserId));

  return (
    <div className="card">
      <div className="card-title">
        🏆 Individual Leaderboard
        <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
          {onRefresh && (
            <button className="card-action" onClick={onRefresh} title="Refresh">↻</button>
          )}
          <button className="card-action" onClick={() => setShowFull(p => !p)}>
            {showFull ? 'Top 3' : 'Full List →'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '1.2rem', color: 'var(--muted)', fontSize: '.85rem' }}>
          Loading rankings…
        </div>
      ) : entries.length === 0 ? (
        <div className="card-empty">
          No rankings yet. Log activities to appear on the leaderboard!
        </div>
      ) : (
        <>
          {visibleEntries.map((entry) => {
            const isMe = String(entry.id) === String(currentUserId);
            return (
              <div key={entry.id ?? entry.rank} className={`lb-row${isMe ? ' lb-you' : ''}`}>
                <span className="lb-rank">{getRankDisplay(entry.rank)}</span>
                <div
                  className="lb-av"
                  style={{
                    background: entry.profilePicture
                      ? `url(${entry.profilePicture}) center/cover no-repeat`
                      : entry.color,
                    fontSize: entry.profilePicture ? '0' : '.7rem',
                    color: '#fff',
                  }}
                >
                  {!entry.profilePicture && getInitials(entry.name)}
                </div>
                <span className="lb-name" style={isMe ? { fontWeight: 700, color: 'var(--g-dark)' } : {}}>
                  {entry.name}{isMe ? ' (You)' : ''}
                </span>
                <div className="lb-bar-wrap">
                  <div className="lb-bar" style={{ width: entry.barWidth, background: entry.color }} />
                </div>
                <span className="lb-score" style={isMe ? { color: entry.color, fontWeight: 700 } : {}}>
                  {entry.score}
                </span>
              </div>
            );
          })}

          {currentUserEntry && !currentUserInVisible && (
            <div className="lb-row lb-you">
              <span className="lb-rank">{getRankDisplay(currentUserEntry.rank)}</span>
              <div className="lb-av" style={{ background: '#4a90d9', fontSize: '.7rem', color: '#fff' }}>
                {getInitials(currentUserEntry.name)}
              </div>
              <span className="lb-name" style={{ fontWeight: 700, color: 'var(--g-dark)' }}>
                {currentUserEntry.name} (You)
              </span>
              <div className="lb-bar-wrap">
                <div className="lb-bar" style={{ width: currentUserEntry.barWidth, background: '#4a90d9' }} />
              </div>
              <span className="lb-score" style={{ color: '#4a90d9', fontWeight: 700 }}>
                {currentUserEntry.score}
              </span>
            </div>
          )}

          <button className="btn-lb" onClick={() => setShowFull(p => !p)}>
            {showFull ? 'Show Top 3' : `View All ${entries.length} Participants`}
          </button>
        </>
      )}
    </div>
  );
};

export default LeaderboardCard;
