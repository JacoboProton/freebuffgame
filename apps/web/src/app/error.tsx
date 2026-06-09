'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#0a0a0a',
        color: '#ffffff',
      }}
    >
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Algo salió mal
      </h2>
      <p style={{ color: '#888', marginBottom: '2rem', textAlign: 'center' }}>
        {error.message || 'Ha ocurrido un error inesperado'}
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Reintentar
      </button>
    </div>
  );
}