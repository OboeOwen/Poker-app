import { useState } from 'react';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

// ── Blind Timer ───────────────────────────────────────────────────────────────
function BlindTimer({ gameConfig, gameState, onToggleTimer, onSkipLevel, onPrevLevel }) {
  const { blindStructure } = gameConfig;
  const { timerLevel, timerSecondsRemaining, timerRunning } = gameState;

  const currentBlind = blindStructure[timerLevel] ?? blindStructure[blindStructure.length - 1];
  const nextBlind    = blindStructure[timerLevel + 1];
  const levelDurationSec = currentBlind.duration * 60;

  const progress  = levelDurationSec > 0
    ? ((levelDurationSec - timerSecondsRemaining) / levelDurationSec) * 100
    : 100;

  const timerClass = timerSecondsRemaining <= 30
    ? 'timer-countdown critical'
    : timerSecondsRemaining <= 60
      ? 'timer-countdown warning'
      : 'timer-countdown';

  return (
    <div className="blind-timer-card">
      <div className="blind-timer-header">
        <span className="blind-level-badge">
          Level <span>{currentBlind.level}</span>
          {timerLevel >= blindStructure.length - 1 && ' (Final)'}
        </span>
        {timerRunning
          ? <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>● Running</span>
          : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏸ Paused</span>
        }
      </div>

      <div className="blind-timer-body">
        <div className="blind-amounts">
          <div className="blind-amounts-main">
            {currentBlind.small.toLocaleString()} / {currentBlind.big.toLocaleString()}
          </div>
          <div className="blind-amounts-label">Small / Big Blind</div>
          {nextBlind && (
            <div className="blind-next">
              Next: <strong>{nextBlind.small.toLocaleString()} / {nextBlind.big.toLocaleString()}</strong>
            </div>
          )}
          {!nextBlind && (
            <div className="blind-next" style={{ color: 'var(--warn)' }}>Final level reached</div>
          )}
        </div>

        <div className="blind-timer-display">
          <div className={timerClass}>{formatTime(timerSecondsRemaining)}</div>
          <div className="timer-label">{currentBlind.duration} min level</div>
          <div className="timer-progress-bar" style={{ marginTop: '0.5rem' }}>
            <div
              className="timer-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="timer-controls">
        <button
          className="btn btn-ghost btn-sm"
          onClick={onPrevLevel}
          disabled={timerLevel === 0}
          title="Previous level"
        >
          ◀ Prev
        </button>

        <button
          className={`btn-play-pause ${timerRunning ? 'playing' : ''}`}
          onClick={onToggleTimer}
        >
          {timerRunning ? '⏸' : '▶'}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={onSkipLevel}
          disabled={timerLevel >= blindStructure.length - 1}
          title="Next level"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}

// ── Elimination Confirm Modal ─────────────────────────────────────────────────
function EliminationModal({ player, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Eliminate Player?</h3>
        <p>Mark <strong>{player.name}</strong> as eliminated from this game?</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Eliminate</button>
        </div>
      </div>
    </div>
  );
}

// ── End Game Section ──────────────────────────────────────────────────────────
function EndGameSection({ activePlayers, onEndGame, onResetGame }) {
  return (
    <div className="end-game-section">
      <h3>
        {activePlayers.length === 1
          ? '🏆 We have a winner!'
          : 'Declare Winner'}
      </h3>

      {activePlayers.length === 1 ? (
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text)' }}>{activePlayers[0].name}</strong> is the last player standing!
        </p>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          Select the winner to end the game and log the result.
        </p>
      )}

      <div className="winner-select-list">
        {activePlayers.map(p => (
          <button
            key={p.id}
            className="winner-select-btn"
            onClick={() => onEndGame(p.id)}
          >
            <span style={{ fontSize: '1.2rem' }}>🏆</span>
            {p.name}
          </button>
        ))}
      </div>

      <button
        className="btn btn-ghost btn-sm"
        onClick={onResetGame}
        style={{ marginTop: '0.25rem' }}
      >
        Abandon Game
      </button>
    </div>
  );
}

