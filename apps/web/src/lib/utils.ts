import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function extractPlaybackId(url: string): string {
  // Handles:
  // - https://stream.mux.com/{playbackId}.m3u8
  // - https://player.mux.com/{playbackId}
  // - raw playbackId
  const match = url.match(/\/([A-Za-z0-9_-]+)(?:\.m3u8)?(?:\/|$)/);
  return match ? match[1] : url;
}