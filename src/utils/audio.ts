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

export function playSynthSound(type: "tap" | "correct" | "incorrect" | "badge" | "notif") {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

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
  } catch (error) {
    console.warn("Web Audio API is not supported or was blocked by browser autoplay rules.", error);
  }
}