// ── GameView ──────────────────────────────────────────────────────────────────
export default function GameView({
  gameConfig,
  gameState,
  onEliminatePlayer,
  onEndGame,
  onResetGame,
  onToggleTimer,
  onSkipLevel,
  onPrevLevel,
}) {
  const [pendingEliminate, setPendingEliminate] = useState(null);

  const activePlayers    = gameState.players.filter(p => p.status === 'active');
  const eliminatedPlayers = gameState.players
    .filter(p => p.status === 'eliminated')
    .sort((a, b) => a.position - b.position);

  const isOver   = !!gameState.winner;
  const showEnd  = !isOver && activePlayers.length <= 2;

  function handlePlayerClick(player) {
    if (isOver || player.status !== 'active') return;
    if (activePlayers.length <= 1) return;
    setPendingEliminate(player);
  }

  function confirmEliminate() {
    if (!pendingEliminate) return;
    onEliminatePlayer(pendingEliminate.id);
    setPendingEliminate(null);
  }

  // Duration display
  const durationMs  = isOver
    ? (gameState.endTime - gameState.startTime)
    : (Date.now() - gameState.startTime);
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);

  return (
    <div className="game-view">
      {/* Winner banner */}
      {isOver && (
        <div className="winner-banner">
          <div className="winner-crown">🏆</div>
          <h2>{gameState.winner.name} wins!</h2>
          <p>
            Game over · {gameConfig.players.length} players ·{' '}
            {durationMin}m {durationSec}s
          </p>
          <button className="btn btn-primary" onClick={onResetGame}>
            New Game
          </button>
        </div>
      )}

      {/* Blind timer (always visible during game) */}
      {!isOver && (
        <BlindTimer
          gameConfig={gameConfig}
          gameState={gameState}
          onToggleTimer={onToggleTimer}
          onSkipLevel={onSkipLevel}
          onPrevLevel={onPrevLevel}
        />
      )}

      {/* Active players */}
      <div className="card">
        <div className="section-title">
          Players — {activePlayers.length} active, {eliminatedPlayers.length} eliminated
        </div>
        <div className="players-grid">
          {gameState.players.map(player => {
            const isActive   = player.status === 'active';
            const isWinner   = player.status === 'winner';
            const isElim     = player.status === 'eliminated';

            return (
              <div
                key={player.id}
                className={`player-card ${isActive ? 'active' : ''} ${isElim ? 'eliminated' : ''} ${isWinner ? 'winner' : ''}`}
                onClick={() => isActive ? handlePlayerClick(player) : undefined}
                title={isActive && activePlayers.length > 1 ? `Eliminate ${player.name}` : undefined}
              >
                {/* Position badge */}
                {isElim && player.position !== null && (
                  <span className="player-position-badge">{ordinal(player.position)}</span>
                )}
                {isWinner && (
                  <span className="player-position-badge">🥇</span>
                )}

                <div className="player-card-avatar">
                  {isElim ? '✕' : isWinner ? '♛' : player.name[0].toUpperCase()}
                </div>
                <div className="player-card-name">{player.name}</div>
                {isActive && activePlayers.length > 1 && (
                  <div className="player-card-hint">Tap to eliminate</div>
                )}
                {isElim && (
                  <div className="player-card-hint">
                    {player.position !== null ? ordinal(player.position) : 'Eliminated'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* End game section */}
      {showEnd && (
        <EndGameSection
          activePlayers={activePlayers}
          onEndGame={onEndGame}
          onResetGame={onResetGame}
        />
      )}

      {/* Finish up actions when game is over */}
      {isOver && eliminatedPlayers.length > 0 && (
        <div className="card">
          <div className="section-title">Final Standings</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[...gameState.players]
              .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
              .map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  background: p.status === 'winner' ? 'rgba(201,162,39,0.08)' : 'var(--surface2)',
                  borderRadius: '6px',
                  border: p.status === 'winner' ? '1px solid var(--accent-dim)' : '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '0.9rem', minWidth: '36px', color: p.status === 'winner' ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {p.position !== null ? ordinal(p.position) : '—'}
                  </span>
                  <span style={{ fontWeight: p.status === 'winner' ? 700 : 400 }}>
                    {p.name}
                  </span>
                  {p.status === 'winner' && <span>🏆</span>}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Game info footer */}
      {!isOver && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '0.5rem',
          fontSize: '0.8rem', color: 'var(--text-muted)'
        }}>
          <span>
            Duration: {durationMin}m {durationSec}s
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onResetGame}
            style={{ fontSize: '0.75rem' }}
          >
            Abandon Game
          </button>
        </div>
      )}

      {/* Elimination modal */}
      {pendingEliminate && (
        <EliminationModal
          player={pendingEliminate}
          onConfirm={confirmEliminate}
          onCancel={() => setPendingEliminate(null)}
        />
      )}
    </div>
  );
}
