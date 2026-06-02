import React, { useState } from 'react';
import { 
  BookOpen, Users, Compass, Star, ShieldAlert, Award, Brain, Flame, 
  HelpCircle, Sparkles, X, ChevronRight, CheckCircle2, Lock, Eye, EyeOff
} from 'lucide-react';

import taniImg from '../assets/images/tani_avatar_1780381573382.png';
import noamImg from '../assets/images/noam_avatar_1780381519918.png';
import elyasImg from '../assets/images/elyas_avatar_1780381537513.png';
import dheerImg from '../assets/images/dheer_avatar_1780381555412.png';

interface CodexAndGuideProps {
  isOpen: boolean;
  onClose: () => void;
  starsCount: number;
}

export const CodexAndGuide: React.FC<CodexAndGuideProps> = ({ isOpen, onClose, starsCount }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'characters' | 'progression'>('guide');
  const [showClassified, setShowClassified] = useState<boolean>(false);

  if (!isOpen) return null;

  const isBonusUnlocked = starsCount >= 6;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in" id="codex-guide-modal">
      <div className="bg-[#001219] border-2 border-[#0a9396] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Neon Glow Header Strip */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#8ecae6] via-[#0a9396] to-[#ae2012]" />
        
        {/* Header Title Bar */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[#005f73]/35 bg-[#001d3d]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0a9396]/15 text-[#94d2bd] rounded-xl border border-[#0a9396]/40">
              <BookOpen className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2 uppercase italic">
                Ocean Deep Go Codex <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-[11px] text-[#8ecae6] font-mono tracking-wider uppercase font-semibold">
                Official User Manual & Character Profiles
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose}
            className="p-2.5 hover:bg-[#ae2012]/15 text-slate-300 hover:text-red-400 rounded-xl border border-slate-800 transition-colors cursor-pointer"
            title="Close Codex"
            id="close-codex-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Header */}
        <div className="flex bg-[#000814]/70 px-4 py-2 border-b border-[#005f73]/20 text-xs font-mono font-bold select-none overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-lg border uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-[#0a9396] text-[#001219] border-[#94d2bd] font-black'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Compass className="w-4 h-4" /> Game User Guide
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('characters')}
            className={`px-4 py-2.5 rounded-lg border uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-[#0a9396] text-[#001219] border-[#94d2bd] font-black'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Users className="w-4 h-4" /> Backstories & Profiles
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('progression')}
            className={`px-4 py-2.5 rounded-lg border uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'progression'
                ? 'bg-[#0a9396] text-[#001219] border-[#94d2bd] font-black'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Award className="w-4 h-4" /> Scoring & Star Progression
          </button>
        </div>

        {/* Scrollable Content Bay */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed" id="codex-scroll-body">
          
          {/* TAB 1: USER GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-slide-up" id="codex-guide-tab">
              <div className="border border-[#005f73]/35 bg-[#001d3d]/50 rounded-xl p-4 flex gap-4 items-start mb-2">
                <HelpCircle className="w-12 h-12 text-[#94d2bd] flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white text-base">HOW TO PLAY OCEAN DEEP GO</h3>
                  <p className="text-xs text-[#8ecae6] mt-1">
                    Welcome to the deep. You must navigate through 4 consecutive levels, test your cognitive skills, and survive multiple underwater hazards. Unlock levels sequentially by completing the prior objective.
                  </p>
                </div>
              </div>

              {/* Levels explanation stack */}
              <div className="space-y-4">
                
                {/* Level 1 Guide */}
                <div className="bg-[#001d3d]/40 border border-[#003566] hover:border-[#005f73]/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#005f73]/20">
                    <span className="text-xs text-[#8ecae6] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <Brain className="w-4 h-4 text-[#8ecae6]" /> LEVEL 1 : TANI MEET THE 5 FISH
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">1 - 3 Stars</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Objective:</strong> Study name traits and bioluminescent outlines of 5 distinct underwater fish within the 20-second timer.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    <strong>Mechanics:</strong> Once covered, answer the multi-option memory questions. Accurately matching fish types with descriptions grants points. Finish with the quick Bonus Finding session to capture rare specimens for additional scores!
                  </p>
                  <p className="text-[11px] text-cyan-400 font-mono mt-1">
                    💡 <em>Pro Tip: Hover on the fish in memorization phase to view hidden hints and scientific details!</em>
                  </p>
                </div>

                {/* Level 2 Guide */}
                <div className="bg-[#001d3d]/40 border border-[#003566] hover:border-[#005f73]/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#005f73]/20">
                    <span className="text-xs text-[#52b788] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-[#52b788]" /> LEVEL 2 : NOAM TURTLE ADVENTURE BOARD GAME
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">1 - 3 Stars</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Objective:</strong> Guide four competitive sea turtles safely across a grid board to compile pristine seashell booster scores.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    <strong>Mechanics:</strong> Turn-based roll actions. Red spots carry negative tidal waves, golden shells generate massive energy boosts (+100 PTS), and obsidian deep whirlpools stun the shell speed. Outsmart AI bots chasing the terminal spot before they lock out!
                  </p>
                  <p className="text-[11px] text-teal-400 font-mono mt-1">
                    💡 <em>Pro Tip: Focus on gathering the booster shell points rather than rushing directly to the end!</em>
                  </p>
                </div>

                {/* Level 3 Guide */}
                <div className="bg-[#001d3d]/40 border border-[#003566] hover:border-[#005f73]/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#005f73]/20">
                    <span className="text-xs text-[#ee9b00] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-[#ee9b00]" /> LEVEL 3 : HARD ELyas SURVIVE THE SQUID!
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">1 - 3 Stars</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Objective:</strong> Rapid protective reflex simulation. Save innocent marine fish from predatory monster squid tentacles.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    <strong>Mechanics:</strong> Tap the scattering fish as soon as the massive Kraken attacks! Every correct rescue counts towards point speed. Mistapping triggers squid inks. Speed and response times multiply scores.
                  </p>
                  <p className="text-[11px] text-orange-400 font-mono mt-1">
                    💡 <em>Pro Tip: Use double-finger taps to save fish pairs on dual directions!</em>
                  </p>
                </div>

                {/* Level 4 Guide */}
                <div className="bg-[#001d3d]/40 border border-[#003566] hover:border-[#005f73]/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#005f73]/20">
                    <span className="text-xs text-[#ae2012] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-500" /> LEVEL 4 : IMPOSSIBLE DHEER SURVIVE THE BLOOP BOMB
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">1 - 3 Stars</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    <strong>Objective:</strong> Keep your high-tech submersible intact for 60 seconds against collapsing obsidian debris, radar blackout radiation, the Nuclear charging Bloop, AND the terrifying Giant Abyssal Megamouth Fish!
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    <strong>Mechanics:</strong> Steer using Keyboard Arrow/WASD keys or D-Pad controls. Grab floating buffs (Shield, Overclock Speed, emergency life powerups). Get into glowing Cave Centers within 5 seconds when the alert sirens ring to shield from the terminal nuclear blast! Stay clear of the dynamic Giant Monster Fish that hunts you continuously!
                  </p>
                  <p className="text-[11px] text-red-400 font-mono mt-1">
                    💡 <em>Pro Tip: Collect the Purple Radar Buff to track hidden safe cave coordinates on your sonar during active fallout storms.</em>
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: CHARACTER PROFILES */}
          {activeTab === 'characters' && (
            <div className="space-y-6 animate-slide-up" id="codex-characters-tab">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Profile: Tani */}
                <div className="bg-[#001c29] border border-[#005f73]/30 p-4 rounded-xl flex gap-3">
                  <div className="w-12 h-12 rounded-full border border-purple-500/30 overflow-hidden flex-shrink-0">
                    <img src={taniImg} alt="Tani" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-white font-bold uppercase tracking-tight">Tani</h4>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#005f73] text-white rounded font-mono">SCHOLAR</span>
                    </div>
                    <span className="text-[10px] text-[#94d2bd] block font-mono">"Observation yields preservation."</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      A brilliant marine biologist prodigy who believes mapping the bioluminescent patterns of hidden deep species builds a cosmic bridge to restore our dying ocean ecosystems.
                    </p>
                  </div>
                </div>

                {/* Profile: Noam */}
                <div className="bg-[#001c29] border border-[#005f73]/30 p-4 rounded-xl flex gap-3">
                  <div className="w-12 h-12 rounded-full border border-cyan-500/30 overflow-hidden flex-shrink-0">
                    <img src={noamImg} alt="Noam" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-white font-bold uppercase tracking-tight">Noam</h4>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#0a9396] text-[#001219] rounded font-mono">NAVIGATOR</span>
                    </div>
                    <span className="text-[10px] text-[#94d2bd] block font-mono">"Patience outruns the storm."</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      A curly-haired boy wearing metal braces. He functions as our brilliant tactical navigator who coordinates leatherback sea turtle squads through tricky coral reef routes.
                    </p>
                  </div>
                </div>

                {/* Profile: Elyas */}
                <div className="bg-[#001c29] border border-[#005f73]/30 p-4 rounded-xl flex gap-3">
                  <div className="w-12 h-12 rounded-full border border-emerald-500/30 overflow-hidden flex-shrink-0">
                    <img src={elyasImg} alt="Elyas" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-white font-bold uppercase tracking-tight">Elyas</h4>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#ee9b00] text-slate-950 font-bold rounded font-mono">DEFENDER</span>
                    </div>
                    <span className="text-[10px] text-[#ee9b00] block font-mono">"No fish left behind."</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      A cute Nigerian kid designed with advanced sea sentinel gear, serving as a quick-thinking defender who shields vulnerable pufferfish groups from abyssal squid laser barriers.
                    </p>
                  </div>
                </div>

                {/* Profile: Dheer */}
                <div className="bg-[#001c29] border border-[#005f73]/30 p-4 rounded-xl flex gap-3">
                  <div className="w-12 h-12 rounded-full border border-orange-500/30 overflow-hidden flex-shrink-0">
                    <img src={dheerImg} alt="Dheer" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-white font-bold uppercase tracking-tight">Dheer</h4>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#ae2012] text-white rounded font-mono">COMMANDER</span>
                    </div>
                    <span className="text-[10px] text-[#ae2012] block font-mono">"Pilot with iron conviction."</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      A clever Indian boy wearing glasses. He pilots the research submarine with iron conviction, dodging abyssal bombs and unstable nuclear core hazards.
                    </p>
                  </div>
                </div>

                {/* Profile: The Bloop */}
                <div className="bg-[#001c29] border border-[#005f73]/30 p-4 rounded-xl flex gap-3">
                  <span className="text-4xl select-none filter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">🐙</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-white font-bold uppercase tracking-tight">The Bloop</h4>
                      <span className="text-[8px] px-1.5 py-0.5 bg-black text-red-500 border border-red-500 rounded font-mono">LEVIATHAN</span>
                    </div>
                    <span className="text-[10px] text-red-400 block font-mono">"The deep remembers."</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      An ancient, mythical titanic entity that produces ultra-low frequency auditory hums. When disturbed, its internal radioactive core charges, unleashing thermonuclear tectonic pulses in the water depths.
                    </p>
                  </div>
                </div>

                {/* Profile: Giant Abyssal Megamouth */}
                <div className="bg-[#001c29] border border-[#005f73]/30 p-4 rounded-xl flex gap-3">
                  <span className="text-4xl select-none filter drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]">👹</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-white font-bold uppercase tracking-tight">Abyssal Titan</h4>
                      <span className="text-[8px] px-1.5 py-0.5 bg-[#ae2012]/80 text-yellow-300 border border-yellow-400/30 rounded font-mono">PREDATOR</span>
                    </div>
                    <span className="text-[10px] text-red-400 block font-mono">"Lured by light, consumed by darkness."</span>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      The giant Megamouth of the obsidian trenches. Possessing highly reactive toxic rows of razor fangs and an organic glowing top bait lure, it pursues heat signatures, hunting down any high-tech explorer.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: SCORING & STAR PROGRESSION */}
          {activeTab === 'progression' && (
            <div className="space-y-6 animate-slide-up" id="codex-progression-tab">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                
                {/* 1 Star Tier */}
                <div className="bg-[#001d3d] border border-[#003566] p-4 rounded-xl flex flex-col items-center">
                  <Star className="w-8 h-8 text-amber-500 fill-amber-500 mb-2" />
                  <h4 className="font-bold text-white text-sm uppercase">Bronze Explorer</h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5 font-bold">1 STAR</span>
                  <p className="text-[11px] text-slate-300 mt-2 leading-tight">
                    Awarded for surviving a level, finding the matching answers, or finishing the race!
                  </p>
                </div>

                {/* 2 Star Tier */}
                <div className="bg-[#001d3d] border border-[#0a9396]/40 p-4 rounded-xl flex flex-col items-center">
                  <div className="flex gap-1 mb-2">
                    <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
                    <Star className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-white text-sm uppercase">Silver Deep Diver</h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5 font-bold">2 STARS</span>
                  <p className="text-[11px] text-slate-300 mt-2 leading-tight">
                    Requires higher scoring tiers, fast reflexes, minimal damage, or high accuracy under pressure!
                  </p>
                </div>

                {/* 3 Star Tier */}
                <div className="bg-[#001d3d] border border-yellow-500/30 p-4 rounded-xl flex flex-col items-center">
                  <div className="flex gap-0.5 mb-2">
                    <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                    <Star className="w-7 h-7 text-yellow-400 fill-yellow-400" />
                  </div>
                  <h4 className="font-bold text-yellow-400 text-sm uppercase">Ocean Poseidon Legend</h4>
                  <span className="text-[10px] text-yellow-500 font-mono block mt-0.5 font-bold">3 STARS</span>
                  <p className="text-[11px] text-slate-300 mt-2 leading-tight">
                    Awarded for perfect identification, compiling maximum treasure shelldust, or surviving with full submarine health!
                  </p>
                </div>

              </div>

              {/* Dynamic Achievements & Locks */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-[#001d3d] border border-[#0a9396]/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-2 right-2 flex items-center gap-1.5 font-mono text-[9px] bg-[#0a9396]/20 border border-[#0a9396]/40 px-2 py-0.5 rounded text-[#94d2bd]">
                  Sonar Sync Status: {starsCount} Stars Earned
                </div>

                <div className="flex items-center gap-3">
                  <Award className="w-10 h-10 text-yellow-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm uppercase">Codex Classified Star Progression</h4>
                    <p className="text-xs text-[#8ecae6] mt-0.5">
                      Gather stars across completed levels (6 stars required cumulative) to unlock the classified Deep Trench files!
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold mb-1">
                    <span>PROGRESSION RADAR</span>
                    <span className={isBonusUnlocked ? "text-emerald-400 font-black animate-pulse" : "text-amber-500 font-black"}>
                      {starsCount} / 6 STARS {isBonusUnlocked ? "(UNLOCKED! ✅)" : "(LOCKED 🔒)"}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        isBonusUnlocked ? 'bg-gradient-to-r from-emerald-500 to-[#94d2bd]' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min((starsCount / 6) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Star Rating Threshold Criteria Detail Card */}
                <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-900 text-xs">
                  <h5 className="font-bold text-slate-200 mb-1 uppercase text-[11px] font-mono">STAR RATING SCORE CARD THRESHOLDS:</h5>
                  <ul className="space-y-1 text-[11px] text-slate-400 leading-normal font-mono">
                    <li>• Level 1 Tani: ⭐ (50 PTS) | ⭐⭐ (120 PTS) | ⭐⭐⭐ (180 PTS)</li>
                    <li>• Level 2 Noam: ⭐ (100 PTS) | ⭐⭐ (250 PTS) | ⭐⭐⭐ (400 PTS)</li>
                    <li>• Level 3 Elyas: ⭐ (100 PTS) | ⭐⭐ (220 PTS) | ⭐⭐⭐ (350 PTS)</li>
                    <li>• Level 4 Dheer: ⭐ (300 PTS) | ⭐⭐ (600 PTS) | ⭐⭐⭐ (950 PTS)</li>
                  </ul>
                </div>

                {/* Lockable Bonus Compartment */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      {isBonusUnlocked ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-4.5 h-4.5 text-red-500" />
                      )}
                      Classified Ancient Deep Trench Lore File
                    </span>
                    {isBonusUnlocked ? (
                      <button
                        type="button"
                        onClick={() => setShowClassified(!showClassified)}
                        className="px-3 py-1 bg-[#0a9396] hover:bg-[#94d2bd] text-[#001219] rounded text-[10px] font-mono font-extrabold uppercase transition-all tracking-wider cursor-pointer"
                      >
                        {showClassified ? <span className="flex items-center gap-1"><EyeOff className="w-3.5 h-3.5" /> Close Classified</span> : <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Read Classified</span>}
                      </button>
                    ) : (
                      <span className="text-[9px] font-mono font-extrabold uppercase bg-red-950/60 text-red-400 px-2 py-0.5 border border-red-900 rounded">
                        LOCKED
                      </span>
                    )}
                  </div>

                  {isBonusUnlocked && showClassified && (
                    <div className="p-4 bg-slate-950/90 border border-[#94d2bd]/30 rounded-lg text-slate-300 space-y-3 font-mono text-[11px] animate-fade-in leading-relaxed">
                      <p className="text-[#94d2bd] font-bold text-xs uppercase border-b border-[#005f73]/20 pb-1 flex items-center gap-1.5 leading-none">
                        <Sparkles className="w-4 h-4" /> CLASSIFIED FILE UNLOCKED: "THE PRIMORDIAL CORES"
                      </p>
                      <p>
                        <strong>Trench Entry #049 - Leviathan Synapses:</strong> Long before the submarines entered, the depths were governed by seismic sonic pulses. These frequencies are called "The Bloops".
                      </p>
                      <p>
                        The Bloop is not merely a creature, but an organic geothermal amplifier. The core on its back reacts with deep uranium thermal deposits, releasing intense atomic thermal heat when agitated.
                      </p>
                      <p>
                        Our probes discovered that <strong>Tani</strong>, <strong>Noam</strong> (with his shell coordinates), and <strong>Elyas</strong> have mapped the precise locations of the thermal buffers which help submersibles survive this tectonic fury. When commander <strong>Dheer</strong> submerges, he pilots on their collective knowledge.
                      </p>
                      <p className="text-yellow-400 text-[10px]">
                        ★ UNLOCKED GOLDEN SUBMARINE HULL SKIN active on deep campaign select!
                      </p>
                    </div>
                  )}

                  {!isBonusUnlocked && (
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-red-950/20 text-[11px] text-slate-500 text-center font-mono uppercase tracking-wider">
                      🔒 CLASSIFIED LEVIATHAN FILE ENCRYPTED. COMPILATION OF 6 STARS REQUIRED TO DECODE SENSOR TRANSMISSION.
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Nav and Dismiss button */}
        <div className="px-6 py-4 border-t border-[#005f73]/25 bg-[#000814]/70 flex justify-between items-center text-xs font-mono text-slate-500">
          <span>Ocean Deep Go Companion Guide</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#0a9396] hover:bg-[#94d2bd] text-[#001219] font-black rounded-lg transition-all active:scale-95 uppercase tracking-wider cursor-pointer"
          >
            Acknowledge Manual
          </button>
        </div>

      </div>
    </div>
  );
};
