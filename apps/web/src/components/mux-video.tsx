'use client';

import { useEffect, useRef } from 'react';
import mux from 'mux-embed';

interface MuxVideoProps {
  playbackId: string;
  envKey?: string;
  title?: string;
  className?: string;
  onReady?: () => void;
  /** Player type: 'video' uses HLS via <video> tag (default), 'iframe' uses Mux's iframe embed */
  playerType?: 'video' | 'iframe';
}

export function MuxVideo({
  playbackId,
  envKey = process.env.NEXT_PUBLIC_MUX_ENV_KEY || '',
  title = '',
  className = '',
  onReady,
  playerType = 'video',
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

  const posterUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;

  // Iframe embed — no HLS, just an iframe pointing to Mux's player
  if (playerType === 'iframe') {
    const params = title
      ? `?metadata-video-title=${encodeURIComponent(title)}&video-title=${encodeURIComponent(title)}`
      : '';
    const iframeSrc = `https://player.mux.com/${playbackId}${params}`;
    return (
      <div className={`relative rounded-xl overflow-hidden bg-black ${className}`} style={{ aspectRatio: '16/9' }}>
        <iframe
          src={iframeSrc}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          onLoad={onReady}
        />
      </div>
    );
  }

  // HLS video player via <video> tag
  const hlsUrl = `https://stream.mux.com/${playbackId}.m3u8`;

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
