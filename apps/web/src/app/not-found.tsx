export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#0a0a0a',
      color: '#ffffff'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <p style={{ fontSize: '1.25rem', color: '#888' }}>Página no encontrada</p>
      <a 
        href="/" 
        style={{ 
          marginTop: '2rem', 
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '0.5rem',
          textDecoration: 'none'
        }}
      >
        Volver al inicio
      </a>
    </div>
  );
}