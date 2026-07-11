let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSynthSound(type: "tap" | "correct" | "incorrect" | "badge" | "notif", customPack?: string) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Retrieve active sound pack from argument, or fallback to localStorage, default to 'classic'
    let pack = customPack;
    if (!pack) {
      try {
        pack = localStorage.getItem("dlikon_sound_pack") || "classic";
      } catch (e) {
        pack = "classic";
      }
    }

    if (pack === "retro") {
      // --- RETRO ARCADE (8-Bit NES Style) ---
      switch (type) {
        case "tap": {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(150, now + 0.08);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.09);
          break;
        }
        case "correct": {
          // Classic 8-bit quick ascending arpeggio (C5 -> E5 -> G5 -> C6)
          const retroNotes = [523.25, 659.25, 783.99, 1046.50];
          retroNotes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            gain.gain.setValueAtTime(0, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.06 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.18);
          });
          break;
        }
        case "incorrect": {
          // Retro buzzer "wah-wah" sliding down
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(90, now + 0.25);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.26);
          break;
        }
        case "badge": {
          // Retro short victory melody
          const melody = [523.25, 659.25, 783.99, 659.25, 1046.50, 1318.51];
          melody.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.25);
          });
          break;
        }
        case "notif": {
          // Classic 8-bit double coin sound
          const coinNotes = [987.77, 1318.51];
          coinNotes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "square";
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            gain.gain.setValueAtTime(0, now + idx * 0.06);
            gain.gain.linearRampToValueAtTime(0.07, now + idx * 0.06 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.06);
            osc.stop(now + idx * 0.06 + 0.18);
          });
          break;
        }
      }
    } else if (pack === "zen") {
      // --- NATURE ZEN (Soft organic, meditation bells & bamboo) ---
      switch (type) {
        case "tap": {
          // Gentle bubble/wood knock
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }
        case "correct": {
          // Soft pentatonic meditation chime
          const zenNotes = [440.00, 493.88, 587.33, 659.25, 783.99]; // A4, B4, D5, E5, G5
          zenNotes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            gain.gain.setValueAtTime(0, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.05 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.9);
          });
          break;
        }
        case "incorrect": {
          // Soft wooden thud
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.linearRampToValueAtTime(80, now + 0.15);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
          break;
        }
        case "badge": {
          // Serene singing bowl resonance
          const bowlNotes = [220.00, 330.00, 440.00, 554.37];
          bowlNotes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.04, now + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0 + idx * 0.1);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 2.5);
          });
          break;
        }
        case "notif": {
          // Soft high temple bell chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(880, now);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.3);
          break;
        }
      }
    } else if (pack === "synth") {
      // --- FUTURISTIC SYNTH (Sci-Fi, digital click, cybernetic laser) ---
      switch (type) {
        case "tap": {
          // Sharp cybernetic UI click
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(1500, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case "correct": {
          // Futuristic laser upward-slide with digital chime
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();
          
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
          
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(500, now);
          filter.frequency.exponentialRampToValueAtTime(2500, now + 0.25);
          
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now);
          osc.stop(now + 0.32);
          break;
        }
        case "incorrect": {
          // Low cyberpunk error sweep
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.linearRampToValueAtTime(70, now + 0.3);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.32);
          break;
        }
        case "badge": {
          // Cyber space-glide cinematic sweeps
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(80, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.3);
          
          // Chime on top
          const highOsc = ctx.createOscillator();
          const highGain = ctx.createGain();
          highOsc.type = "sine";
          highOsc.frequency.setValueAtTime(1760, now + 0.6);
          highGain.gain.setValueAtTime(0, now + 0.6);
          highGain.gain.linearRampToValueAtTime(0.05, now + 0.6 + 0.05);
          highGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
          highOsc.connect(highGain);
          highGain.connect(ctx.destination);
          highOsc.start(now + 0.6);
          highOsc.stop(now + 1.6);
          break;
        }
        case "notif": {
          // Cyber alert beep
          const tones = [980, 1180];
          tones.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.04);
            gain.gain.setValueAtTime(0, now + idx * 0.04);
            gain.gain.linearRampToValueAtTime(0.07, now + idx * 0.04 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.04);
            osc.stop(now + 0.45);
          });
          break;
        }
      }
    } else {
      // --- CLASSIC SPARK (The beautifully crafted defaults) ---
      switch (type) {
        case "tap": {
          // Quick subtle interface pop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
          
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case "correct": {
          // Joyful ascending arpeggio (C Major)
          const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            
            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.5);
          });
          break;
        }

        case "incorrect": {
          // Non-punishing gentle chord, slightly dreamy
          const notes = [196.00, 246.94, 293.66, 349.23]; // G3, B3, D4, F4 (G Dominant 7th for suspense)
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.linearRampToValueAtTime(freq - 10, now + 0.5);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + idx * 0.05);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now);
            osc.stop(now + 0.6);
          });
          break;
        }

        case "badge": {
          // Grand cinematic sweep & chime chord (D major add9)
          const chord = [146.83, 220.00, 293.66, 370.01, 440.00, 587.33, 739.99]; // D2, A3, D4, F#4, A4, D5, F#5
          
          // Synth sweep
          const sweepOsc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const sweepGain = ctx.createGain();
          
          sweepOsc.type = "sawtooth";
          sweepOsc.frequency.setValueAtTime(73.42, now); // D2
          
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(200, now);
          filter.frequency.exponentialRampToValueAtTime(2000, now + 0.8);
          
          sweepGain.gain.setValueAtTime(0.06, now);
          sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          
          sweepOsc.connect(filter);
          filter.connect(sweepGain);
          sweepGain.connect(ctx.destination);
          
          sweepOsc.start(now);
          sweepOsc.stop(now + 1.3);

          // High crystal chimes
          chord.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + 0.15);
            
            gain.gain.setValueAtTime(0, now + 0.15);
            gain.gain.linearRampToValueAtTime(0.06, now + 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5 + idx * 0.1);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + 0.15);
            osc.stop(now + 2.0);
          });
          break;
        }

        case "notif": {
          // High dual-tone bell chime (A5 & E6)
          const tones = [880.00, 1318.51];
          tones.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);
            
            gain.gain.setValueAtTime(0, now + idx * 0.05);
            gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.05 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + idx * 0.05);
            osc.stop(now + 0.6);
          });
          break;
        }
      }
    }
  } catch (error) {
    console.warn("Web Audio API is not supported or was blocked by browser autoplay rules.", error);
  }
}
