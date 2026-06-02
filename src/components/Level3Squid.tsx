/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
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

interface BubbleParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  amplitude: number;
  phaseOffset: number;
}

interface ClickRipple {
  id: string;
  x: number;
  y: number;
  scale: number;
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

  // 4G/5G Bubbles System
  const [bubbles, setBubbles] = useState<BubbleParticle[]>([]);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const [poppedCount, setPoppedCount] = useState<number>(0);

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
    switch (round) {
      case 1: return 1.8;
      case 2: return 2.6;
      case 3: return 3.6;
      case 4: return 4.9;
      case 5: return 6.5; // Very aggressive
      default: return 2.5;
    }
  };

  // Initialize a round
  const initRound = (rNum: number) => {
    const initialPositions = [
      { x: 120, y: 100 },
      { x: 630, y: 120 },
      { x: 180, y: 310 },
      { x: 620, y: 290 },
      { x: 400, y: 310 }
    ];

    const mapped: ActiveFish[] = LEVEL3_FISH_POOL.map((fish, idx) => {
      const speed = rNum >= 3 ? 1.8 + rNum * 0.5 : 0.6;
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
    setSquidY(180);
    setTimeLeft(10.0);
    setRound(rNum);

    // Seed initial bubbles
    const initialBubbles: BubbleParticle[] = Array.from({ length: 15 }).map(() => ({
      id: Math.random().toString(),
      x: Math.random() * 750 + 20,
      y: Math.random() * 300 + 100,
      size: Math.random() * 10 + 4,
      speed: Math.random() * 45 + 15,
      opacity: Math.random() * 0.6 + 0.15,
      amplitude: Math.random() * 3 + 1,
      phaseOffset: Math.random() * Math.PI * 2
    }));
    setBubbles(initialBubbles);
    setRipples([]);
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
  const rescueFish = (fishId: string, event: React.MouseEvent) => {
    if (gameState !== 'active') return;

    setActiveFish((prev) => {
      const target = prev.find((af) => af.id === fishId);
      if (target && target.status === 'swimming') {
        audio.playBubble();
        setScore((s) => s + 35);
        
        // Spawn ring click ripple at precise coordinates relative to parent Arena
        if (arenaRef.current) {
          const rect = arenaRef.current.getBoundingClientRect();
          const clickX = event.clientX - rect.left;
          const clickY = event.clientY - rect.top;
          
          setRipples((prevRips) => [
            ...prevRips.slice(-5), // Keep max 5 active ripples for efficiency
            { id: Math.random().toString(), x: clickX, y: clickY, scale: 0 }
          ]);
        }

        return prev.map((af) => af.id === fishId ? { ...af, status: 'saved' } : af);
      }
      return prev;
    });
  };

  // Pop Background bubble directly
  const popBubble = (bId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    audio.playClick();
    setScore((s) => s + 2); // poppable score bonus (satisfying for 5G gameplay!)
    setPoppedCount((prev) => prev + 1);
    setBubbles((prev) => prev.filter((b) => b.id !== bId));
  };

  // Handle generic background click and add ring wave expansion
  const handleBgClick = (e: React.MouseEvent) => {
    if (gameState !== 'active' || !arenaRef.current) return;
    const rect = arenaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    audio.playBubble();
    setRipples((prev) => [
      ...prev.slice(-4),
      { id: Math.random().toString(), x: clickX, y: clickY, scale: 0 }
    ]);
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

      // 2. Continuous updating particle bubbles position
      setBubbles((prevBub) => {
        let updated = prevBub.map((b) => {
          const nextY = b.y - b.speed * delta;
          const nextX = b.x + Math.sin(nextY / 25 + b.phaseOffset) * b.amplitude * 0.15;
          return { ...b, x: nextX, y: nextY };
        });

        // Delete top floating out structures
        updated = updated.filter((b) => b.y > -20);

        // Spawn new bubbles with random probability
        if (Math.random() < 0.15 && updated.length < 35) {
          updated.push({
            id: Math.random().toString(),
            x: Math.random() * 780 + 10,
            y: 420, // starts at bottom
            size: Math.random() * 8 + 3,
            speed: Math.random() * 50 + 20,
            opacity: Math.random() * 0.5 + 0.15,
            amplitude: Math.random() * 4 + 1,
            phaseOffset: Math.random() * Math.PI
          });
        }
        return updated;
      });

      // 3. Animate click ripples scale outward
      setRipples((prevRips) => 
        prevRips
          .map((r) => ({ ...r, scale: r.scale + delta * 3.5 }))
          .filter((r) => r.scale < 1.1)
      );

      setActiveFish((prevFish) => {
        // Find uncaught swimming fish
        const swimmingFish = prevFish.filter((af) => af.status === 'swimming');

        // Check if all fish are rescued
        if (swimmingFish.length === 0) {
          handleRoundSuccess();
          return prevFish;
        }

        // Move squid towards the closest uncaught swimming fish
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

          const speed = getSpeedMultiplier() * 1.55; 
          if (distance > 5) {
            nextSquidX += (dx / distance) * speed;
            nextSquidY += (dy / distance) * speed;
            setSquidX(nextSquidX);
            setSquidY(nextSquidY);
          }

          // If squid coordinates are extremely close to target fish - squid eats it!
          if (distance < 45) { // Adjusted up slightly since squid is now larger!
            audio.playDefeat();
            handleFishEaten(cf.id);
          }
        }

        // Drifting fish inside arena with trigonometric organic noise
        return prevFish.map((f, index) => {
          if (f.status !== 'swimming') return f;

          // Add a minor sine-wave vertical wobble sweep so the glide is ultra dynamic
          const waveOffset = Math.sin(time * 0.005 + index) * 0.45;
          let nx = f.x + f.vx;
          let ny = f.y + f.vy + waveOffset;
          let nvx = f.vx;
          let nvy = f.vy;

          // Bounce off boundaries securely
          if (nx <= 30 || nx >= 740) {
            nvx = -nvx;
            nx = Math.max(30, Math.min(nx, 740));
          }
          if (ny <= 30 || ny >= 350) {
            nvy = -nvy;
            ny = Math.max(30, Math.min(ny, 350));
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
      setTimeout(() => {
        setGameState('round_failed');
      }, 100);
      return updated;
    });
  };

  const handleRoundTimeout = () => {
    setActiveFish((prev) => {
      const updated = prev.map((f) => f.status === 'swimming' ? { ...f, status: 'caught' as const } : f);
      setGameState('round_failed');
      return updated;
    });
  };

  const handleRoundSuccess = () => {
    audio.playSuccess();
    setScore((s) => s + 120);
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
    setScore((s) => Math.max(s - 40, 100));
    startRoundIntro(round);
  };

  return (
    <div className="relative min-h-[600px] w-full bg-[#110101] rounded-2xl border-2 border-[#b71c1c] p-6 flex flex-col justify-between overflow-hidden shadow-2xl text-slate-100 shadow-[inset_0_0_50px_rgba(183,28,28,0.1)]" id="l3-squid-root">
      
      {/* Top light strips */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#d32f2f] to-[#e65100] animate-pulse" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#b71c1c]/30 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#b71c1c]/20 text-[#ffb74d] rounded-xl border border-[#b71c1c]/40 animate-pulse">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-white bg-red-700 px-2.5 py-0.5 rounded font-mono font-black tracking-wider uppercase block w-fit mb-1 shadow">LEVEL 3 - ELYAS 4G PLUS</span>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 uppercase italic">
              Survive the Giant Squid! <Sparkles className="w-4 h-4 text-[#ffb74d]" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={toggleMuted}
            className="p-2.5 hover:bg-slate-900 rounded-xl border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Toggle Mute"
            id="l3-sound-toggle"
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-amber-500" />}
          </button>
          
          <div className="px-4 py-1.5 rounded-xl bg-black/40 border border-[#b71c1c]/40 font-mono text-sm shadow-[0_0_15px_rgba(239,68,68,0.05)]">
            <span className="text-amber-500 font-extrabold text-base">{score}</span> <span className="text-slate-400 text-xs">PTS</span>
          </div>
        </div>
      </div>

      {/* Intro Overlay Screen */}
      {gameState === 'intro' && (
        <div className="flex-1 flex flex-col justify-center items-center text-center py-6 z-10 max-w-2xl mx-auto" id="l3-intro">
          <div className="w-28 h-28 mb-4 animate-[bounce_3s_infinite]">
            <SquidSvg isAttacking={true} className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-black text-red-500 uppercase tracking-wide italic">ELYAS' ADAPTIVE SQUID SECTOR</h2>
          <p className="text-slate-300 text-sm leading-relaxed mt-2">
            A giant hunting squid rises from the crimson deep. When the simulation boots, the fish will scatter. Saving them requires clicking with high accuracy! Pop ambient bubbles for bonus points.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 w-full px-4">
            {LEVEL3_FISH_POOL.map((fish) => (
              <div key={fish.id} className="p-3 bg-slate-900 border border-slate-800 hover:border-red-500/20 rounded-xl text-center">
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
            className="mt-8 px-8 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg border border-red-500 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-wider text-xs"
            id="start-lvl3-btn"
          >
            Start Elyas 4G Sector <Play className="w-4 h-4 fill-white" />
          </button>
        </div>
      )}

      {/* Phase Watch Screen */}
      {gameState === 'watch' && (
        <div className="flex-1 flex flex-col justify-center items-center py-10 z-10 text-center animate-pulse" id="phase-watch">
          <div className="w-20 h-20 mb-4">
            <SquidSvg isAttacking={true} className="w-full h-full" />
          </div>
          <span className="px-3.5 py-1 bg-red-950 text-red-400 border border-red-500/30 rounded-full font-mono text-[10px] tracking-widest font-extrabold uppercase mb-2">SCANNING CORAL REEFS</span>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase">GIGANTIC SQUID DETECTED!</h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">Prepare protective bubbles and anticipate fish trajectories...</p>
        </div>
      )}

      {/* Active gameplay Canvas */}
      {(gameState === 'active' || gameState === 'round_failed' || gameState === 'round_success') && (
        <div className="flex-1 flex flex-col md:flex-row gap-4 w-full h-full z-10" id="l3-active-game">
          
          {/* Main Swimming arena */}
          <div 
            ref={arenaRef}
            onClick={handleBgClick}
            className="flex-1 relative bg-slate-950/95 border-2 border-red-900/30 rounded-2xl min-h-[380px] overflow-hidden select-none cursor-crosshair shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]"
            id="swimming-coral-arena"
          >
            {/* Ambient Water Particles (Real-Time 4G / poppable bubbles!) */}
            {bubbles.map((b) => (
              <button
                type="button"
                key={b.id}
                onClick={(e) => popBubble(b.id, e)}
                style={{
                  left: `${b.x}px`,
                  top: `${b.y}px`,
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  opacity: b.opacity,
                  zIndex: 10
                }}
                className="absolute bg-gradient-to-tr from-white/10 to-transparent border border-cyan-400/40 rounded-full hover:bg-cyan-400/30 hover:shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-transform duration-75 active:scale-150"
                title="Pop!"
              />
            ))}

            {/* Click Expand Waves Ripples */}
            {ripples.map((rip) => (
              <div 
                key={rip.id}
                style={{
                  left: `${rip.x}px`,
                  top: `${rip.y}px`,
                  transform: `translate(-50%, -50%) scale(${rip.scale})`,
                  opacity: 1 - rip.scale,
                  zIndex: 5
                }}
                className="absolute w-24 h-24 border-2 border-cyan-400 rounded-full pointer-events-none transition-transform duration-75"
              />
            ))}

            {/* Giant Squid Object - ENHANCED SIZE (w-32 h-32 = 128px) */}
            <div 
              className="absolute pointer-events-none transition-all duration-75"
              style={{ 
                left: `${squidX - 64}px`, 
                top: `${squidY - 64}px`,
                width: '128px',
                height: '128px',
                zIndex: 25
              }}
              id="active-squid"
            >
              <SquidSvg isAttacking={true} className="w-full h-full" />
            </div>

            {/* Fish swim array - MOVEMENT & FACING DRIVEN */}
            {activeFish.map((f) => {
              if (f.status === 'saved') return null;

              const isEaten = f.status === 'caught';
              // Default FishSvg generally faces left. If velocity vx > 0, we flip scaleX to -1 so it swims right!
              const scaleX = f.vx > 0 ? -1 : 1;
              const angleRotation = f.vy * 5; // dynamic tilt based on vertical movement

              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={(e) => rescueFish(f.id, e)}
                  disabled={isEaten}
                  className="absolute p-0.5 cursor-pointer rounded-full transition-transform duration-75 flex items-center justify-center"
                  style={{
                    left: `${f.x - 32}px`,
                    top: `${f.y - 32}px`,
                    width: '64px',
                    height: '64px',
                    zIndex: 20,
                    transform: `scaleX(${scaleX}) rotate(${angleRotation}deg)`
                  }}
                  id={`swim-fish-${f.id}`}
                >
                  {isEaten ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-950/80 border-2 border-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                      <span className="text-lg">❌</span>
                      <span className="text-[7px] uppercase tracking-wide text-red-500 font-extrabold font-mono">CAUGHT</span>
                    </div>
                  ) : (
                    <div className="relative w-full h-full hover:scale-110 transition-transform">
                      {/* Sub-ping indicator */}
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <FishSvg id={f.id} animate={true} />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Success / Fail inner overlay */}
            {gameState === 'round_failed' && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center z-30 p-6">
                <div className="p-4 bg-red-600/20 text-red-500 border border-red-500/30 rounded-full mb-3 animate-[bounce_1s_infinite]">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-rose-500 uppercase tracking-widest">SQUID REACTION CRITICAL</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                  Too slow! Squid intercepted a sanctuary fish. Enhance your protective grid coordination!
                </p>
                <button
                  type="button"
                  onClick={restartCurrentRound}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold font-mono tracking-wider rounded-lg border border-red-500 flex items-center gap-1 shadow-lg"
                  id="try-round-again-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> REBOOT SIMULATION {round}
                </button>
              </div>
            )}

            {gameState === 'round_success' && (
              <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center z-30 p-6">
                <div className="p-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-full mb-3">
                  <CheckCircle2 className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="text-lg font-black text-emerald-400 uppercase tracking-widest">WAVE {round} SECURED!</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">
                  Excellent grid deflection! All sanctuary specimens successfully relocated to biological vaults.
                </p>
                <button
                  type="button"
                  onClick={proceedToNextRound}
                  className="mt-4 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold font-mono tracking-wider rounded-lg border border-emerald-300 flex items-center gap-1 shadow-lg cursor-pointer"
                  id="next-round-l3-btn"
                >
                  LOAD SIMULATION {round + 1} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Column Monitor details */}
          <div className="w-full md:w-64 bg-slate-950 border border-red-950/40 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              {/* HUD Round count */}
              <div className="flex items-center justify-between mb-4 border-b border-red-950/20 pb-2 font-mono">
                <span className="text-xs text-slate-400 uppercase font-bold">WAVE STAGES</span>
                <span className="text-xs text-amber-500 font-bold">{round} / 5</span>
              </div>

              {/* Countdown Bar */}
              <div className="bg-black/40 p-3 rounded-xl border border-red-950/40 mb-4 text-center">
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wide">SURVIVAL CHRONOMETER</span>
                <span className={`text-2xl font-black font-mono block mt-1 ${timeLeft < 3.0 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                  {timeLeft.toFixed(2)}s
                </span>
                <div className="w-full h-1 bg-slate-900 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all ${timeLeft < 3.0 ? 'bg-red-500' : 'bg-cyan-500'}`}
                    style={{ width: `${(timeLeft / 10.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Poppable statistics */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl mb-3 text-center flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Bubbles Popped</span>
                <span className="font-mono text-cyan-400 font-bold">#{poppedCount}</span>
              </div>

              {/* Saved Fish collection display */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">Relocation Vaults</span>
                <div className="grid grid-cols-5 gap-1.5 p-2 bg-black/60 border border-red-950/30 rounded-xl min-h-[50px] items-center">
                  {activeFish.map((f) => {
                    const isSaved = f.status === 'saved';
                    return (
                      <div 
                        key={f.id} 
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${
                          isSaved ? 'bg-emerald-950/40 border-emerald-500 scale-100 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-transparent opacity-10 scale-75'
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
            <div className="mt-4 p-3 bg-red-950/20 border border-red-900/20 rounded-xl">
              <span className="text-[9px] font-bold text-amber-500 block uppercase font-mono mb-1">🕹️ 4G Fluid Motion</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Notice fish coordinates scale dynamically to travel headings. Intercept the bubbles to boost tactical score parameters!
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Level Victory Screen */}
      {gameState === 'victory' && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 z-10 text-center animate-fade-in" id="l3-victory">
          <div className="p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-full mb-4">
            <Trophy className="w-16 h-16 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-wide uppercase italic">SIMULATION SECURE</h2>
          <p className="text-sm text-slate-350 mt-2 max-w-md leading-relaxed">
            Pristine work! All Waves successfully cleared with high-density response parameters. Elyas' coral sanctuary has been stabilized.
          </p>

          <div className="my-6 p-4 bg-slate-950 border border-emerald-500/20 rounded-xl">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">Tactical Final Output</span>
            <span className="text-4xl font-extrabold text-emerald-400 block font-mono mt-1">{score} Points</span>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => startRoundIntro(1)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95 text-xs font-mono uppercase font-bold"
              id="replay-lvl3-btn"
            >
              <RotateCcw className="w-4 h-4" /> REBOOT LEVEL 3
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
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#b71c1c]/30 z-10 text-xs text-slate-500">
        <button 
          type="button"
          onClick={onPrev} 
          className="hover:text-red-400 transition-colors cursor-pointer"
          disabled={!onPrev}
        >
          ← Level 2: Noam Derby
        </button>
        <span className="font-mono text-[#e65100] text-[10px] uppercase tracking-wider font-bold">Elyas • Survival Coral 4G</span>
        <button 
          type="button"
          onClick={() => onComplete(score)} 
          className="text-red-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-bold"
        >
          Level 4: Dheer Bloop →
        </button>
      </div>

    </div>
  );
};
