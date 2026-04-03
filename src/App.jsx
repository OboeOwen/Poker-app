import { useState, useEffect, useRef, useCallback } from 'react';
import SetupView from './components/SetupView.jsx';
import GameView from './components/GameView.jsx';
import HandRankingsView from './components/HandRankingsView.jsx';
import HistoryView from './components/HistoryView.jsx';

export const DEFAULT_BLIND_STRUCTURE = [
  { level: 1,  small: 5,    big: 10,   duration: 20 },
  { level: 2,  small: 10,   big: 20,   duration: 20 },
  { level: 3,  small: 15,   big: 30,   duration: 20 },
  { level: 4,  small: 25,   big: 50,   duration: 20 },
  { level: 5,  small: 50,   big: 100,  duration: 15 },
  { level: 6,  small: 75,   big: 150,  duration: 15 },
  { level: 7,  small: 100,  big: 200,  duration: 15 },
  { level: 8,  small: 150,  big: 300,  duration: 15 },
  { level: 9,  small: 200,  big: 400,  duration: 15 },
  { level: 10, small: 300,  big: 600,  duration: 10 },
  { level: 11, small: 400,  big: 800,  duration: 10 },
  { level: 12, small: 600,  big: 1200, duration: 10 },
  { level: 13, small: 1000, big: 2000, duration: 10 },
];

export const DEFAULT_CHIP_DENOMINATIONS = [
  { id: 1, value: 5,    color: '#dde8dd', label: 'White' },
  { id: 2, value: 25,   color: '#e74c3c', label: 'Red'   },
  { id: 3, value: 100,  color: '#27ae60', label: 'Green' },
  { id: 4, value: 500,  color: '#2980b9', label: 'Blue'  },
  { id: 5, value: 1000, color: '#8e44ad', label: 'Purple'},
];

const DEFAULT_CONFIG = {
  players: [],
  chipDenominations: DEFAULT_CHIP_DENOMINATIONS,
  startingStack: 1000,
  buyIn: 10,
  blindStructure: DEFAULT_BLIND_STRUCTURE,
};

