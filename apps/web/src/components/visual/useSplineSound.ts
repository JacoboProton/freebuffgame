'use client';

import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'hover' | 'tilt' | 'tooltip';

interface UseSplineSoundOptions {
  enabled?: boolean;
  volume?: number;
}

export function useSplineSound(options: UseSplineSoundOptions = {}) {
  const { enabled = true, volume = 0.15 } = options;
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = 'sine', fadeIn = true) => {
      if (!enabled) return;

      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        if (fadeIn) {
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.05);
        } else {
          gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        }

        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch {
        // Silently fail if audio context is not available
      }
    },
    [enabled, volume, getAudioContext]
  );

  const playHover = useCallback(() => {
    // Soft, warm rising tone
    playTone(523.25, 0.15, 'sine'); // C5
    setTimeout(() => playTone(659.25, 0.12, 'sine'), 50); // E5
  }, [playTone]);

  const playTilt = useCallback(() => {
    // Subtle shimmer
    playTone(880, 0.08, 'sine'); // A5
    setTimeout(() => playTone(1108.73, 0.06, 'sine'), 30); // C#6
  }, [playTone]);

  const playTooltip = useCallback(() => {
    // Gentle pop
    playTone(440, 0.1, 'triangle'); // A4
  }, [playTone]);

  const play = useCallback(
    (type: SoundType) => {
      switch (type) {
        case 'hover':
          playHover();
          break;
        case 'tilt':
          playTilt();
          break;
        case 'tooltip':
          playTooltip();
          break;
      }
    },
    [playHover, playTilt, playTooltip]
  );

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return { play, enabled };
}
