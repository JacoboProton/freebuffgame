'use client';

import { useEffect, useRef } from 'react';
import mux from 'mux-embed';

interface MuxVideoProps {
  playbackId: string;
  envKey?: string;
  title?: string;
  className?: string;
  onReady?: () => void;
}

export function MuxVideo({
  playbackId,
  envKey = process.env.NEXT_PUBLIC_MUX_ENV_KEY || '',
  title = '',
  className = '',
  onReady,
}: MuxVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoRef.current || !playbackId) return;

    const video = videoRef.current;

    // Initialize mux-embed for analytics tracking (skip if no env key)
    if (envKey) {
      (mux as any).init(video, {
        env_key: envKey,
        metadata: {
          video_title: title,
          video_id: playbackId,
          player_name: 'Duobi-Jac Player',
        },
      });
    }

    // Emit custom video data when ready
    const handleCanPlay = () => {
      onReady?.();
    };

    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      if (envKey) {
        (mux as any).destroy(video);
      }
    };
  }, [playbackId, envKey, title, onReady]);

  if (!playbackId) return null;

  const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;
  const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;

  return (
    <div ref={containerRef} className={`relative rounded-xl overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        playsInline
        preload="metadata"
        poster={posterUrl}
      >
        <source src={hlsUrl} type="application/x-mpegURL" />
        <source src={`https://stream.mux.com/${playbackId}.mp4`} type="video/mp4" />
        Tu navegador no soporta la reproducción de video.
      </video>
    </div>
  );
}