function loadHistory() {
  try {
    const saved = localStorage.getItem('poker-app-history');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [view, setView]             = useState('setup');
  const [gameConfig, setGameConfig] = useState(DEFAULT_CONFIG);
  const [gameState, setGameState]   = useState(null);
  const [history, setHistory]       = useState(loadHistory);

  const timerRef          = useRef(null);
  const blindStructureRef = useRef(gameConfig.blindStructure);

  useEffect(() => {
    blindStructureRef.current = gameConfig.blindStructure;
  }, [gameConfig.blindStructure]);

  // Tick down the timer every second when running
  useEffect(() => {
    if (!gameState?.timerRunning) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev?.timerRunning) return prev;

        if (prev.timerSecondsRemaining > 0) {
          return { ...prev, timerSecondsRemaining: prev.timerSecondsRemaining - 1 };
        }

        // Advance to next level
        const structure = blindStructureRef.current;
        const nextLevel = prev.timerLevel + 1;
        if (nextLevel >= structure.length) {
          return { ...prev, timerRunning: false, timerSecondsRemaining: 0 };
        }
        return {
          ...prev,
          timerLevel: nextLevel,
          timerSecondsRemaining: structure[nextLevel].duration * 60,
        };
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState?.timerRunning]);

  const startGame = useCallback(() => {
    if (gameConfig.players.length < 2) return;
    const firstLevel = gameConfig.blindStructure[0];
    setGameState({
      startTime: Date.now(),
      players: gameConfig.players.map(p => ({
        ...p,
        status: 'active',
        position: null,
        eliminatedAt: null,
      })),
      timerLevel: 0,
      timerSecondsRemaining: firstLevel.duration * 60,
      timerRunning: false,
      winner: null,
    });
    setView('game');
  }, [gameConfig]);

  const eliminatePlayer = useCallback((playerId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const totalPlayers   = prev.players.length;
      const eliminated     = prev.players.filter(p => p.status === 'eliminated').length;
      const position       = totalPlayers - eliminated; // e.g. last out = 2nd place

      const updatedPlayers = prev.players.map(p =>
        p.id === playerId
          ? { ...p, status: 'eliminated', position, eliminatedAt: Date.now() }
          : p,
      );

      return { ...prev, players: updatedPlayers };
    });
  }, []);

  const endGame = useCallback((winnerId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const winner = prev.players.find(p => p.id === winnerId);
      const totalPlayers = prev.players.length;

      const updatedPlayers = prev.players.map(p =>
        p.id === winnerId
          ? { ...p, status: 'winner', position: 1 }
          : p,
      );

      const durationMin = Math.round((Date.now() - prev.startTime) / 60000);

      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        winner: winner?.name ?? 'Unknown',
        players: prev.players.map(p => p.name),
        playerCount: totalPlayers,
        durationMin,
        finalLevel: prev.timerLevel + 1,
      };

      setHistory(h => {
        const next = [entry, ...h];
        localStorage.setItem('poker-app-history', JSON.stringify(next));
        return next;
      });

      return {
        ...prev,
        players: updatedPlayers,
        timerRunning: false,
        winner: { id: winner?.id, name: winner?.name },
        endTime: Date.now(),
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    clearInterval(timerRef.current);
    setGameState(null);
    setView('setup');
  }, []);

  const toggleTimer = useCallback(() => {
    setGameState(prev => prev ? { ...prev, timerRunning: !prev.timerRunning } : prev);
  }, []);

  const skipLevel = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const structure = blindStructureRef.current;
      const nextLevel = prev.timerLevel + 1;
      if (nextLevel >= structure.length) return prev;
      return {
        ...prev,
        timerLevel: nextLevel,
        timerSecondsRemaining: structure[nextLevel].duration * 60,
      };
    });
  }, []);

  const prevLevel = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.timerLevel === 0) return prev;
      const structure = blindStructureRef.current;
      const level = prev.timerLevel - 1;
      return {
        ...prev,
        timerLevel: level,
        timerSecondsRemaining: structure[level].duration * 60,
      };
    });
  }, []);

  const isGameActive = !!gameState && !gameState.winner;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="title-icon">♠</span>
          <h1>Poker Manager</h1>
          <span className="title-icon">♥</span>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-btn ${view === 'setup' ? 'active' : ''}`}
            onClick={() => setView('setup')}
          >
            Setup
          </button>
          <button
            className={`nav-btn ${view === 'game' ? 'active' : ''}`}
            onClick={() => setView('game')}
            disabled={!gameState}
          >
            Game {isGameActive && <span className="live-badge">LIVE</span>}
          </button>
          <button
            className={`nav-btn ${view === 'rankings' ? 'active' : ''}`}
            onClick={() => setView('rankings')}
          >
            Hands
          </button>
          <button
            className={`nav-btn ${view === 'history' ? 'active' : ''}`}
            onClick={() => setView('history')}
          >
            History
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === 'setup' && (
          <SetupView
            gameConfig={gameConfig}
            setGameConfig={setGameConfig}
            onStartGame={startGame}
            hasActiveGame={isGameActive}
            onReturnToGame={() => setView('game')}
          />
        )}

        {view === 'game' && gameState && (
          <GameView
            gameConfig={gameConfig}
            gameState={gameState}
            onEliminatePlayer={eliminatePlayer}
            onEndGame={endGame}
            onResetGame={resetGame}
            onToggleTimer={toggleTimer}
            onSkipLevel={skipLevel}
            onPrevLevel={prevLevel}
          />
        )}

        {view === 'rankings' && <HandRankingsView />}

        {view === 'history' && (
          <HistoryView history={history} setHistory={setHistory} />
        )}
      </main>
    </div>
  );
}
