/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { MEET_FISH_LIST, BONUS_FISH_LIST, Fish } from '../types';
import { FishSvg } from './FishSvg';
import { audio } from '../utils/audio';
import { ShieldCheck, Eye, EyeOff, BrainCircuit, Play, RotateCcw, Award, Sparkles, ChevronRight, Volume2, VolumeX } from 'lucide-react';

interface Level1MemoryProps {
  onComplete: (score: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export const Level1Memory: React.FC<Level1MemoryProps> = ({ onComplete, onPrev, onNext }) => {
  const [phase, setPhase] = useState<'memorize' | 'cover' | 'test' | 'results' | 'bonus'>('memorize');
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [testQuestionIdx, setTestQuestionIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [bonusTarget, setBonusTarget] = useState<Fish | null>(null);
  const [bonusGrid, setBonusGrid] = useState<Fish[]>([]);
  const [bonusAttempts, setBonusAttempts] = useState<number>(0);
  const [bonusCollected, setBonusCollected] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(!audio.isEnabled());

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle sound
  const toggleMuted = () => {
    const isNowMuted = !audio.toggle();
    setMuted(isNowMuted);
  };

  // Setup Memorize Timer
  useEffect(() => {
    if (phase === 'memorize') {
      setTimeLeft(20);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            autoTransitionToCover();
            return 0;
          }
          if (prev === 4) {
            // High intensity pop sound countdown warning
            audio.playClick();
          } else if (prev < 4) {
            audio.playClick();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const autoTransitionToCover = () => {
    audio.playSwoosh();
    setPhase('cover');
  };

  const startTesting = () => {
    audio.playBubble();
    setSelectedAnswers([]);
    setTestQuestionIdx(0);
    setPhase('test');
  };

  // Pools for testing: Combine target and distractor fish
  const allTestCandidates = [...MEET_FISH_LIST, ...BONUS_FISH_LIST];

  // Question definitions:
  // We will ask 4 key memory questions:
  // Q1: "Which of these was the first fish shown?"
  // Q2: "Which fish is name 'Blue Tang'?" (Show a grid of 4 SVGs, select the correct matching blue tang)
  // Q3: "Which fish was NOT shown in the initial 5 fish?"
  // Q4: "Name this fish:" (Show an SVG of Angelfish, select between Angelfish, Moorish Idol, Royal Gramma, Triggerfish)

  const handleAnswerQuestion = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 25);
      audio.playSuccess();
    } else {
      audio.playDefeat();
    }

    if (testQuestionIdx < 3) {
      setTestQuestionIdx((prev) => prev + 1);
    } else {
      setPhase('results');
    }
  };

  // Setup Bonus Round
  const startBonusRound = () => {
    audio.playBubble();
    // Choose 1 target fish from Bonus pool
    const randomBonus = BONUS_FISH_LIST[Math.floor(Math.random() * BONUS_FISH_LIST.length)];
    // Fill grid with the 5 original fish + target bonus fish
    const grid = [...MEET_FISH_LIST, randomBonus];
    // Shuffle the grid so position is randomized
    const shuffledGrid = [...grid].sort(() => Math.random() - 0.5);

    setBonusTarget(randomBonus);
    setBonusGrid(shuffledGrid);
    setBonusAttempts(0);
    setBonusCollected(false);
    setPhase('bonus');
  };

  const handleBonusClick = (clickedFishId: string) => {
    if (!bonusTarget) return;
    setBonusAttempts((prev) => prev + 1);

    if (clickedFishId === bonusTarget.id) {
      audio.playPowerUp();
      setScore((prev) => prev + 50);
      setBonusCollected(true);
    } else {
      audio.playDefeat();
    }
  };

  const triggerReset = () => {
    setPhase('memorize');
    setScore(0);
    setTestQuestionIdx(0);
    setSelectedAnswers([]);
  };

  return (
    <div className="relative min-h-[600px] w-full bg-[#001d3d] rounded-2xl border-2 border-[#003566] p-6 flex flex-col justify-between overflow-hidden shadow-2xl text-slate-100" id="l1-memory-root">
      
      {/* Wave glow header decor */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#8ecae6] via-[#005f73] to-[#94d2bd]" />
      
      {/* HUD Bar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#005f73]/40 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#005f73]/20 text-[#94d2bd] rounded-xl border border-[#005f73]/40">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-[#8ecae6] tracking-wider font-mono font-semibold uppercase block">LEVEL 1 - TANI</span>
            <h1 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-1.5">
              Meet the 5 Fish <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sound, Restart */}
          <button 
            type="button"
            onClick={toggleMuted}
            className="p-2 hover:bg-[#002855] rounded-lg border border-[#003566]/65 text-slate-300 transition-colors"
            title="Toggle Mute"
            id="toggle-mute-btn"
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-[#94d2bd]" />}
          </button>
          
          <div className="px-4 py-1.5 rounded-lg bg-[#001219]/60 border border-[#005f73]/50 font-mono text-sm">
            <span className="text-[#94d2bd] font-extrabold text-base">{score}</span> <span className="text-slate-400 text-xs">PTS</span>
          </div>
        </div>
      </div>

      {/* Main Content Areas Based on Phase */}

      {phase === 'memorize' && (
        <div className="flex-1 flex flex-col justify-between items-center py-4 z-10" id="phase-memorize">
          <div className="text-center max-w-lg mb-4">
            <p className="text-sm text-cyan-200">Look at the fish carefully. Try to remember their names, shapes, and colorful details!</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-950/80 text-red-300 font-mono text-xs border border-red-500/20 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Time Remaining: {timeLeft}s
              </span>
            </div>
          </div>

          {/* Core Grid of 5 Fish */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-4xl px-4 py-2">
            {MEET_FISH_LIST.map((fish, i) => (
              <div 
                key={fish.id} 
                className="group relative flex flex-col items-center p-4 bg-slate-900/80 border border-cyan-500/20 rounded-xl hover:border-cyan-500/60 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] overflow-hidden"
                id={`memo-fish-card-${fish.id}`}
              >
                {/* Glow Backdrop */}
                <div className={`absolute -inset-10 bg-gradient-to-tr ${fish.color} opacity-[0.03] blur-3xl`} />
                <div className="w-24 h-24 flex items-center justify-center mb-2">
                  <FishSvg id={fish.id} animate={true} />
                </div>
                <h3 className="text-sm font-bold text-slate-100">{fish.name}</h3>
                <span className="text-[10px] text-cyan-400 font-mono italic opacity-90">{fish.scientific}</span>
                <p className="text-[11px] text-slate-400 text-center mt-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
                  {fish.description}
                </p>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={autoTransitionToCover}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-950/50 hover:shadow-cyan-500/20 transition-all flex items-center gap-2 border border-indigo-400/20 active:scale-95"
              id="ready-btn"
            >
              I am Ready! Skip Timer <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {phase === 'cover' && (
        <div className="flex-1 flex flex-col justify-center items-center py-8 z-10 text-center" id="phase-cover">
          <div className="p-5 bg-blue-950/60 border border-blue-500/20 rounded-full mb-4 animate-bounce">
            <EyeOff className="w-16 h-16 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">COVER YOUR EYES!</h2>
          <p className="text-cyan-200 text-sm max-w-md leading-relaxed mb-6">
            What fish did you see? Write their names and visualize their colors in your mind. No peeking allowed!
          </p>

          <button
            type="button"
            onClick={startTesting}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold tracking-wide rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 border border-cyan-300"
            id="start-memory-test-btn"
          >
            Start Memory Test <Play className="w-4 h-4 fill-slate-950" />
          </button>
        </div>
      )}

      {phase === 'test' && (
        <div className="flex-1 flex flex-col justify-between items-center py-4 z-10 w-full" id="phase-test">
          {/* Question Indicator */}
          <div className="w-full max-w-2xl bg-slate-905 p-4 rounded-xl border border-blue-900/30 mb-4">
            <div className="flex items-center justify-between text-xs text-cyan-400 font-mono mb-2">
              <span>QUESTION {testQuestionIdx + 1} OF 4</span>
              <span>PROGRESS: {Math.round(((testQuestionIdx) / 4) * 100)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300" 
                style={{ width: `${((testQuestionIdx + 1) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Dynamic Q & A Generator */}
          {testQuestionIdx === 0 && (
            <div className="text-center w-full max-w-2xl" id="question-1">
              <h2 className="text-xl font-semibold text-white mb-6">Which of these fish was part of the original 5 species you memorized?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {[
                  { fish: BONUS_FISH_LIST[0], isCorrect: false }, // Parrotfish (bonus)
                  { fish: MEET_FISH_LIST[1], isCorrect: true },    // Blue tang
                  { fish: BONUS_FISH_LIST[1], isCorrect: false }, // Moorish Idol
                  { fish: BONUS_FISH_LIST[3], isCorrect: false }  // Royal Gramma
                ].sort(() => Math.random() - 0.5).map((option, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleAnswerQuestion(option.isCorrect)}
                    className="flex flex-col items-center p-4 bg-slate-900 hover:bg-slate-800/90 rounded-xl border border-blue-900 hover:border-cyan-500 transition-all duration-200 group active:scale-95"
                  >
                    <div className="w-16 h-16 mb-2">
                      <FishSvg id={option.fish.id} />
                    </div>
                    <span className="text-sm font-semibold group-hover:text-cyan-400 text-slate-100">{option.fish.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {testQuestionIdx === 1 && (
            <div className="text-center w-full max-w-2xl" id="question-2">
              <h2 className="text-xl font-semibold text-white mb-6">Which fish carries the scientific name <span className="italic text-cyan-400">"Pterophyllum"</span>?</h2>
              <div className="grid grid-cols-2 gap-4 px-4">
                {[
                  { name: 'Lionfish', isCorrect: false },
                  { name: 'Angelfish', isCorrect: true },
                  { name: 'Clownfish', isCorrect: false },
                  { name: 'Butterflyfish', isCorrect: false }
                ].sort(() => Math.random() - 0.5).map((opt, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleAnswerQuestion(opt.isCorrect)}
                    className="py-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl border border-blue-950 hover:border-cyan-400 text-center transition-all duration-200 active:scale-95"
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {testQuestionIdx === 2 && (
            <div className="text-center w-full max-w-2xl" id="question-3">
              <h2 className="text-xl font-semibold text-white mb-6">Select the fish matching the following description: <br />
                <span className="text-slate-400 text-sm italic font-normal">"Flamboyant red zebra stripes, carrying fan-like pectoral fins with venomous spiky rays."</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {[
                  { id: 'lionfish', name: 'Lionfish', isCorrect: true },
                  { id: 'clownfish', name: 'Clownfish', isCorrect: false },
                  { id: 'butterflyfish', name: 'Butterflyfish', isCorrect: false },
                  { id: 'pufferfish', name: 'Pufferfish', isCorrect: false }
                ].sort(() => Math.random() - 0.5).map((opt, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleAnswerQuestion(opt.isCorrect)}
                    className="flex flex-col items-center p-4 bg-slate-900 hover:bg-slate-800 rounded-xl border border-blue-900 hover:border-cyan-400 transition-all active:scale-95 group"
                  >
                    <div className="w-16 h-16 mb-2">
                      <FishSvg id={opt.id} />
                    </div>
                    <span className="text-xs font-semibold group-hover:text-cyan-400 text-slate-100">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {testQuestionIdx === 3 && (
            <div className="text-center w-full max-w-2xl" id="question-4">
              <h2 className="text-xl font-semibold text-white mb-6">How many fish in the original list carry orange colors in their skin stripes?</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {[
                  { value: '1', label: 'Only 1 (Clownfish)', isCorrect: true },
                  { value: '2', label: '2 Fish (Clownfish & Butterflyfish)', isCorrect: false },
                  { value: '3', label: '3 Fish', isCorrect: false },
                  { value: '0', label: 'None of them', isCorrect: false }
                ].map((opt, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleAnswerQuestion(opt.isCorrect)}
                    className="p-5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-blue-950 hover:border-cyan-400 transition-all font-medium active:scale-95"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>
      )}

      {phase === 'results' && (
        <div className="flex-1 flex flex-col justify-center items-center py-6 z-10 text-center" id="phase-results">
          <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-full mb-4">
            <Award className="w-14 h-14 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">LEVEL 1 COMPLETE</h2>
          <p className="text-slate-400 text-sm max-w-xs mb-4">You did a phenomenal job recognizing the sea currents' dwellers!</p>
          
          <div className="mb-6 p-4 bg-slate-900/60 border border-indigo-500/20 rounded-xl min-w-[240px]">
            <span className="text-slate-400 text-xs uppercase tracking-widest block font-mono">YOUR REVEAL ACCURACY</span>
            <span className="text-4xl font-extrabold text-indigo-400 font-mono">{score}/100</span>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={triggerReset}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-blue-900 hover:border-blue-700 text-slate-300 font-medium rounded-xl transition-all flex items-center gap-2 active:scale-95"
              id="retry-memory-btn"
            >
              <RotateCcw className="w-4 h-4" /> Restart
            </button>
            <button
              type="button"
              onClick={startBonusRound}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2 active:scale-95 border border-amber-200"
              id="bonus-round-btn"
            >
              Start Bonus Round! <Sparkles className="w-4 h-4 fill-slate-950" />
            </button>
          </div>
        </div>
      )}

      {phase === 'bonus' && (
        <div className="flex-1 flex flex-col justify-between items-center py-4 z-10 w-full" id="phase-bonus">
          <div className="text-center max-w-lg mb-4">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs border border-amber-400/30 uppercase tracking-widest font-bold block w-fit mx-auto mb-2">BONUS ROUND</span>
            <h2 className="text-xl font-bold text-white mb-2">Can you spot the new fish?</h2>
            {bonusTarget && !bonusCollected ? (
              <p className="text-sm text-cyan-200">
                Find the <span className="font-extrabold text-amber-400 uppercase underline decoration-amber-500">{bonusTarget.name}</span> in the sea grid below! 
                It was NOT present in the initial 5 fish lineup.
              </p>
            ) : (
              <p className="text-sm text-emerald-400 font-semibold">Trophy Claimed! Outstanding eye-mind coordination.</p>
            )}
          </div>

          {/* Grid including the bonus fish */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 w-full max-w-4xl px-4 py-2">
            {bonusGrid.map((fish, idx) => {
              const isSelected = selectedAnswers.includes(fish.id);
              const isTarget = bonusTarget?.id === fish.id;

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    if (bonusCollected) return;
                    setSelectedAnswers((prev) => [...prev, fish.id]);
                    handleBonusClick(fish.id);
                  }}
                  disabled={bonusCollected}
                  className={`p-3 bg-slate-900 border rounded-xl flex flex-col items-center justify-between transition-all duration-300 ${
                    bonusCollected && isTarget 
                      ? 'border-emerald-500 bg-emerald-950/20 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                      : isSelected && !isTarget
                      ? 'border-red-500/40 bg-red-950/10 opacity-50 scale-95 cursor-not-allowed'
                      : 'border-blue-900 hover:border-amber-400 hover:scale-105'
                  }`}
                >
                  <div className="w-16 h-16">
                    <FishSvg id={fish.id} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-300 mt-2 block truncate w-full text-center">
                    {bonusCollected && isTarget ? fish.name : 'Unknown'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={triggerReset}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-blue-900 text-slate-300 rounded-xl font-medium transition-all active:scale-95"
              id="replay-level-1-btn"
            >
              Replay Level 1
            </button>

            <button
              type="button"
              onClick={() => onComplete(score)}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
              id="finish-level-1-btn"
            >
              Level 2: Turtle Adventure <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* Nav footer */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#005f73]/40 z-10 text-xs text-slate-450">
        <button 
          type="button"
          onClick={onPrev} 
          className="hover:text-[#94d2bd] font-semibold transition-colors cursor-pointer"
          disabled={!onPrev}
        >
          ← Main Menu
        </button>
        <span className="font-mono text-[#8ecae6]/80 text-[11px] uppercase tracking-wider font-bold">Tani • Meet The 5 Fish</span>
        <button 
          type="button"
          onClick={() => onComplete(score)} 
          className="text-[#94d2bd] hover:text-white transition-colors flex items-center gap-1 font-semibold cursor-pointer"
        >
          Skip Level →
        </button>
      </div>

    </div>
  );
};
