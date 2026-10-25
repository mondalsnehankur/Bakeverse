// Synthesized Web Audio API Chime generator
// Plays a warm, whimsical pentatonic bell/chime chord when 3D treats are clicked

let audioCtx = null;

export const playBakeryChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Pentatonic frequencies in high whimsical octave: C6 (1046.5), E6 (1318.5), G6 (1567.98), A6 (1760.0), C7 (2093.0)
    const pitches = [1046.5, 1318.51, 1567.98, 2093.0];
    // Pick 2 harmonious pitches
    const p1 = pitches[Math.floor(Math.random() * pitches.length)];
    const p2 = p1 * 1.25; // major third interval

    [p1, p2].forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);

      // Sweet bell envelope: instant attack, gentle exponential decay
      gain.gain.setValueAtTime(0.001, now + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.05 + 0.65);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.7);
    });
  } catch (err) {
    console.warn('Web Audio API chime could not play:', err);
  }
};
