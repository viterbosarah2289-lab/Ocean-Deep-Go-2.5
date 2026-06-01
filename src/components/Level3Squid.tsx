/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MEET_FISH_LIST, BONUS_FISH_LIST, Fish } from '../types';
import { FishSvg } from './FishSvg';
import { SquidSvg } from './SquidSvg';
import { audio } from '../utils/audio';
import { 
  Flame, ShieldAlert, Sparkles, Zap, Timer, Heart, Trophy, 
  RotateCcw, Play, CheckCircle2, Volume2, VolumeX, AlertTriangle, ChevronRight, ArrowRight
} from 'lucide-react';

interface Level3SquidProps {
  onComplete: (score: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

interface ActiveFish {
  fish: Fish;
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  status: 'swimming' | 'saved' | 'caught';
}

const LEVEL3_FISH_POOL = [...MEET_FISH_LIST.slice(0, 4), BONUS_FISH_LIST[0]]; // Clown, Blue Tang, Angelfish, Butterflyfish, Parrotfish as in Level 3 image

export const Level3Squid: React.FC<Level3SquidProps> = ({ onComplete, onPrev, onNext }) => {
  const [gameState, setGameState] = useState<'intro' | 'watch' | 'active' | 'round_success' | 'round_failed' | 'victory'>('intro');
  const [round, setRound] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(10.0);
  const [activeFish, setActiveFish] = useState<ActiveFish[]>([]);
  const [squidX, setSquidX] = useState<number>(400);
  const [squidY, setSquidY] = useState<number>(200);
  const [muted, setMuted] = useState<boolean>(!audio.isEnabled());
  const [score, setScore] = useState<number>(300); // Level 3 start score

  // Arena bounds reference
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const prevTimeRef = useRef<number | null>(null);

  // Toggle sound
  const toggleMuted = () => {
    const isNowMuted = !audio.toggle();
    setMuted(isNowMuted);
  };

  // Speed factor helper
  const getSpeedMultiplier = () => {
    // Round 1: Slow, Round 5: Extreme
    switch (round) {
      case 1: return 1.5;
      case 2: return 2.2;
      case 3: return 3.2;
      case 4: return 4.5;
      case 5: return 6.0;
      default: return 2.0;
    }
  };

  // Initialize a round
  const initRound = (rNum: number) => {
    // Place fish at dispersed positions
    const initialPositions = [
      { x: 100, y: 100 },
      { x: 650, y: 120 },
      { x: 150, y: 320 },
      { x: 680, y: 300 },
      { x: 420, y: 310 }
    ];

    const mapped: ActiveFish[] = LEVEL3_FISH_POOL.map((fish, idx) => {
      // Give them subtle drifting velocities
      const speed = rNum >= 3 ? 1.5 + rNum * 0.4 : 0.4;
      const angle = Math.random() * Math.PI * 2;
      return {
        fish,
        id: fish.id,
        x: initialPositions[idx].x,
        y: initialPositions[idx].y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        status: 'swimming'
      };
    });

    setActiveFish(mapped);
    // Squid starts in the center
    setSquidX(400);
    setSquidY(200);
    setTimeLeft(10.0);
    setRound(rNum);
  };

  const startRoundIntro = (rNum: number) => {
    audio.playSwoosh();
    initRound(rNum);
    setGameState('watch');

    // Watch phase lasts 1.5s
    setTimeout(() => {
      audio.playSiren();
      setGameState('active');
    }, 1600);
  };

  // Click on a fish to rescue it
  const rescueFish = (fishId: string) => {
    if (gameState !== 'active') return;

    setActiveFish((prev) => {
      const target = prev.find((af) => af.id === fishId);
      if (target && target.status === 'swimming') {
        audio.playBubble();
        setScore((s) => s + 30);
        return prev.map((af) => af.id === fishId ? { ...af, status: 'saved' } : af);
      }
      return prev;
    });
  };

  // Main game core loop tick
  useEffect(() => {
    if (gameState !== 'active') {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const tick = (time: number) => {
      if (prevTimeRef.current === null) {
        prevTimeRef.current = time;
        requestRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = (time - prevTimeRef.current) / 1000;
      prevTimeRef.current = time;

      // 1. Countdown timer
      setTimeLeft((prev) => {
        const next = prev - delta;
        if (next <= 0) {
          handleRoundTimeout();
          return 0;
        }
        return next;
      });

      setActiveFish((prevFish) => {
        // Find uncaught swimming fish
        const swimmingFish = prevFish.filter((af) => af.status === 'swimming');

        // Check if all fish are rescued
        if (swimmingFish.length === 0) {
          handleRoundSuccess();
          return prevFish;
        }

        // 2. Move squid towards the closest uncaught swimming fish
        let closestFish: ActiveFish | null = null;
        let minDist = Infinity;

        swimmingFish.forEach((f) => {
          const dx = f.x - squidX;
          const dy = f.y - squidY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            closestFish = f;
          }
        });

        let nextSquidX = squidX;
        let nextSquidY = squidY;

        if (closestFish) {
          const cf: ActiveFish = closestFish;
          const dx = cf.x - squidX;
          const dy = cf.y - squidY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const speed = getSpeedMultiplier() * 1.5; // Adjusted scaling
          if (distance > 5) {
            nextSquidX += (dx / distance) * speed;
            nextSquidY += (dy / distance) * speed;
            setSquidX(nextSquidX);
            setSquidY(nextSquidY);
          }

          // If squid coordinates are extremely close to target fish - squid eats it!
          if (distance < 35) {
            audio.playDefeat();
            handleFishEaten(cf.id);
          }
        }

        // 3. Keep fish swimming / drifting inside arena
        return prevFish.map((f) => {
          if (f.status !== 'swimming') return f;

          let nx = f.x + f.vx;
          let ny = f.y + f.vy;
          let nvx = f.vx;
          let nvy = f.vy;

          // Bounce off boundary walls
          if (nx <= 20 || nx >= 780) {
            nvx = -nvx;
            nx = Math.max(20, Math.min(nx, 780));
          }
          if (ny <= 20 || ny >= 380) {
            nvy = -nvy;
            ny = Math.max(20, Math.min(ny, 380));
          }

          return {
            ...f,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy
          };
        });
      });

      requestRef.current = requestAnimationFrame(tick);
    };

    requestRef.current = requestAnimationFrame(tick);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      prevTimeRef.current = null;
    };
  }, [gameState, squidX, squidY, round]);

  const handleFishEaten = (fishId: string) => {
    setActiveFish((prev) => {
      const updated = prev.map((f) => f.id === fishId ? { ...f, status: 'caught' as const } : f);
      // If any fish gets eaten, the user fails the round! (Hurry or they die!)
      setTimeout(() => {
        setGameState('round_failed');
      }, 100);
      return updated;
    });
  };

  const handleRoundTimeout = () => {
    // Any remaining swimming fish are caught by squid
    setActiveFish((prev) => {
      const updated = prev.map((f) => f.status === 'swimming' ? { ...f, status: 'caught' as const } : f);
      setGameState('round_failed');
      return updated;
    });
  };

  const handleRoundSuccess = () => {
    audio.playSuccess();
    setScore((s) => s + 100);
    if (round < 5) {
      setGameState('round_success');
    } else {
      setGameState('victory');
    }
  };

  const proceedToNextRound = () => {
    startRoundIntro(round + 1);
  };

  const restartCurrentRound = () => {
    setScore((s) => Math.max(s - 50, 100));
    startRoundIntro(round);
  };

  return (
    <div className="relative min-h-[600px] w-full bg-[#1a0000] rounded-2xl border-2 border-[#ae2012] p-6 flex flex-col justify-between overflow-hidden shadow-2xl text-slate-100" id="l3-squid-root">
      
      {/* Top light strips */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#ae2012] via-[#ee9b00] to-[#bb3e03]" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#ae2012]/35 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ae2012]/20 text-[#ee9b00] rounded-xl border border-[#ae2012]/40">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-white bg-[#ae2012] px-2.5 py-0.5 rounded font-mono font-black tracking-wider uppercase block w-fit mb-1">LEVEL 3 - HARD</span>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 uppercase italic">
              Survive the Squid! <Sparkles className="w-4 h-4 text-amber-300" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={toggleMuted}
            className="p-2 hover:bg-[#ae2012]/20 rounded-lg border border-[#ae2012]/40 text-slate-350 transition-colors cursor-pointer"
            title="Toggle Mute"
            id="l3-sound-toggle"
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-[#ee9b00]" />}
          </button>
          
          <div className="px-4 py-1.5 rounded-lg bg-black/40 border border-[#ae2012]/50 font-mono text-sm">
            <span className="text-[#ee9b00] font-extrabold text-base">{score}</span> <span className="text-slate-400 text-xs">PTS</span>
          </div>
        </div>
      </div>

      {/* Intro Overlay Screen */}
      {gameState === 'intro' && (
        <div className="flex-1 flex flex-col justify-center items-center text-center py-6 z-10 max-w-2xl mx-auto" id="l3-intro">
          <div className="w-24 h-24 mb-4">
            <SquidSvg isAttacking={true} />
          </div>
          <h2 className="text-2xl font-black text-rose-500 uppercase tracking-wide">ELYAS' SURVIVAL CHALLENGE</h2>
          <p className="text-slate-300 text-sm leading-relaxed mt-2">
            A giant hungry squid is circling the waters! When the round starts, the 5 fish will scatter and swim rapidly. 
            The squid will immediately hunt the closest fish. Click the swimming fish to save them before the squid catches them!
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 w-full px-4">
            {LEVEL3_FISH_POOL.map((fish) => (
              <div key={fish.id} className="p-3 bg-slate-900/80 border border-blue-900 rounded-xl text-center">
                <div className="w-12 h-12 mx-auto mb-1">
                  <FishSvg id={fish.id} />
                </div>
                <span className="text-xs font-bold text-white block">{fish.name}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => startRoundIntro(1)}
            className="mt-8 px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 border border-rose-400 transition-all active:scale-95 flex items-center gap-2"
            id="start-lvl3-btn"
          >
            Start Level 3 - Elyas <Play className="w-4 h-4 fill-white" />
          </button>
        </div>
      )}

      {/* Phase Watch Screen */}
      {gameState === 'watch' && (
        <div className="flex-1 flex flex-col justify-center items-center py-10 z-10 text-center" id="phase-watch">
          <div className="animate-spin-slow w-16 h-16 rounded-full border-4 border-t-red-500 border-red-950/20 mb-4" />
          <span className="px-3 py-1 bg-red-950 text-red-400 border border-red-500/30 rounded-full font-mono text-[10px] tracking-widest font-extrabold uppercase mb-2">ROUND {round} WARMUP</span>
          <h2 className="text-3xl font-black text-white tracking-widest">WATCH! SQUID DETECTED!</h2>
          <p className="text-slate-400 text-sm mt-1">Get ready to protect the fish as they scatter!</p>
        </div>
      )}

      {/* Active gameplay Canvas */}
      {(gameState === 'active' || gameState === 'round_failed' || gameState === 'round_success') && (
        <div className="flex-1 flex flex-col md:flex-row gap-4 w-full h-full z-10" id="l3-active-game">
          
          {/* Main Swimming arena */}
          <div 
            ref={arenaRef}
            className="flex-1 relative bg-slate-950/95 border-2 border-blue-900/40 rounded-2xl min-h-[380px] overflow-hidden select-none"
            id="swimming-coral-arena"
          >
            {/* Ambient water bubbles drifting background */}
            <div className="absolute inset-x-20 bottom-0 w-0.5 h-full opacity-10 bg-cyan-400 animate-bubble-slow" />
            <div className="absolute inset-x-60 bottom-0 w-0.5 h-full opacity-10 bg-cyan-400 animate-bubble-medium" />
            <div className="absolute inset-x-80 bottom-0 w-0.5 h-full opacity-15 bg-cyan-400 animate-bubble-fast" />

            {/* Giant Squid Object */}
            <div 
              className="absolute transition-all duration-75 pointer-events-none"
              style={{ 
                left: `${squidX - 48}px`, 
                top: `${squidY - 48}px`,
                width: '96px',
                height: '96px',
                zIndex: 20
              }}
              id="active-squid"
            >
              <SquidSvg isAttacking={true} className="w-24 h-24" />
            </div>

            {/* Fish swim array */}
            {activeFish.map((f) => {
              if (f.status === 'saved') return null;

              const isEaten = f.status === 'caught';

              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => rescueFish(f.id)}
                  disabled={isEaten}
                  className={`absolute p-1 cursor-crosshair rounded-full transition-shadow duration-300 ${
                    isEaten ? 'scale-75 pointer-events-none' : 'hover:shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                  }`}
                  style={{
                    left: `${f.x - 32}px`,
                    top: `${f.y - 32}px`,
                    width: '64px',
                    height: '64px',
                    zIndex: 10
                  }}
                  id={`swim-fish-${f.id}`}
                >
                  {isEaten ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/90 border border-red-600 rounded-full">
                      <span className="text-xl">💀</span>
                      <span className="text-[8px] uppercase tracking-wide text-red-500 font-extrabold font-mono">CAUGHT</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-500 animate-ping rounded-full opacity-60" />
                      <FishSvg id={f.id} animate={true} />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Success / Fail inner overlay */}
            {gameState === 'round_failed' && (
              <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center z-30 p-6">
                <div className="p-3.5 bg-red-600/20 text-red-500 border border-red-500/30 rounded-full mb-3 animate-[shake_0.5s_infinite]">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-extrabold text-rose-500 uppercase tracking-widest">SQUID CAUGHT THEM!</h3>
                <p className="text-xs text-slate-300 max-w-xs mt-1 leading-relaxed">
                  You weren't quick enough! A fish got snagged in the squid's tentacles. Do do not let them die!
                </p>
                <button
                  type="button"
                  onClick={restartCurrentRound}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white text-xs font-bold font-mono tracking-wider rounded-lg border border-red-400 flex items-center gap-1 shadow-lg"
                  id="try-round-again-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> TRY ROUND {round} AGAIN
                </button>
              </div>
            )}

            {gameState === 'round_success' && (
              <div className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center text-center z-30 p-6">
                <div className="p-3.5 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded-full mb-3">
                  <CheckCircle2 className="w-10 h-10 animate-spin-slow" />
                </div>
                <h3 className="text-lg font-extrabold text-emerald-400 uppercase tracking-widest">ROUND {round} SECURE!</h3>
                <p className="text-xs text-slate-300 max-w-xs mt-1 leading-relaxed">
                  Excellent dexterity! All fish rescued safely before the squid could reach them in time.
                </p>
                <button
                  type="button"
                  onClick={proceedToNextRound}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold font-mono tracking-wider rounded-lg border border-emerald-300 flex items-center gap-1 shadow-lg"
                  id="next-round-l3-btn"
                >
                  START ROUND {round + 1} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column Monitor details */}
          <div className="w-full md:w-64 bg-slate-900 border border-blue-900/40 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              {/* HUD Round count */}
              <div className="flex items-center justify-between mb-4 border-b border-indigo-950 pb-2">
                <span className="text-xs text-slate-400">Round Progress</span>
                <span className="text-xs text-amber-400 font-mono font-bold">{round} / 5</span>
              </div>

              {/* Countdown Bar */}
              <div className="bg-slate-950 p-3 rounded-xl border border-indigo-950/80 mb-4 text-center">
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wide">SURVIVAL TIMER</span>
                <span className={`text-2xl font-black font-mono block mt-1 ${timeLeft < 3.0 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                  {timeLeft.toFixed(2)}s
                </span>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${timeLeft < 3.0 ? 'bg-red-500' : 'bg-cyan-500'}`}
                    style={{ width: `${(timeLeft / 10.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Saved Fish collection display */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Rescued Sanctuary</span>
                <div className="grid grid-cols-5 gap-1.5 p-2 bg-slate-950 border border-indigo-950 rounded-xl min-h-[50px] items-center">
                  {activeFish.map((f) => {
                    const isSaved = f.status === 'saved';
                    return (
                      <div 
                        key={f.id} 
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                          isSaved ? 'bg-emerald-950/50 border-emerald-500 scale-100' : 'bg-slate-900/20 border-slate-800 opacity-20 scale-75'
                        }`}
                        title={f.fish.name}
                      >
                        <FishSvg id={f.id} animate={isSaved} className="w-6 h-6" />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div className="mt-4 p-3 bg-blue-950/40 border border-blue-900/30 rounded-xl">
              <span className="text-[9px] font-bold text-cyan-400 block uppercase font-mono mb-1">🎮 Survival Tip</span>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                Speed goes up! Click the fish immediately as soon as they relocate. Anticipate where the squid glides next!
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Level Victory Screen */}
      {gameState === 'victory' && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 z-10 text-center" id="l3-victory">
          <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-full mb-4 animate-bounce">
            <Trophy className="w-16 h-16 text-yellow-400" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-wide uppercase">LEVEL 3 SUCCESS!</h2>
          <p className="text-sm text-cyan-200 mt-2 max-w-md">
            Outstanding! You saved all fish from Elyas' squid across all 5 increasingly rapid levels. You are a true marine guardian!
          </p>

          <div className="my-6 p-4 bg-slate-900/70 border border-emerald-500/20 rounded-xl">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">GRAND TOTAL SCORE</span>
            <span className="text-4xl font-extrabold text-emerald-400 block font-mono mt-1">{score} Points</span>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => startRoundIntro(1)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-blue-900 text-slate-300 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95 text-xs"
              id="replay-lvl3-btn"
            >
              <RotateCcw className="w-4 h-4" /> REPLAY LEVEL 3
            </button>
            <button
              type="button"
              onClick={() => onComplete(score)}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold rounded-xl shadow-lg border border-red-400 flex items-center gap-1.5 transition-all active:scale-95 text-xs uppercase"
              id="goto-impossible-btn"
            >
              Start Level 4: IMPOSSIBLE <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* Nav footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#ae2012]/35 z-10 text-xs text-slate-450">
        <button 
          type="button"
          onClick={onPrev} 
          className="hover:text-[#94d2bd] font-semibold transition-colors cursor-pointer"
          disabled={!onPrev}
        >
          ← Level 2: Noam Board Game
        </button>
        <span className="font-mono text-[#ee9b00]/80 text-[11px] uppercase tracking-wider font-bold">Elyas • Survive Squid</span>
        <button 
          type="button"
          onClick={() => onComplete(score)} 
          className="text-[#94d2bd] hover:text-white transition-colors flex items-center gap-1 font-semibold cursor-pointer"
        >
          Level 4: Dheer Bloop →
        </button>
      </div>

    </div>
  );
};
