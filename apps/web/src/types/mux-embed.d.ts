declare module 'mux-embed' {
  export function init(video: HTMLVideoElement, options: {
    env_key?: string;
    metadata?: Record<string, any>;
    [key: string]: any;
  }): void;
  export function destroy(video?: HTMLVideoElement): void;
}
