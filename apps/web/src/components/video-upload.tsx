'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClerkAPI } from '@/lib/clerk-api';

interface VideoUploadProps {
  onUploadComplete: (playbackId: string, videoUrl: string) => void;
  currentVideoUrl?: string;
  className?: string;
}

export function VideoUpload({ onUploadComplete, currentVideoUrl, className }: VideoUploadProps) {
  const { fetchAPI } = useClerkAPI();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [uploadedPlaybackId, setUploadedPlaybackId] = useState<string | null>(currentVideoUrl ? extractPlaybackId(currentVideoUrl) : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function extractPlaybackId(url: string): string | null {
    const match = url.match(/stream\.mux\.com\/([^.]+)/);
    return match ? match[1] : null;
  }

  const uploadToMux = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    setStatus('uploading');
    setError(null);

    try {
      // 1. Get upload URL from our API
      const uploadData = await fetchAPI<{ uploadId: string; uploadUrl: string }>(
        '/video/upload',
        { method: 'POST', body: JSON.stringify({ title: file.name }) }
      );

      // 2. Upload file directly to Mux using XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadData.uploadUrl);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload network error'));
        xhr.send(file);
      });

      setStatus('processing');
      setProgress(100);

      // 3. Poll for completion and get playbackId
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout

      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 1000));

        const statusData = await fetchAPI<{
          status: string;
          playbackId?: string;
          assetId?: string;
        }>(`/video/upload/${uploadData.uploadId}`);

        if (statusData.playbackId) {
          const playbackId = statusData.playbackId;
          setUploadedPlaybackId(playbackId);
          const videoUrl = `https://stream.mux.com/${playbackId}.m3u8`;
          onUploadComplete(playbackId, videoUrl);
          setStatus('done');
          setUploading(false);
          return;
        }

        attempts++;
      }

      throw new Error('Timeout waiting for video processing');
    } catch (err: any) {
      setError(err.message || 'Error uploading video');
      setStatus('error');
      setUploading(false);
    }
  }, [fetchAPI, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      uploadToMux(file);
    } else {
      setError('Por favor selecciona un archivo de video válido');
      setStatus('error');
    }
  }, [uploadToMux]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadToMux(file);
    }
  };

  const handleRemove = () => {
    setUploadedPlaybackId(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {uploadedPlaybackId ? (
        <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Video cargado</p>
              <p className="text-xs text-emerald-600">ID: {uploadedPlaybackId}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-emerald-100 rounded transition-colors"
            title="Eliminar video"
          >
            <X className="w-4 h-4 text-emerald-700" />
          </button>
        </div>
      ) : uploading ? (
        <div className="space-y-3 p-4 border-2 border-dashed rounded-xl">
          {status === 'uploading' && (
            <>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium">Subiendo a Mux...</span>
                <span className="text-sm text-gray-500 ml-auto">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          )}
          {status === 'processing' && (
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
              <span className="text-sm font-medium">Procesando video...</span>
            </div>
          )}
          <p className="text-xs text-gray-400 text-center">No cierres esta página</p>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all',
            dragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <Upload className={cn('w-8 h-8', dragging ? 'text-blue-600' : 'text-gray-400')} />
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Arrastra tu video aquí o <span className="text-blue-600 underline">explora</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI • Máximo 2GB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {status === 'error' && error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {currentVideoUrl && !uploadedPlaybackId && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Film className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Video actual adjunto</span>
        </div>
      )}
    </div>
  );
}