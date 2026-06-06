import Link from 'next/link';

export default function ShareNotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative orbs */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '420px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '48px 32px',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #22C55E, #10B981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            D
          </div>
          <span style={{ fontSize: '16px', fontWeight: '600', opacity: 0.8 }}>
            Duobi-Jac
          </span>
        </div>

        {/* Icon */}
        <div
          style={{
            fontSize: '72px',
            marginBottom: '20px',
            opacity: 0.6,
          }}
        >
          🎓
        </div>

        {/* Code */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #EF4444, #F97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1,
            marginBottom: '12px',
          }}
        >
          404
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '12px',
          }}
        >
          Usuario no encontrado
        </h1>

        {/* Description */}
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '15px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          Este usuario no está en el Hall of Fame de Duobi-Jac o el enlace no es válido.
        </p>

        {/* CTA */}
        <Link
          href="/hall-of-fame"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '24px',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
            marginBottom: '16px',
          }}
        >
          Ver Hall of Fame
        </Link>

        <div>
          <Link
            href="/"
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              textDecoration: 'underline',
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #22C55E, #3B82F6, #8B5CF6)',
        }}
      />
    </div>
  );
}
