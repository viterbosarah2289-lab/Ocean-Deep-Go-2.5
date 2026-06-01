/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { TURTLE_LIST, BOARD_PATH, SURPRISE_CARDS, Turtle, BoardSpace } from '../types';
import { TurtleSvg } from './TurtleSvg';
import { audio } from '../utils/audio';
import { 
  Trophy, Sparkles, AlertCircle, HelpCircle, ArrowRight, Shield, Play, 
  RotateCcw, Compass, Volume2, VolumeX, History, Zap, CheckCircle2 
} from 'lucide-react';

interface Level2BoardGameProps {
  onComplete: (score: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

interface PlayerState {
  turtle: Turtle;
  position: number;
  isBot: boolean;
  colorClass: string;
  skipNextTurn?: boolean;
}

interface LogEntry {
  id: string;
  message: string;
  type: 'info' | 'roll' | 'treasure' | 'obstacle' | 'surprise' | 'victory';
}

export const Level2BoardGame: React.FC<Level2BoardGameProps> = ({ onComplete, onPrev, onNext }) => {
  const [selectedTurtleId, setSelectedTurtleId] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number>(0);
  const [diceVal, setDiceVal] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [drawnCard, setDrawnCard] = useState<{ title: string; description: string; applied: boolean } | null>(null);
  const [winner, setWinner] = useState<Turtle | null>(null);
  const [muted, setMuted] = useState<boolean>(!audio.isEnabled());
  const [autoPlayBots, setAutoPlayBots] = useState<boolean>(true);
  const [botSpeed, setBotSpeed] = useState<'normal' | 'fast' | 'instant'>('fast');
  const [score, setScore] = useState<number>(150); // Base level score

  const botTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Toggle sound
  const toggleMuted = () => {
    const isNowMuted = !audio.toggle();
    setMuted(isNowMuted);
  };

  // Setup game
  const chooseTurtle = (turtle: Turtle) => {
    audio.playClick();
    setSelectedTurtleId(turtle.id);

    const initialPlayers: PlayerState[] = TURTLE_LIST.map((t) => ({
      turtle: t,
      position: 0,
      isBot: t.id !== turtle.id,
      colorClass: t.color
    }));

    setPlayers(initialPlayers);
    setSelectedTurtleId(turtle.id);
  };

  const startGame = () => {
    if (!selectedTurtleId) return;
    audio.playSuccess();
    setGameStarted(true);
    setLogs([
      { id: 'start', message: '🏆 Let the Great Deep Ocean Derby begin! Turtles take your marks!', type: 'info' }
    ]);
    setWinner(null);
    setCurrentPlayerIdx(0);
  };

  // Auto Scroll Chat Log
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle Turn logic for CPU and Human
  useEffect(() => {
    if (!gameStarted || winner) return;

    const activePlayer = players[currentPlayerIdx];
    if (activePlayer && activePlayer.isBot && autoPlayBots) {
      const msDelay = botSpeed === 'normal' ? 1800 : botSpeed === 'fast' ? 900 : 150;
      botTimerRef.current = setTimeout(() => {
        cpuRollAndMove();
      }, msDelay);
    }

    return () => {
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };
  }, [gameStarted, currentPlayerIdx, players, winner, autoPlayBots, botSpeed]);

  const addLog = (message: string, type: LogEntry['type']) => {
    setLogs((prev) => [...prev, { id: Date.now().toString() + Math.random(), message, type }]);
  };

  // Roll helper
  const handleRollDice = async () => {
    if (isRolling || winner) return;
    const activePlayer = players[currentPlayerIdx];
    if (activePlayer.isBot) return; // Wait matching CPU turn

    setIsRolling(true);
    audio.playDice();

    // Roll animation
    let tempVal = 1;
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 60));
      tempVal = Math.floor(Math.random() * 6) + 1;
      setDiceVal(tempVal);
    }

    const rollResult = Math.floor(Math.random() * 6) + 1;
    setDiceVal(rollResult);
    setIsRolling(false);

