import { useState, useRef } from 'react';
import { DEFAULT_BLIND_STRUCTURE, DEFAULT_CHIP_DENOMINATIONS } from '../App.jsx';

// ── Chip distribution algorithm ───────────────────────────────────────────────
function calculateChipDistribution(startingStack, denominations) {
  const sorted = [...denominations]
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value); // largest first

  if (sorted.length === 0) return [];

  let remaining = startingStack;
  const counts  = new Array(sorted.length).fill(0);

  for (let i = 0; i < sorted.length; i++) {
    if (i === sorted.length - 1) {
      // smallest denom: fill the rest
      counts[i] = Math.max(0, Math.round(remaining / sorted[i].value));
    } else {
      // allocate at most 50% of remaining in this denomination (cap 10 chips)
      const byPct = Math.floor((remaining * 0.5) / sorted[i].value);
      const count = Math.min(byPct, 10);
      counts[i]    = count;
      remaining   -= count * sorted[i].value;
    }
  }

  // return in ascending order for display
  return sorted
    .map((d, i) => ({ ...d, perPlayer: counts[i] }))
    .reverse();
}

// ── Players Tab ───────────────────────────────────────────────────────────────
function PlayersTab({ players, setPlayers }) {
  const [inputName, setInputName] = useState('');
  const inputRef = useRef(null);

  function addPlayer() {
    const name = inputName.trim();
    if (!name) return;
    setPlayers(prev => [...prev, { id: Date.now(), name }]);
    setInputName('');
    inputRef.current?.focus();
  }

  function removePlayer(id) {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function handleKey(e) {
    if (e.key === 'Enter') addPlayer();
  }

  return (
    <div>
      <div className="player-input-row">
        <input
          ref={inputRef}
          className="input"
          placeholder="Player name…"
          value={inputName}
          onChange={e => setInputName(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="btn btn-primary" onClick={addPlayer} disabled={!inputName.trim()}>
          Add
        </button>
      </div>

      {players.length > 0 ? (
        <div className="player-list">
          {players.map((p, idx) => (
            <div key={p.id} className="player-item">
              <div className="player-avatar">{p.name[0].toUpperCase()}</div>
              <span className="player-name">{p.name}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => removePlayer(p.id)}
                title="Remove player"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="player-count-hint">Add at least 2 players to start a game.</p>
      )}

      {players.length > 0 && (
        <p className="player-count-hint">{players.length} player{players.length !== 1 ? 's' : ''} added</p>
      )}
    </div>
  );
}

// ── Chips Tab ─────────────────────────────────────────────────────────────────
function ChipsTab({ gameConfig, setGameConfig }) {
  const { chipDenominations, startingStack, buyIn, players } = gameConfig;

  function updateDenom(id, field, value) {
    setGameConfig(prev => ({
      ...prev,
      chipDenominations: prev.chipDenominations.map(d =>
        d.id === id ? { ...d, [field]: field === 'value' ? Number(value) || 0 : value } : d,
      ),
    }));
  }

  function addDenom() {
    const newId = Date.now();
    setGameConfig(prev => ({
      ...prev,
      chipDenominations: [
        ...prev.chipDenominations,
        { id: newId, value: 0, color: '#888888', label: 'New' },
      ],
    }));
  }

  function removeDenom(id) {
    setGameConfig(prev => ({
      ...prev,
      chipDenominations: prev.chipDenominations.filter(d => d.id !== id),
    }));
  }

  const distribution = calculateChipDistribution(startingStack, chipDenominations);
  const totalPerPlayer = distribution.reduce((s, d) => s + d.perPlayer, 0);
  const totalChips     = totalPerPlayer * Math.max(players.length, 1);
  const totalValue     = distribution.reduce((s, d) => s + d.perPlayer * d.value, 0);

  return (
    <div className="chips-config">
      {/* Stack size & buy-in */}
      <div>
        <div className="section-title">Starting Stack &amp; Buy-in</div>
        <div className="stack-input-row">
          <label>Starting stack (chips)</label>
          <input
            className="input"
            type="number"
            min="100"
            step="100"
            value={startingStack}
            onChange={e =>
              setGameConfig(prev => ({ ...prev, startingStack: Number(e.target.value) || 1000 }))
            }
          />
        </div>
        <div className="stack-input-row" style={{ marginTop: '0.5rem' }}>
          <label>Buy-in (£ / $)</label>
          <input
            className="input"
            type="number"
            min="1"
            value={buyIn}
            onChange={e =>
              setGameConfig(prev => ({ ...prev, buyIn: Number(e.target.value) || 10 }))
            }
          />
        </div>
      </div>

      {/* Denominations */}
      <div>
        <div className="section-title">Chip Denominations</div>
        <div className="denomination-list">
          {chipDenominations.map(d => (
            <div key={d.id} className="denomination-row">
              {/* Color picker */}
              <div className="chip-color-preview" style={{ background: d.color }}>
                <input
                  className="chip-color-input"
                  type="color"
                  value={d.color}
                  onChange={e => updateDenom(d.id, 'color', e.target.value)}
                  title="Pick chip colour"
                />
              </div>

              {/* Label */}
              <input
                className="input denom-label-input"
                placeholder="Label"
                value={d.label}
                onChange={e => updateDenom(d.id, 'label', e.target.value)}
              />

              {/* Value */}
              <input
                className="input denom-value-input"
                type="number"
                min="1"
                placeholder="Value"
                value={d.value}
                onChange={e => updateDenom(d.id, 'value', e.target.value)}
              />

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => removeDenom(d.id)}
                title="Remove denomination"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={addDenom}>+ Add Denomination</button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() =>
              setGameConfig(prev => ({ ...prev, chipDenominations: DEFAULT_CHIP_DENOMINATIONS }))
            }
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      {/* Chip distribution preview */}
      {distribution.length > 0 && (
        <div className="chip-distribution">
          <div className="chip-dist-title">Suggested Distribution per Player</div>
          <div className="chip-dist-grid">
            {distribution.map(d => (
              <div key={d.id} className="chip-dist-item">
                <div
                  className="chip-circle"
                  style={{ background: d.color }}
                >
                  {d.value >= 1000 ? `${d.value / 1000}k` : d.value}
                </div>
                <span className="chip-dist-count">× {d.perPlayer}</span>
                <span className="chip-dist-label">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="chip-dist-total">
            <span>Chips per player: <strong>{totalPerPlayer}</strong></span>
            <span>Stack value: <strong>{totalValue.toLocaleString()}</strong></span>
            {players.length > 0 && (
              <span>Total chips needed: <strong>{totalChips}</strong></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Blinds Tab ────────────────────────────────────────────────────────────────
function BlindsTab({ gameConfig, setGameConfig }) {
  const { blindStructure } = gameConfig;

  function updateLevel(idx, field, value) {
    setGameConfig(prev => ({
      ...prev,
      blindStructure: prev.blindStructure.map((lvl, i) =>
        i === idx ? { ...lvl, [field]: Number(value) || 0 } : lvl,
      ),
    }));
  }

  function addLevel() {
    const last = blindStructure[blindStructure.length - 1];
    setGameConfig(prev => ({
      ...prev,
      blindStructure: [
        ...prev.blindStructure,
        {
          level:    prev.blindStructure.length + 1,
          small:    last ? last.small * 2 : 5,
          big:      last ? last.big   * 2 : 10,
          duration: last ? last.duration   : 15,
        },
      ],
    }));
  }

  function removeLevel(idx) {
    if (blindStructure.length <= 1) return;
    setGameConfig(prev => ({
      ...prev,
      blindStructure: prev.blindStructure
        .filter((_, i) => i !== idx)
        .map((lvl, i) => ({ ...lvl, level: i + 1 })),
    }));
  }

  function applyDurationToAll(duration) {
    setGameConfig(prev => ({
      ...prev,
      blindStructure: prev.blindStructure.map(lvl => ({ ...lvl, duration })),
    }));
  }

  return (
    <div className="blinds-config">
      <div className="blinds-duration-row">
        <label>Set all levels to</label>
        <input
          className="input"
          type="number"
          min="1"
          defaultValue={20}
          style={{ maxWidth: '80px' }}
          onBlur={e => {
            const v = Number(e.target.value);
            if (v > 0) applyDurationToAll(v);
          }}
        />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>minutes</span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setGameConfig(prev => ({ ...prev, blindStructure: DEFAULT_BLIND_STRUCTURE }))}
        >
          Reset
        </button>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="blinds-table">
          <thead>
            <tr>
              <th>Lvl</th>
              <th>Small Blind</th>
              <th>Big Blind</th>
              <th>Duration (min)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {blindStructure.map((lvl, idx) => (
              <tr key={idx}>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{lvl.level}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={lvl.small}
                    onChange={e => updateLevel(idx, 'small', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={lvl.big}
                    onChange={e => updateLevel(idx, 'big', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={lvl.duration}
                    onChange={e => updateLevel(idx, 'duration', e.target.value)}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => removeLevel(idx)}
                    disabled={blindStructure.length <= 1}
                    title="Remove level"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="blinds-add-btn">
        <button className="btn btn-ghost btn-sm" onClick={addLevel}>+ Add Level</button>
      </div>
    </div>
  );
}

// ── SetupView ─────────────────────────────────────────────────────────────────
export default function SetupView({
  gameConfig,
  setGameConfig,
  onStartGame,
  hasActiveGame,
  onReturnToGame,
}) {
  const [activeTab, setActiveTab] = useState('players');

  function setPlayers(updater) {
    setGameConfig(prev => ({
      ...prev,
      players: typeof updater === 'function' ? updater(prev.players) : updater,
    }));
  }

  const canStart = gameConfig.players.length >= 2;

  return (
    <div className="setup-view">
      {hasActiveGame && (
        <div className="active-game-banner">
          <span>⚠ Game in progress</span>
          <button className="btn btn-danger btn-sm" onClick={onReturnToGame}>
            Return to Game
          </button>
        </div>
      )}

      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          Players
        </button>
        <button
          className={`tab-btn ${activeTab === 'chips' ? 'active' : ''}`}
          onClick={() => setActiveTab('chips')}
        >
          Chips
        </button>
        <button
          className={`tab-btn ${activeTab === 'blinds' ? 'active' : ''}`}
          onClick={() => setActiveTab('blinds')}
        >
          Blinds
        </button>
      </div>

      <div className="card">
        {activeTab === 'players' && (
          <PlayersTab
            players={gameConfig.players}
            setPlayers={setPlayers}
          />
        )}
        {activeTab === 'chips' && (
          <ChipsTab
            gameConfig={gameConfig}
            setGameConfig={setGameConfig}
          />
        )}
        {activeTab === 'blinds' && (
          <BlindsTab
            gameConfig={gameConfig}
            setGameConfig={setGameConfig}
          />
        )}
      </div>

      <div className="start-game-section">
        <div className="start-game-info">
          {canStart
            ? <>Ready to start with <strong>{gameConfig.players.length} players</strong> — buy-in <strong>£{gameConfig.buyIn}</strong></>
            : <>Add at least <strong>2 players</strong> to start</>}
        </div>
        <button
          className="btn btn-primary btn-lg"
          disabled={!canStart}
          onClick={onStartGame}
        >
          ♠ Start Game
        </button>
      </div>
    </div>
  );
}
