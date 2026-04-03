function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day:   'numeric',
      month: 'short',
      year:  'numeric',
      hour:  '2-digit',
      minute:'2-digit',
    });
  } catch {
    return iso;
  }
}

function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return '—';
  if (minutes < 1) return '< 1 min';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export default function HistoryView({ history, setHistory }) {
  function deleteEntry(id) {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id);
      localStorage.setItem('poker-app-history', JSON.stringify(next));
      return next;
    });
  }

  function clearAll() {
    if (!window.confirm('Clear all game history?')) return;
    setHistory([]);
    localStorage.removeItem('poker-app-history');
  }

  return (
    <div className="history-view">
      <div className="history-header">
        <h2>Game History</h2>
        {history.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearAll}>
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="history-empty">
          <div className="empty-icon">🃏</div>
          <p>No games logged yet.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Finished games will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {history.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Games Played
                </div>
              </div>

              {/* Most wins */}
              {(() => {
                const wins = {};
                history.forEach(e => { wins[e.winner] = (wins[e.winner] || 0) + 1; });
                const topWinner = Object.entries(wins).sort((a, b) => b[1] - a[1])[0];
                if (!topWinner) return null;
                return (
                  <div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {topWinner[0]}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Top Winner ({topWinner[1]} win{topWinner[1] !== 1 ? 's' : ''})
                    </div>
                  </div>
                );
              })()}

              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {formatDuration(Math.round(history.reduce((s, e) => s + (e.durationMin || 0), 0) / history.length))}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Avg Duration
                </div>
              </div>
            </div>
          </div>

          <div className="history-list">
            {history.map(entry => (
              <div key={entry.id} className="history-item">
                <div className="history-item-main">
                  <div className="history-winner-name">
                    🏆 {entry.winner}
                  </div>
                  <div className="history-meta">
                    <span>📅 {formatDate(entry.date)}</span>
                    <span>👥 {entry.playerCount} players</span>
                    <span>⏱ {formatDuration(entry.durationMin)}</span>
                    {entry.finalLevel && (
                      <span>🎯 Reached Level {entry.finalLevel}</span>
                    )}
                  </div>
                  {entry.players && entry.players.length > 0 && (
                    <div className="history-players-list">
                      {entry.players.join(' · ')}
                    </div>
                  )}
                </div>
                <div className="history-item-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => deleteEntry(entry.id)}
                    title="Delete entry"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
