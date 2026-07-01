import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Music, CloudRain, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Song } from '../types';

interface MusicPlayerProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  hasInteracted: boolean;
}

const PLAYLIST: Song[] = [
  { id: '1', title: 'Soft Piano Chords', artist: 'mysl.', url: '', source: 'piano', type: 'ambient' },
  { id: '2', title: 'Rain Ambience', artist: 'Nature', url: '', source: 'synth', type: 'ambient' },
  { id: '3', title: 'Pass You By', artist: 'Alaina Castillo', url: '', source: 'pop', type: 'song' },
  { id: '4', title: 'Stranger', artist: 'Olivia Rodrigo', url: '', source: 'pop', type: 'song' },
  { id: '5', title: 'Playing Games', artist: 'Summer Walker', url: '', source: 'pop', type: 'song' },
  { id: '6', title: 'Hey There Delilah', artist: "Plain White T's", url: '', source: 'pop', type: 'song' },
];

export default function MusicPlayer({ isPlaying, setIsPlaying, hasInteracted }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  // Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const pianoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAudioInitializedRef = useRef(false);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // Initialize Web Audio
  const initAudio = () => {
    if (isAudioInitializedRef.current || !hasInteracted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
      isAudioInitializedRef.current = true;
    } catch (e) {
      console.error('Failed to initialize AudioContext', e);
    }
  };

  useEffect(() => {
    if (hasInteracted) {
      initAudio();
    }
  }, [hasInteracted]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopSynthesizers();
    };
  }, []);

  // Handle Play / Pause / Track Changes
  useEffect(() => {
    if (!isPlaying) {
      stopSynthesizers();
      return;
    }

    if (hasInteracted) {
      initAudio();
      playTrack();
    }
  }, [isPlaying, currentTrackIndex, hasInteracted]);

  // Stop any active synthesized sounds
  const stopSynthesizers = () => {
    // Stop Rain
    if (rainNodeRef.current) {
      try {
        rainNodeRef.current.disconnect();
      } catch (e) {}
      rainNodeRef.current = null;
    }
    // Stop Piano interval
    if (pianoIntervalRef.current) {
      clearInterval(pianoIntervalRef.current);
      pianoIntervalRef.current = null;
    }
  };

  // Play rain synth
  const playRain = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Stop existing synths first
    stopSynthesizers();

    // Create White Noise source for rain
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter rain frequencies to sound soft
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(380, ctx.currentTime);

    // Dynamic soft wind/movement filter
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // very slow
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(80, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(rainFilter.frequency);
    lfo.start();

    // Create volume node
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.28, ctx.currentTime);

    // Connect nodes
    whiteNoise.connect(rainFilter);
    rainFilter.connect(gainNode);
    gainNode.connect(ctx.destination);

    whiteNoise.start();

    // Keep reference so we can stop it later
    rainNodeRef.current = gainNode as any;
  };

  // Play soft piano chords synth
  const playPianoMelody = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    stopSynthesizers();

    // Warm, soothing chord notes (frequencies in Hz)
    // C Major, F Major 7, A Minor, G Major progressions
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7 (C3, E3, G3, B3)
      [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [110.00, 164.81, 220.00, 261.63], // Amin7 (A2, E3, A3, C4)
      [146.83, 196.00, 246.94, 293.66], // G6 (D3, G3, B3, D4)
    ];

    let chordIdx = 0;

    const playChords = () => {
      if (!ctx || ctx.state === 'suspended') return;
      const notes = chords[chordIdx];
      chordIdx = (chordIdx + 1) % chords.length;

      // Play notes of the chord with beautiful soft Rhodes-like envelope
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Use triangle wave for soft/warm tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15); // subtle arpeggiation

        // Soft attack, long slow release
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(isMuted ? 0 : volume * 0.12, ctx.currentTime + idx * 0.15 + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.15 + 4.5);

        // Warm filtering
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 5);
      });
    };

    // Play right away then every 6 seconds
    playChords();
    const interval = setInterval(playChords, 6000);
    pianoIntervalRef.current = interval;
  };

  // Play covers or hums of selected pop songs
  const playPopCovers = (title: string) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    stopSynthesizers();

    // Map song titles to simple recurring sweet background synth loops
    let scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major
    if (title === 'Stranger') {
      scale = [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00]; // A natural minor
    } else if (title === 'Playing Games') {
      scale = [196.00, 220.00, 246.94, 261.63, 293.66, 329.63, 392.00]; // G major
    }

    const playPopNotes = () => {
      if (!ctx || ctx.state === 'suspended') return;
      // Synthesize a cute, delicate, lullaby music-box pattern
      const length = 4;
      for (let i = 0; i < length; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        
        const note = scale[Math.floor(Math.random() * scale.length)];
        osc.frequency.setValueAtTime(note, ctx.currentTime + i * 0.8);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.8);
        gain.gain.linearRampToValueAtTime(isMuted ? 0 : volume * 0.08, ctx.currentTime + i * 0.8 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.8 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.8);
        osc.stop(ctx.currentTime + i * 0.8 + 1.2);
      }
    };

    playPopNotes();
    const interval = setInterval(playPopNotes, 4000);
    pianoIntervalRef.current = interval;
  };

  const playTrack = () => {
    stopSynthesizers();
    if (currentTrack.source === 'piano') {
      playPianoMelody();
    } else if (currentTrack.source === 'synth') {
      playRain();
    } else {
      playPopCovers(currentTrack.title);
    }
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Adjust current synthesizers volumes when volume changes
  useEffect(() => {
    if (audioCtxRef.current && isPlaying) {
      // Re-trigger/update current gains
      if (currentTrack.source === 'synth' && rainNodeRef.current) {
        const gainNode = rainNodeRef.current as GainNode;
        gainNode.gain.setValueAtTime(isMuted ? 0 : volume * 0.28, audioCtxRef.current.currentTime);
      }
    }
  }, [volume, isMuted, isPlaying, currentTrackIndex]);

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-2">
      {/* Floating Compact Ribbon Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="w-72 glass-panel-pink p-4 rounded-2xl shadow-xl flex flex-col gap-3 text-[#5E3A3A] border border-[#ffb3b8]/40"
          >
            {/* Header / Vinyl Track Info */}
            <div className="flex items-center gap-3">
              <motion.div
                animate={isPlaying ? { rotate: 360 } : {}}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="w-12 h-12 bg-pink-100 rounded-full border-2 border-[#ffb3b8] flex items-center justify-center shadow-sm relative overflow-hidden"
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-1 rounded-full border border-pink-200 opacity-60" />
                <div className="absolute inset-2 rounded-full border border-pink-200 opacity-60" />
                <div className="absolute inset-3 rounded-full border border-pink-200 opacity-60" />
                <div className="w-3 h-3 bg-white rounded-full z-10" />
                {currentTrack.source === 'synth' ? (
                  <CloudRain className="w-4 h-4 text-[#ff808b] absolute" />
                ) : (
                  <Music className="w-4 h-4 text-[#ff808b] absolute" />
                )}
              </motion.div>

              <div className="flex-1 overflow-hidden">
                <p className="font-serif text-sm font-semibold truncate leading-tight">
                  {currentTrack.title}
                </p>
                <p className="font-garamond italic text-xs text-[#8A6D6D]">
                  {currentTrack.artist}
                </p>
              </div>
              <Heart className="w-4 h-4 text-pink-400 fill-pink-300 animate-pulse" />
            </div>

            {/* Visualizer Lines */}
            <div className="flex justify-center items-end gap-1 h-6 px-2 bg-[#FFF5F6]/40 rounded-lg overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={
                    isPlaying
                      ? { height: [4, Math.random() * 20 + 4, 4] }
                      : { height: 4 }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + i * 0.1,
                    ease: 'easeInOut',
                  }}
                  className="w-1 bg-[#ffb3b8] rounded-full"
                />
              ))}
            </div>

            {/* Audio Controls */}
            <div className="flex items-center justify-between gap-2 mt-1">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:bg-white/50 rounded-full transition-colors interactive-obj"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-20 accent-[#ffb3b8] h-1 bg-pink-100 rounded-lg cursor-pointer"
              />

              <div className="flex items-center gap-1.5">
                <button
                  onClick={togglePlay}
                  className="p-2 bg-white/80 hover:bg-[#ffebeb] rounded-full shadow-sm text-[#ff808b] transition-all transform active:scale-95 border border-[#ffb3b8]/30 interactive-obj"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-[#ff808b]" /> : <Play className="w-4 h-4 fill-[#ff808b]" />}
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 hover:bg-white/50 rounded-full transition-all active:translate-x-0.5 interactive-obj"
                  title="Next Track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-12 h-12 rounded-full glass-panel-pink flex items-center justify-center shadow-lg text-[#ff808b] border border-[#ffb3b8]/60 cursor-pointer relative interactive-obj"
      >
        <Music className="w-5 h-5 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-400"></span>
        </span>
      </motion.button>
    </div>
  );
}
