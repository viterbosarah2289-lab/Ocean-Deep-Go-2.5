/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private bgmIntervalId: any = null;
  private bgmStep: number = 0;
  private currentLevel: string | null = null;

  public setLevel(level: string | null) {
    this.currentLevel = level;
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startAdventureBGM() {
    if (this.bgmIntervalId) return;
    this.init();
    if (!this.ctx) return;
    
    this.bgmStep = 0;
    this.bgmIntervalId = setInterval(() => {
      if (!this.enabled || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        try { this.ctx.resume(); } catch(e) {}
        return;
      }
      
      const time = this.ctx.currentTime;
      // 120 bpm = 4 steps per second (250ms per step)
      const beat = this.bgmStep % 16;
      const lvl = this.currentLevel;
      
      if (lvl === 'level1') {
        // --- LEVEL 1: TANI'S BIOLUMINESCENT MEMORY ---
        // Suspenseful yet magical "neon glowing ocean" bell chime theme
        
        // 1. Slow, deep ambient sub-bass drone on steps 0 and 8
        if (beat === 0 || beat === 8) {
          try {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(55.0, time); // A1 low warm tone
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(100, time);
            
            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 1.8);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 1.9);
          } catch (e) {}
        }
        
        // 2. Playful sparkling bell chime melody that rolls like biological light
        // Pentatonic major scale of C (enjoyable & positive but mysterious)
        const bellScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99];
        // Bell plays on select rhythmic divisions
        const bellActive = [0, 2, 3, 5, 8, 10, 11, 13];
        if (bellActive.includes(beat)) {
          try {
            const carrier = this.ctx.createOscillator();
            const modulator = this.ctx.createOscillator();
            const modGain = this.ctx.createGain();
            const mainGain = this.ctx.createGain();
            
            const noteVal = bellScale[(beat + Math.floor(this.bgmStep / 16) * 3) % bellScale.length];
            
            carrier.type = 'sine';
            carrier.frequency.setValueAtTime(noteVal, time);
            
            // Frequency Modulation (FM) synthesis for beautiful bell chime metal textures
            modulator.frequency.setValueAtTime(noteVal * 2.5, time);
            modGain.gain.setValueAtTime(noteVal * 1.5, time);
            modGain.gain.exponentialRampToValueAtTime(noteVal * 0.1, time + 0.3);
            
            mainGain.gain.setValueAtTime(0.04, time);
            mainGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.35);
            
            modulator.connect(modGain);
            modGain.connect(carrier.frequency);
            
            carrier.connect(mainGain);
            mainGain.connect(this.ctx.destination);
            
            modulator.start(time);
            carrier.start(time);
            modulator.stop(time + 0.4);
            carrier.stop(time + 0.4);
          } catch(e) {}
        }
        
        // 3. Constant digital radar sweep ticking for depth suspense
        if (beat % 2 === 0) {
          try {
            const tick = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            tick.type = 'sine';
            // Alternates high/low ticking
            const f = beat % 4 === 0 ? 1600 : 1200;
            tick.frequency.setValueAtTime(f, time);
            
            gain.gain.setValueAtTime(0.015, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
            
            tick.connect(gain);
            gain.connect(this.ctx.destination);
            tick.start(time);
            tick.stop(time + 0.06);
          } catch(e) {}
        }
      }
      else if (lvl === 'level2') {
        // --- LEVEL 2: NOAM'S TURTLE DERBY BOARD GAME ---
        // Playful, cheerful, and strategic yacht-rock style adventure groove
        
        // 1. Double walking bassline – optimistic, bouncy and enjoyable
        const walkingBass = [130.81, 146.83, 164.81, 196.00, 220.00, 196.00, 164.81, 146.83, 110.00, 123.47, 130.81, 146.83, 164.81, 196.00, 146.83, 110.00];
        try {
          const bassOsc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const bassGain = this.ctx.createGain();
          
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(walkingBass[beat], time);
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, time);
          
          bassGain.gain.setValueAtTime(0.12, time);
          bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
          
          bassOsc.connect(filter);
          filter.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          
          bassOsc.start(time);
          bassOsc.stop(time + 0.24);
        } catch(e) {}
        
        // 2. Steel-drum tropical upbeat bubble melody
        const drumMelody = [392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00];
        // Plays on off-beats for bouncy, lively syncopation (very enjoyable!)
        if (beat % 2 === 1) {
          try {
            const steelOsc = this.ctx.createOscillator();
            const steelGain = this.ctx.createGain();
            steelOsc.type = 'sine';
            
            const melodyIndex = (Math.floor(beat / 2) + Math.floor(this.bgmStep / 16)) % drumMelody.length;
            steelOsc.frequency.setValueAtTime(drumMelody[melodyIndex], time);
            // pitch bend up slightly like a happy droplet
            steelOsc.frequency.exponentialRampToValueAtTime(drumMelody[melodyIndex] * 1.05, time + 0.15);
            
            steelGain.gain.setValueAtTime(0.045, time);
            steelGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            
            steelOsc.connect(steelGain);
            steelGain.connect(this.ctx.destination);
            steelOsc.start(time);
            steelOsc.stop(time + 0.16);
          } catch(e) {}
        }
        
        // 3. Shaker sound effect simulated with synthesized noise on every 4th step
        if (beat % 4 === 2) {
          try {
            const noise = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            
            // Fast random-like sawtooth acting as white noise spectrum
            noise.type = 'sawtooth';
            noise.frequency.setValueAtTime(10000, time);
            
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(6000, time);
            
            gain.gain.setValueAtTime(0.02, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            noise.start(time);
            noise.stop(time + 0.06);
          } catch(e) {}
        }
      }
      else if (lvl === 'level3') {
        // --- LEVEL 3: ELYAS' RAPID SQUID DEFENSE ARCADE ---
        // Energetic driving subaquatic techno-battle! Super high stakes, fast, lively
        
        // 1. Hyper-driving bassline that loops quickly
        const technoBass = [65.41, 65.41, 77.78, 65.41, 87.31, 87.31, 98.00, 110.00, 65.41, 65.41, 77.78, 65.41, 130.81, 116.54, 98.00, 77.78];
        try {
          const bassLines = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          
          bassLines.type = 'sawtooth';
          bassLines.frequency.setValueAtTime(technoBass[beat] * 1.5, time);
          
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, time);
          
          gain.gain.setValueAtTime(0.12, time);
          // Very punchy, aggressive attack & decay
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
          
          bassLines.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          
          bassLines.start(time);
          bassLines.stop(time + 0.2);
        } catch(e) {}
        
        // 2. High laser synth lead sequencing - rapid fire action theme
        // Ascending-descending adrenaline motif
        const laserScale = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
        if (beat % 2 === 1) {
          try {
            const synthLead = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            
            const i = (beat + Math.floor(this.bgmStep / 16) * 2) % laserScale.length;
            synthLead.type = 'triangle';
            synthLead.frequency.setValueAtTime(laserScale[i], time);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1500, time);
            filter.frequency.exponentialRampToValueAtTime(600, time + 0.15);
            
            gain.gain.setValueAtTime(0.05, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            
            synthLead.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            synthLead.start(time);
            synthLead.stop(time + 0.16);
          } catch(e) {}
        }
        
        // 3. Energetic electronic techno snare / high-hat on steps 4, 8, 12
        if (beat % 4 === 0) {
          try {
            const hihat = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            hihat.type = 'sawtooth';
            // Extreme detuned buzz to simulate a snare drum crack
            hihat.frequency.setValueAtTime(400, time);
            hihat.frequency.exponentialRampToValueAtTime(100, time + 0.08);
            
            gain.gain.setValueAtTime(0.03, time);
            gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
            
            hihat.connect(gain);
            gain.connect(this.ctx.destination);
            hihat.start(time);
            hihat.stop(time + 0.09);
          } catch(e) {}
        }
      }
      else if (lvl === 'level4') {
        // --- LEVEL 4: DHEER'S CRITICAL DEEP BLOOP SURVIVAL ---
        // Cinema suspense at maximum! Thick doom-laden orbital base with heroic, energetic, survival-focused layers
        
        // 1. Massive cinematic reese-bass (detuned dual sawtooth for extreme depth)
        if (beat % 4 === 0) {
          try {
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(48.99, time); // G1 extreme pressure bass
            
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(49.2, time); // detuned by few Hz for dynamic beating wobble
            
            filter.type = 'lowpass';
            // Dark filter sweep over 0.8 seconds
            filter.frequency.setValueAtTime(120, time);
            filter.frequency.exponentialRampToValueAtTime(260, time + 0.8);
            
            gain.gain.setValueAtTime(0.20, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);
            
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc1.start(time);
            osc2.start(time);
            osc1.stop(time + 0.95);
            osc2.stop(time + 0.95);
          } catch(e) {}
        }
        
        // 2. High epic heroic brassy lead synthesizer motif - adventurous tension
        // Minor melody: Bb4 -> Ab4 -> G4 -> Eb4 -> D4 -> G4
        const survivalMelody = [466.16, 415.30, 392.00, 311.13, 293.66, 392.00, 466.16, 587.33];
        const leadSteps = [0, 2, 4, 6, 8, 10, 12, 14];
        if (leadSteps.includes(beat)) {
          try {
            const leadOsc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const leadGain = this.ctx.createGain();
            
            const scaleIdx = (beat / 2 + Math.floor(this.bgmStep / 16)) % survivalMelody.length;
            leadOsc.type = 'sawtooth';
            leadOsc.frequency.setValueAtTime(survivalMelody[scaleIdx], time);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(700, time);
            filter.Q.setValueAtTime(3.0, time);
            
            leadGain.gain.setValueAtTime(0.05, time);
            leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
            
            leadOsc.connect(filter);
            filter.connect(leadGain);
            leadGain.connect(this.ctx.destination);
            
            leadOsc.start(time);
            leadOsc.stop(time + 0.45);
          } catch(e) {}
        }
        
        // 3. Periodic sonar resonant radar ping echo
        if (beat === 1) {
          try {
            const sonar = this.ctx.createOscillator();
            const sonarGain = this.ctx.createGain();
            sonar.type = 'sine';
            sonar.frequency.setValueAtTime(1500, time);
            sonar.frequency.exponentialRampToValueAtTime(1100, time + 1.6);
            
            sonarGain.gain.setValueAtTime(0.05, time);
            sonarGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);
            
            sonar.connect(sonarGain);
            sonarGain.connect(this.ctx.destination);
            sonar.start(time);
            sonar.stop(time + 1.7);
          } catch(e) {}
        }
        
        // 4. Constant ticking clock simulation of reactor leak countdown status
        try {
          const click = this.ctx.createOscillator();
          const clickGain = this.ctx.createGain();
          click.type = 'triangle';
          click.frequency.setValueAtTime(1800 + Math.random() * 600, time);
          
          clickGain.gain.setValueAtTime(0.012, time);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);
          
          click.connect(clickGain);
          clickGain.connect(this.ctx.destination);
          click.start(time);
          click.stop(time + 0.04);
        } catch(e) {}
      }
      else {
        // --- MAIN MENU & GENERAL ADVENTURE THEME ---
        // Epic marching orchestral synth theme – highly energetic, lively, and inviting
        
        // 1. Driving energetic bass rhythm
        // Bass progression in D minor
        const menuBass = [73.42, 73.42, 87.31, 87.31, 98.00, 98.00, 110.00, 110.00, 65.41, 65.41, 73.42, 73.42, 55.00, 55.00, 65.41, 110.00];
        try {
          const bass = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          
          bass.type = 'sawtooth';
          bass.frequency.setValueAtTime(menuBass[beat], time);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(280, time);
          
          gain.gain.setValueAtTime(0.14, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
          
          bass.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          bass.start(time);
          bass.stop(time + 0.25);
        } catch (e) {}
        
        // 2. High adventurous arpeggio soaring over deep sea currents
        // Bright, triumphant minor/major scale walk
        const menuArpeggio = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
        // Plays with faster gallop beats on 1, 3, 5, 7, 9, 11, 13, 15
        if (beat % 2 === 1) {
          try {
            const lead = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            lead.type = 'sine';
            
            const index = (Math.floor(beat / 2) + Math.floor(this.bgmStep / 16)) % menuArpeggio.length;
            lead.frequency.setValueAtTime(menuArpeggio[index], time);
            
            gain.gain.setValueAtTime(0.045, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
            
            lead.connect(gain);
            gain.connect(this.ctx.destination);
            lead.start(time);
            lead.stop(time + 0.22);
          } catch(e) {}
        }
        
        // 3. Ambient deep bubbler sweep on major bar entrances
        if (beat === 0) {
          try {
            const sweep = this.ctx.createOscillator();
            const gainSweep = this.ctx.createGain();
            sweep.type = 'sine';
            sweep.frequency.setValueAtTime(100, time);
            sweep.frequency.exponentialRampToValueAtTime(480, time + 1.2);
            
            gainSweep.gain.setValueAtTime(0.02, time);
            gainSweep.gain.exponentialRampToValueAtTime(0.001, time + 1.2);
            
            sweep.connect(gainSweep);
            gainSweep.connect(this.ctx.destination);
            sweep.start(time);
            sweep.stop(time + 1.2);
          } catch (e) {}
        }
      }
      
      this.bgmStep++;
    }, 250);
  }

  public stopAdventureBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public toggle(state?: boolean) {
    this.enabled = state !== undefined ? state : !this.enabled;
    if (!this.enabled) {
      this.stopAdventureBGM();
    } else {
      this.startAdventureBGM();
    }
    return this.enabled;
  }

  public isEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.2, endFreq?: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      o.type = type;
      o.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (endFreq !== undefined) {
        o.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      }

      g.gain.setValueAtTime(volume, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      o.connect(g);
      g.connect(this.ctx.destination);

      o.start();
      o.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio Context tone fail', e);
    }
  }

  public playBubble() {
    // High frequency popping pluck
    this.playTone(350, 'sine', 0.15, 0.3, 1000);
  }

  public playClick() {
    this.playTone(600, 'sine', 0.08, 0.15, 120);
  }

  public playSwoosh() {
    this.playTone(150, 'sawtooth', 0.3, 0.15, 450);
  }

  public playDice() {
    let delay = 0;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        this.playTone(400 - i * 40, 'triangle', 0.08, 0.2);
      }, delay);
      delay += 80;
    }
  }

  public playShield() {
    this.playTone(200, 'sine', 0.4, 0.2, 800);
  }

  public playHealth() {
    this.playTone(300, 'triangle', 0.4, 0.2, 600);
  }

  public playSpeed() {
    this.playTone(400, 'sawtooth', 0.3, 0.15, 900);
  }

  public playPowerUp() {
    this.playTone(261.63, 'sine', 0.12, 0.2); // C4
    setTimeout(() => this.playTone(329.63, 'sine', 0.12, 0.2), 100); // E4
    setTimeout(() => this.playTone(392.00, 'sine', 0.12, 0.2), 200); // G4
    setTimeout(() => this.playTone(523.25, 'sine', 0.3, 0.2), 300); // C5
  }

  public playSiren() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(250, this.ctx.currentTime);
      o.frequency.linearRampToValueAtTime(500, this.ctx.currentTime + 0.4);
      o.frequency.linearRampToValueAtTime(250, this.ctx.currentTime + 0.8);
      o.frequency.linearRampToValueAtTime(500, this.ctx.currentTime + 1.2);
      o.frequency.linearRampToValueAtTime(250, this.ctx.currentTime + 1.6);
      
      g.gain.setValueAtTime(0.12, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 1.4);
      g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.8);

      o.connect(g);
      g.connect(this.ctx.destination);
      o.start();
      o.stop(this.ctx.currentTime + 1.8);
    } catch(e) {}
  }

  public playNuclearExplosion() {
    // Heavy detuned noise-like explosion
    this.playTone(120, 'sawtooth', 1.6, 0.4, 30);
    setTimeout(() => {
      this.playTone(80, 'triangle', 1.2, 0.5, 20);
    }, 150);
  }

  public playSuccess() {
    // Elegant major chord sequence
    const notes = [261.6, 329.6, 392.0, 523.3, 659.3];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.3, 0.25, f * 1.1);
      }, idx * 110);
    });
  }

  public playDefeat() {
    // Sad minor scale descent
    const notes = [311.1, 293.7, 261.6, 196.0];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 'sawtooth', 0.4, 0.25, f * 0.8);
      }, idx * 160);
    });
  }
}

export const audio = new SoundSystem();
