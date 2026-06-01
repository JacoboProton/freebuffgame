declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    colors?: string[];
    origin?: { x?: number; y?: number };
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    target?: HTMLElement | null;
    scalar?: number;
    shapes?: ('square' | 'circle')[];
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: Options): Promise<null>;
  namespace confetti {
    function reset(): void;
    function create(type: string): (options?: Options) => Promise<null>;
  }

  export = confetti;
}