    movePlayer(currentPlayerIdx, rollResult);
  };

  // CPU Automated Roll
  const cpuRollAndMove = () => {
    if (winner) return;
    const activePlayer = players[currentPlayerIdx];
    if (!activePlayer || !activePlayer.isBot) return;

    if (activePlayer.skipNextTurn) {
      addLog(`💤 Turtle ${activePlayer.turtle.name} skips their turn due to seaweed entanglement.`, 'info');
      // Clear skip
      setPlayers((prev) => 
        prev.map((p, idx) => idx === currentPlayerIdx ? { ...p, skipNextTurn: false } : p)
      );
      nextTurn();
      return;
    }

    audio.playDice();
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceVal(roll);
    movePlayer(currentPlayerIdx, roll);
  };

  // Main Movement and rules resolver
  const movePlayer = (playerIdx: number, steps: number) => {
    setPlayers((prev) => {
      const updated = [...prev];
      const p = { ...updated[playerIdx] };
      const oldPos = p.position;
      let newPos = oldPos + steps;

      if (newPos >= BOARD_PATH.length - 1) {
        newPos = BOARD_PATH.length - 1; // Finish Space 17
      }

      p.position = newPos;
      updated[playerIdx] = p;

      // Log movement step
      addLog(`🎲 ${p.turtle.name} rolled a ${steps}! Crawls from space ${oldPos === 0 ? 'START' : oldPos} to ${newPos === BOARD_PATH.length - 1 ? 'FINISH' : newPos}`, 'roll');

      // Resolve space characteristics
      const space = BOARD_PATH[newPos];
      setTimeout(() => {
        resolveSpaceEffect(playerIdx, newPos, space);
      }, botSpeed === 'instant' ? 50 : 600);

      return updated;
    });
  };

  const resolveSpaceEffect = (playerIdx: number, pos: number, space: BoardSpace) => {
    if (pos === BOARD_PATH.length - 1) {
      executeVictory(players[playerIdx].turtle);
      return;
    }

    if (space.type === 'treasure') {
      audio.playSuccess();
      const advancedPos = Math.min(pos + 2, BOARD_PATH.length - 1);
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === playerIdx ? { ...p, position: advancedPos } : p))
      );
      addLog(`🌟 TREASURE DISCOVERY! ${players[playerIdx].turtle.name} finds a sunken chest. Swiftly advances 2 spaces to ${advancedPos}!`, 'treasure');

      if (advancedPos === BOARD_PATH.length - 1) {
        setTimeout(() => executeVictory(players[playerIdx].turtle), 400);
      } else {
        nextTurn();
      }
    } else if (space.type === 'obstacle') {
      audio.playDefeat();
      const backupPos = Math.max(pos - 2, 0);
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === playerIdx ? { ...p, position: backupPos } : p))
      );
      addLog(`⚠️ ANCHOR HIT! ${players[playerIdx].turtle.name} gets hit by standard ship anchor debris. Stumbles back 2 spaces to ${backupPos}.`, 'obstacle');
      nextTurn();
    } else if (space.type === 'surprise') {
      triggerSurpriseCard(playerIdx, pos);
    } else {
      // Safe space
      nextTurn();
    }
  };

  // Surprise Deck Drawer
  const triggerSurpriseCard = (playerIdx: number, pos: number) => {
    audio.playSwoosh();
    // Choose a surprise card
    const randomIdx = Math.floor(Math.random() * SURPRISE_CARDS.length);
    const card = SURPRISE_CARDS[randomIdx];

    setDrawnCard({
      title: card.title,
      description: card.description,
      applied: false
    });

    // Execute effect action
    let targetPos = pos;
    let nextStepMessage = '';
    let skipsTurn = false;
    let repeatsRoll = false;

    if (randomIdx === 0) {
      // Advance 3
      targetPos = Math.min(pos + 3, BOARD_PATH.length - 1);
      nextStepMessage = `Slides forward 3 spaces into space ${targetPos}!`;
    } else if (randomIdx === 1) {
      // Lose 1 turn
      skipsTurn = true;
      nextStepMessage = `Becomes entangled in thick seaweed. Must skip their next turn!`;
    } else if (randomIdx === 2) {
      // Roll again
      repeatsRoll = true;
      nextStepMessage = `Receives high waves boost. Ready to roll again immediately!`;
    } else if (randomIdx === 3) {
      // Advance 2
      targetPos = Math.min(pos + 2, BOARD_PATH.length - 1);
      nextStepMessage = `Whale draft pulls shell forward 2 spaces to ${targetPos}!`;
    } else if (randomIdx === 4) {
      // Swap places with person behind
      // Find person behind with highest position less than target
      let swappablePlayerIdx = -1;
      let closestBehindPos = -1;
      players.forEach((p, idx) => {
        if (idx !== playerIdx && p.position < pos && p.position > closestBehindPos) {
          closestBehindPos = p.position;
          swappablePlayerIdx = idx;
        }
      });

      if (swappablePlayerIdx !== -1) {
        const swappee = players[swappablePlayerIdx];
        setPlayers((prev) => {
          const updated = [...prev];
          updated[playerIdx].position = swappee.position;
          updated[swappablePlayerIdx].position = pos;
          return updated;
        });
        nextStepMessage = `Swaps places with ${swappee.turtle.name}! ${players[playerIdx].turtle.name} moves to ${swappee.position} and ${swappee.turtle.name} moves to ${pos}!`;
      } else {
        targetPos = Math.min(pos + 1, BOARD_PATH.length - 1);
        nextStepMessage = `No player behind to shell-swap! Pushed forward 1 space to ${targetPos} instead.`;
      }
    } else if (randomIdx === 5) {
      // Retreat 2
      targetPos = Math.max(pos - 2, 0);
      nextStepMessage = `Passing submarine wake slips you back 2 spaces to ${targetPos}.`;
    } else if (randomIdx === 6) {
      // Retreat 1
      targetPos = Math.max(pos - 1, 0);
      nextStepMessage = `Squeezes in defense shell. Glides back 1 space to ${targetPos}.`;
    }

    addLog(`🔮 SURPRISE CARD drawn by ${players[playerIdx].turtle.name}: "${card.title}" - ${card.description}`, 'surprise');

    // Wait and apply
    setTimeout(() => {
      setPlayers((prev) => {
        const u = [...prev];
        const p = { ...u[playerIdx] };
        p.position = targetPos;
        if (skipsTurn) p.skipNextTurn = true;
        u[playerIdx] = p;
        return u;
      });

      addLog(`✨ Card effect applied: ${nextStepMessage}`, 'surprise');
      setDrawnCard(null);

      if (targetPos === BOARD_PATH.length - 1) {
        executeVictory(players[playerIdx].turtle);
      } else if (repeatsRoll && !players[playerIdx].isBot) {
        // Human rolls again: do not advance player index
        addLog(`⚡ Roll again active! Go ahead.`, 'info');
      } else {
        nextTurn();
      }
    }, botSpeed === 'instant' ? 100 : 3500);
  };

  const nextTurn = () => {
    setCurrentPlayerIdx((prev) => (prev + 1) % players.length);
  };

  const executeVictory = (winnerTurtle: Turtle) => {
    audio.playSuccess();
    setWinner(winnerTurtle);
    addLog(`👑 CONGRATULATIONS! ${winnerTurtle.name} has crossed the FINISH LINE first and is crowned Ocean Deep Champion!`, 'victory');
    
    // Calculate final score
    if (winnerTurtle.id === selectedTurtleId) {
      setScore((prev) => prev + 150);
    } else {
      setScore((prev) => Math.max(prev - 50, 50));
    }
  };

  const resetDerby = () => {
    audio.playClick();
    setSelectedTurtleId(null);
    setGameStarted(false);
    setWinner(null);
    setLogs([]);
  };

  return (
    <div className="relative min-h-[600px] w-full bg-[#001219] rounded-2xl border-2 border-[#0a9396] p-6 flex flex-col justify-between overflow-hidden shadow-2xl text-slate-100" id="l2-board-root">
      
      {/* Top flow lines */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0a9396] via-[#94d2bd] to-[#52b788]" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#0a9396]/40 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#0a9396]/20 text-[#94d2bd] rounded-xl border border-[#0a9396]/40">
            <Compass className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <span className="text-xs text-[#001219] bg-[#0a9396] px-2.5 py-0.5 rounded font-mono font-black tracking-wider uppercase block w-fit mb-1">LEVEL 2 - NOAM</span>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 uppercase italic">
              Turtle Adventure Board Game <Sparkles className="w-4 h-4 text-amber-305 text-[#94d2bd]" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={toggleMuted}
            className="p-2 hover:bg-slate-800/80 rounded-lg border border-slate-700/50 text-slate-300 transition-colors cursor-pointer"
            title="Toggle Mute"
            id="l2-sound-btn"
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-[#52b788]" />}
          </button>
          
          <div className="px-4 py-1.5 rounded-lg bg-teal-950/40 border border-[#0a9396]/50 font-mono text-sm">
            <span className="text-[#94d2bd] font-extrabold text-base">{score}</span> <span className="text-slate-400 text-xs">PTS</span>
          </div>
        </div>
      </div>

      {/* Choice Screen */}
      {!gameStarted && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 z-10" id="selection-screen">
          <div className="text-center max-w-lg mb-4">
            <h2 className="text-lg font-bold text-slate-100">MEET THE 4 TURTLES</h2>
            <p className="text-sm text-cyan-200 mt-1">Select your champion turtle. Competitors Shelly, Turbo, Coral, and Wave are preparing for the deep-water race track!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl px-4">
            {TURTLE_LIST.map((turtle) => {
              const isSelected = selectedTurtleId === turtle.id;
              return (
                <button
                  type="button"
                  key={turtle.id}
                  onClick={() => chooseTurtle(turtle)}
                  className={`relative flex flex-col items-center p-4 bg-slate-900/90 rounded-2xl border transition-all duration-300 text-center ${
                    isSelected 
                      ? 'border-cyan-400 bg-cyan-950/20 scale-105 shadow-[0_0_20px_rgba(34,211,238,0.25)]' 
                      : 'border-indigo-900/60 hover:border-cyan-500'
                  }`}
                  id={`choose-turtle-${turtle.id}`}
                >
                  <div className="w-20 h-20 mb-3 flex items-center justify-center">
                    <TurtleSvg id={turtle.id} animate={true} />
                  </div>
                  <h3 className="text-md font-bold text-white">{turtle.name}</h3>
                  <span className="text-xs text-cyan-400 font-mono italic mt-0.5">{turtle.character}</span>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{turtle.description}</p>
                  
                  {/* Stats bars */}
                  <div className="w-full mt-3 space-y-1.5 border-t border-indigo-950 pt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Speed</span>
                      <span className="font-mono font-bold text-cyan-400">{turtle.statSpeed}/5</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${(turtle.statSpeed / 5) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Obstacle Shield</span>
                      <span className="font-mono font-bold text-emerald-400">{turtle.statDefense}/5</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${(turtle.statDefense / 5) * 100}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={startGame}
            disabled={!selectedTurtleId}
            className={`mt-6 px-10 py-3.5 text-md font-bold tracking-wider uppercase rounded-xl transition-all shadow-lg active:scale-95 ${
              selectedTurtleId 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 cursor-pointer border border-cyan-200' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
            id="start-derby-btn"
          >
            Start Derby Race!
          </button>
        </div>
      )}

      {/* Active Boardgame Area */}
      {gameStarted && (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 w-full h-full z-10" id="derby-arena">
          
          {/* Deck Drawer Overlay (Surprise) */}
          {drawnCard && (
            <div className="absolute inset-x-0 top-1/4 mx-auto w-11/12 max-w-sm bg-indigo-950/95 border-2 border-fuchsia-500 rounded-2xl p-5 shadow-[0_0_35px_rgba(232,121,249,0.35)] text-center animate-bounce z-50">
              <span className="inline-block px-3 py-1 bg-fuchsia-600/30 text-fuchsia-400 border border-fuchsia-400/30 rounded-full font-mono text-[10px] tracking-widest font-extrabold uppercase mb-2">SURPRISE CARD</span>
              <h3 className="text-lg font-black text-white">{drawnCard.title}</h3>
              <p className="text-slate-300 text-xs mt-2 leading-relaxed italic">{drawnCard.description}</p>
              <div className="flex items-center justify-center mt-4">
                <div className="animate-ping w-4 h-4 rounded-full bg-fuchsia-500" />
              </div>
            </div>
          )}

          {/* Left Column: Board Path Visual */}
          <div className="flex-1 bg-slate-950/80 rounded-2xl border border-indigo-900/30 p-4 relative overflow-x-auto min-h-[380px] flex items-center justify-center">
            
            <div className="relative min-w-[920px] h-[400px]" id="serpentineboard-scroller">
              
              {/* Draw Connector wave wires */}
              <svg className="absolute inset-0 w-full h-full opacity-35" pointerEvents="none">
                <path 
                  d="M 50,55 L 830,55 Q 860,110 830,195 L 180,195 Q 150,250 180,335 L 730,335" 
                  fill="none" 
                  stroke="url(#oceanGrad)" 
                  strokeWidth="8" 
                  strokeLinecap="round" 
                  strokeDasharray="12 8" 
                />
                <defs>
                  <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Draw Spaces */}
              {BOARD_PATH.map((space) => {
                const isStart = space.type === 'start';
                const isFinish = space.type === 'finish';
                const isTreasure = space.type === 'treasure';
                const isObstacle = space.type === 'obstacle';
                const isSurprise = space.type === 'surprise';

                // Find occupied turtles
                const occupyingTurtles = players.filter((player) => player.position === space.id);

                let tileBg = 'bg-slate-900 border-indigo-950 hover:border-cyan-400';
                let decoratorIcon = null;

                if (isStart) tileBg = 'bg-emerald-950/90 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
                else if (isFinish) tileBg = 'bg-yellow-950/90 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse';
                else if (isTreasure) tileBg = 'bg-amber-950/70 border-amber-600 text-amber-300';
                else if (isObstacle) tileBg = 'bg-rose-950/80 border-rose-600 text-rose-300';
                else if (isSurprise) tileBg = 'bg-purple-950/80 border-purple-600 text-purple-300';

                return (
                  <div
                    key={space.id}
                    className={`absolute w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-between p-1.5 transition-all duration-300 ${tileBg}`}
                    style={{ left: `${space.x}px`, top: `${space.y}px` }}
                    id={`board-space-tile-${space.id}`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[9px] font-mono font-bold opacity-75">
                        {isStart ? 'START' : isFinish ? '🏆' : `S${space.id}`}
                      </span>

                      {/* Landmarks */}
                      {isTreasure && <span className="text-xs">💎 Treasure</span>}
                      {isObstacle && <span className="text-xs">⚠️ Anchor</span>}
                      {isSurprise && <span className="text-xs">🔮 Card</span>}
                    </div>

                    {/* Token Holders */}
                    <div className="flex-1 flex flex-wrap items-center justify-center gap-1 w-full p-1">
                      {occupyingTurtles.map((p) => (
                        <div 
                          key={p.turtle.id} 
                          title={p.turtle.name} 
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-950/90 border-2 border-white scale-100 hover:scale-135 transition-transform"
                          id={`token-${p.turtle.id}-pos-${space.id}`}
                        >
                          <TurtleSvg id={p.turtle.id} animate={true} className="w-8 h-8" />
                        </div>
                      ))}
                    </div>

                    {/* Footer label details */}
                    <span className="text-[10px] font-bold tracking-tight text-center truncate w-full text-slate-300">
                      {isStart ? 'Ocean Start' : isFinish ? 'FINISH LINE' : space.type === 'safe' ? 'Safe Currents' : space.type.toUpperCase()}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Right Column: Dice Controls and Scoreboard Logs */}
          <div className="w-full lg:w-80 flex flex-col justify-between gap-4">
            
            {/* Scoreboard Ticker */}
            <div className="bg-slate-900/90 rounded-2xl border border-indigo-900/30 p-4 flex flex-col justify-between">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-widest text-cyan-400 mb-2.5 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-cyan-400" /> Current Leaderboard
              </h3>
              <div className="space-y-2">
                {[...players].sort((a, b) => b.position - a.position).map((p, i) => {
                  const isCurrent = players[currentPlayerIdx]?.turtle.id === p.turtle.id;
                  return (
                    <div 
                      key={p.turtle.id} 
                      className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                        isCurrent 
                          ? 'bg-indigo-950/80 border-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.15)] scale-[1.02]' 
                          : 'bg-slate-950/45 border-indigo-950'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500 w-3">#{i + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-slate-900 border border-indigo-900 flex items-center justify-center">
                          <TurtleSvg id={p.turtle.id} animate={isCurrent} className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-white">{p.turtle.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.position === 0 ? 'START' : p.position === BOARD_PATH.length - 1 ? '🥇 FINISH' : `Space ${p.position}`}
                          </span>
                        </div>
                      </div>

                      {p.skipNextTurn && (
                        <span className="px-1.5 py-0.5 bg-red-950/60 border border-red-500/20 text-[8px] text-red-400 rounded uppercase font-mono">STUCK</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Ticker log */}
            <div className="flex-1 bg-slate-950/60 border border-indigo-900/30 rounded-2xl p-4 flex flex-col h-[180px] justify-between overflow-hidden">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-2 font-bold flex items-center gap-1">
                <History className="w-3.5 h-3.5" /> Race History Logs
              </span>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1.5 scrollbar">
                {logs.map((log) => {
                  let textStyle = 'text-slate-300';
                  if (log.type === 'treasure') textStyle = 'text-amber-300 font-bold';
                  else if (log.type === 'obstacle') textStyle = 'text-rose-400 font-bold';
                  else if (log.type === 'surprise') textStyle = 'text-purple-300 font-bold';
                  else if (log.type === 'victory') textStyle = 'text-emerald-400 font-extrabold text-xs block bg-emerald-950/40 p-2 rounded-lg border border-emerald-800/30';

                  return (
                    <div key={log.id} className="text-[11px] leading-relaxed border-b border-indigo-950/40 pb-1">
                      <span className={textStyle}>{log.message}</span>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Action panel (Dice Roll trigger) */}
            <div className="bg-slate-900 border border-indigo-900/40 p-4 rounded-2xl text-center">
              {winner ? (
                <div className="py-2">
                  <div className="flex flex-col items-center justify-center">
                    <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
                    <span className="text-sm font-bold text-slate-100">{winner.name} wins!</span>
                    <button
                      type="button"
                      onClick={resetDerby}
                      className="mt-3 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs flex items-center gap-1.5 mx-auto border border-indigo-950"
                      id="reset-derby-btn-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Race Again
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-around mb-4 leading-none">
                    <div>
                      <span className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Turn Walker</span>
                      <span className={`px-2 py-1.5 rounded-lg text-xs font-bold border block ${
                        players[currentPlayerIdx]?.isBot ? 'bg-indigo-950 border-indigo-800/50 text-indigo-300' : 'bg-cyan-950 border-cyan-800/60 text-cyan-300'
                      }`} id="turn-indicator">
                        {players[currentPlayerIdx]?.turtle.name} {players[currentPlayerIdx]?.isBot ? '(BOT)' : '(YOU)'}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Race Speed</span>
                      <div className="flex bg-slate-950 p-1.5 rounded-lg border border-indigo-950 h-8 items-center gap-1">
                        {(['normal', 'fast', 'instant'] as const).map((spd) => (
                          <button
                            type="button"
                            key={spd}
                            onClick={() => setBotSpeed(spd)}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition-all ${
                              botSpeed === spd ? 'bg-cyan-700 text-slate-950' : 'text-slate-400'
                            }`}
                          >
                            {spd}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dice visual container */}
                  <div className="flex justify-center mb-4">
                    <button
                      type="button"
                      onClick={handleRollDice}
                      disabled={isRolling || players[currentPlayerIdx]?.isBot}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-700 to-indigo-950 border-2 border-indigo-400 flex items-center justify-center text-4xl font-extrabold text-white shadow-xl transition-all ${
                        isRolling ? 'rotate-360 scale-110 border-cyan-400' : ''
                      } ${
                        players[currentPlayerIdx]?.isBot ? 'cursor-not-allowed opacity-45' : 'hover:scale-105 active:scale-95'
                      }`}
                      id="dice-element"
                    >
                      {diceVal}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRollDice}
                    disabled={isRolling || players[currentPlayerIdx]?.isBot}
                    className={`w-full py-2.5 rounded-xl font-bold font-mono tracking-wider transition-all h-10 flex items-center justify-center uppercase ${
                      players[currentPlayerIdx]?.isBot 
                        ? 'bg-slate-950 text-indigo-500 border border-indigo-950 opacity-100' 
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
                    }`}
                    id="trigger-roll-action"
                  >
                    {players[currentPlayerIdx]?.isBot ? 'Bot is moving...' : isRolling ? 'Rolling Dice...' : 'ROLL THE DICE!'}
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

      {/* Nav footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#0a9396]/40 z-10 text-xs text-slate-450">
        <button 
          type="button"
          onClick={onPrev} 
          className="hover:text-[#94d2bd] font-semibold transition-colors cursor-pointer"
          disabled={!onPrev}
        >
          ← Level 1: Tani Memory
        </button>
        <span className="font-mono text-[#94d2bd]/80 text-[11px] uppercase tracking-wider font-bold">Noam • Turtle Board Game</span>
        <button 
          type="button"
          onClick={() => onComplete(score)} 
          className="text-[#94d2bd] hover:text-white transition-colors flex items-center gap-1 font-semibold cursor-pointer"
        >
          Level 3: Survive Squid →
        </button>
      </div>

    </div>
  );
};
