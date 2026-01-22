
import React, { useState, useEffect, useCallback } from 'react';
import { THEMES, DIFFICULTY_CONFIG } from './constants';
import { Tile, GameStatus, Difficulty, GameSettings } from './types';
import { generatePuzzleImage, getPuzzleNarrative } from './services/geminiService';
import { TileComponent } from './components/TileComponent';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [settings, setSettings] = useState<GameSettings>({
    gridSize: 4,
    theme: THEMES[0].id,
    difficulty: 'medium'
  });
  const [imageUrl, setImageUrl] = useState<string>('');
  const [narrative, setNarrative] = useState<string>('');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (status === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const initPuzzle = (size: number) => {
    const totalTiles = size * size;
    const initialTiles: Tile[] = Array.from({ length: totalTiles }, (_, i) => ({
      id: i,
      currentPos: i,
      correctPos: i,
      isEmpty: i === totalTiles - 1
    }));
    return initialTiles;
  };

  const shufflePuzzle = (initialTiles: Tile[], size: number) => {
    let shuffled = [...initialTiles];
    // To ensure solvability, we perform random valid moves from the solved state
    const iterations = size * size * 20;
    let emptyIdx = shuffled.length - 1;

    for (let i = 0; i < iterations; i++) {
      const neighbors: number[] = [];
      const row = Math.floor(emptyIdx / size);
      const col = emptyIdx % size;

      if (row > 0) neighbors.push(emptyIdx - size);
      if (row < size - 1) neighbors.push(emptyIdx + size);
      if (col > 0) neighbors.push(emptyIdx - 1);
      if (col < size - 1) neighbors.push(emptyIdx + 1);

      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Swap
      const temp = shuffled[emptyIdx];
      shuffled[emptyIdx] = shuffled[randomNeighbor];
      shuffled[randomNeighbor] = temp;

      // Update positions
      shuffled[emptyIdx].currentPos = emptyIdx;
      shuffled[randomNeighbor].currentPos = randomNeighbor;

      emptyIdx = randomNeighbor;
    }
    return shuffled;
  };

  const startGame = async () => {
    setStatus('generating');
    setMoves(0);
    setTime(0);

    const themeObj = THEMES.find(t => t.id === settings.theme) || THEMES[0];
    
    try {
      const [img, text] = await Promise.all([
        generatePuzzleImage(themeObj.promptPrefix),
        getPuzzleNarrative(themeObj.label)
      ]);
      
      setImageUrl(img);
      setNarrative(text);
      
      const initial = initPuzzle(settings.gridSize);
      const shuffled = shufflePuzzle(initial, settings.gridSize);
      
      setTiles(shuffled);
      setStatus('playing');
    } catch (error) {
      console.error("Failed to start game", error);
      setStatus('idle');
    }
  };

  const handleTileClick = (clickedPos: number) => {
    if (status !== 'playing') return;

    const size = settings.gridSize;
    const emptyTile = tiles.find(t => t.isEmpty);
    if (!emptyTile) return;

    const emptyPos = emptyTile.currentPos;
    
    // Check if neighbor
    const rowClicked = Math.floor(clickedPos / size);
    const colClicked = clickedPos % size;
    const rowEmpty = Math.floor(emptyPos / size);
    const colEmpty = emptyPos % size;

    const isNeighbor = Math.abs(rowClicked - rowEmpty) + Math.abs(colClicked - colEmpty) === 1;

    if (isNeighbor) {
      const newTiles = [...tiles];
      const clickedTileIdx = newTiles.findIndex(t => t.currentPos === clickedPos);
      const emptyTileIdx = newTiles.findIndex(t => t.currentPos === emptyPos);

      // Swap positions in data
      newTiles[clickedTileIdx].currentPos = emptyPos;
      newTiles[emptyTileIdx].currentPos = clickedPos;

      // Sort by current position for easier rendering if needed, or just set
      setTiles(newTiles);
      setMoves(prev => prev + 1);

      // Check win condition
      const isSolved = newTiles.every(t => t.currentPos === t.correctPos);
      if (isSolved) {
        setStatus('solved');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navbar */}
      <nav className="p-6 glass border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-orbitron font-bold tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              GEMINI FLUX
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold uppercase tracking-widest text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">How to Play</span>
            <span className="hover:text-white cursor-pointer transition-colors">Achievements</span>
            <button 
              onClick={() => setStatus('idle')}
              className="px-5 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-all"
            >
              Reset All
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass rounded-3xl p-6 space-y-8">
            <section>
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Select Realm</h2>
              <div className="grid grid-cols-1 gap-3">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSettings(s => ({ ...s, theme: theme.id }))}
                    className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                      settings.theme === theme.id 
                        ? 'border-indigo-500 bg-indigo-500/10' 
                        : 'border-white/5 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <span className={`font-semibold ${settings.theme === theme.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {theme.label}
                    </span>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-br ${theme.color} ${settings.theme === theme.id ? 'scale-125 shadow-[0_0_12px_rgba(99,102,241,0.5)]' : 'opacity-40'}`} />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Complexity</h2>
              <div className="flex gap-2">
                {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, any][]).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSettings(s => ({ ...s, difficulty: key, gridSize: config.size }))}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${
                      settings.difficulty === key
                        ? 'bg-white text-slate-950 border-white'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {config.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </section>

            <button
              onClick={startGame}
              disabled={status === 'generating'}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold font-orbitron shadow-2xl shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
            >
              <span className="relative z-10">{status === 'generating' ? 'MANIFESTING REALM...' : 'START PUZZLE'}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
          </div>

          {/* Stats Display */}
          {(status === 'playing' || status === 'solved') && (
            <div className="glass rounded-3xl p-6 grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Moves</p>
                <p className="text-2xl font-orbitron font-bold text-white">{moves}</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Time</p>
                <p className="text-2xl font-orbitron font-bold text-white">{formatTime(time)}</p>
              </div>
            </div>
          )}
        </aside>

        {/* Puzzle Board Area */}
        <section className="lg:col-span-8">
          {status === 'idle' && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 glass rounded-[3rem] p-12">
              <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 relative">
                <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-orbitron font-bold text-white mb-2">Ready to Forge?</h3>
                <p className="text-slate-400 max-w-xs mx-auto">Pick a realm and difficulty to begin your journey through the fractured dimensions.</p>
              </div>
            </div>
          )}

          {status === 'generating' && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 glass rounded-[3rem] p-12 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 animate-pulse" />
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin-slow" />
                </div>
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-xl font-orbitron font-bold text-white animate-pulse">Consulting the Oracle...</h3>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">AI Processing</span>
                  <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }} />
                  </div>
                </div>
                <p className="text-slate-400 italic text-sm">"Imagining the impossible shapes of {THEMES.find(t => t.id === settings.theme)?.label}..."</p>
              </div>
            </div>
          )}

          {(status === 'playing' || status === 'solved') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
                  <p className="text-xs italic text-slate-300">"{narrative}"</p>
                </div>
                {status === 'solved' && (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 font-bold font-orbitron text-sm">REALM RESTORED</span>
                  </div>
                )}
              </div>

              <div className="glass rounded-[3rem] p-4 md:p-8">
                <div 
                  className="grid gap-2 md:gap-3 mx-auto aspect-square relative" 
                  style={{ 
                    gridTemplateColumns: `repeat(${settings.gridSize}, minmax(0, 1fr))`,
                    maxWidth: '600px'
                  }}
                >
                  {/* Create ordered list of positions to map to correct tiles */}
                  {Array.from({ length: settings.gridSize * settings.gridSize }).map((_, pos) => {
                    const tile = tiles.find(t => t.currentPos === pos);
                    return tile ? (
                      <TileComponent 
                        key={tile.id}
                        tile={tile}
                        gridSize={settings.gridSize}
                        imageUrl={imageUrl}
                        onClick={handleTileClick}
                        disabled={status === 'solved'}
                      />
                    ) : null;
                  })}

                  {/* Solved Overlay */}
                  {status === 'solved' && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center p-8 bg-slate-950/40 backdrop-blur-sm rounded-xl">
                      <div className="glass p-12 rounded-[2rem] text-center space-y-6 border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-3xl font-orbitron font-bold text-white">Victory!</h2>
                          <p className="text-slate-400 mt-2">The realm is whole again. You finished in {formatTime(time)} with {moves} moves.</p>
                        </div>
                        <button
                          onClick={startGame}
                          className="px-8 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                          Forge New Realm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Original Preview Button (Hint) */}
              <div className="flex justify-center">
                <button 
                  className="text-xs font-bold text-slate-500 hover:text-slate-300 flex items-center gap-2 group transition-colors"
                  onMouseDown={() => { /* Could show full image temporarily */ }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  HOLD TO PREVIEW
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-white/5 text-center text-sm text-slate-500">
        <p>Built with Gemini AI &bull; Powered by Google Generative AI</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default App;
