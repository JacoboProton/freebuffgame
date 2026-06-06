import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Renders a per-user Hall of Fame OG card when userName+rank are provided,
// or the generic Hall of Fame card when they are not.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Per-user params
  const userName = searchParams.get('userName');
  const rank = searchParams.get('rank');
  const legendaryCount = searchParams.get('legendaryCount');
  const level = searchParams.get('level');

  // Generic params (fallback)
  const title = searchParams.get('title') || 'Hall of Fame';
  const subtitle = searchParams.get('subtitle') || 'Los usuarios más legendarios de Duobi-Jac';
  const stats = searchParams.get('stats') || '';

  const isPerUser = userName && rank;

  // Rank badge colors
  const rankColors: Record<string, { bg: string; text: string; label: string }> = {
    '1': { bg: 'linear-gradient(135deg, #F59E0B, #D97706)', text: '#FEF3C7', label: '🥇 #1' },
    '2': { bg: 'linear-gradient(135deg, #9CA3AF, #6B7280)', text: '#F3F4F6', label: '🥈 #2' },
    '3': { bg: 'linear-gradient(135deg, #D97706, #B45309)', text: '#FEF3C7', label: '🥉 #3' },
  };

  const rc = rankColors[rank || ''] || { bg: 'linear-gradient(135deg, #6366F1, #4F46E5)', text: '#E0E7FF', label: `#${rank}` };

  const initial = (userName || '?')[0].toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '60px',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          }}
        />
        {isPerUser && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: isPerUser ? '32px' : '40px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #22C55E, #10B981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            D
          </div>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: 'white',
              letterSpacing: '-0.5px',
            }}
          >
            Duobi-Jac
          </span>
        </div>

        {isPerUser ? (
          <>
            {/* Per-user card layout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '32px' }}>
              {/* Avatar circle with initial */}
              <div
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '60px',
                  background: rc.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '56px',
                  fontWeight: 'bold',
                  color: 'white',
                  border: '4px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                {initial}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Rank badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: rc.bg,
                    color: rc.text,
                    padding: '8px 20px',
                    borderRadius: '24px',
                    fontSize: '22px',
                    fontWeight: 'bold',
                    width: 'fit-content',
                  }}
                >
                  {rc.label}
                </div>
                {/* User name */}
                <div
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: 'white',
                    lineHeight: '1.1',
                    letterSpacing: '-1.5px',
                  }}
                >
                  {userName}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '48px' }}>
              {legendaryCount && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '42px', fontWeight: 'bold', color: '#F59E0B' }}>
                    {legendaryCount}
                  </span>
                  <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>
                    Logros Legendarios
                  </span>
                </div>
              )}
              {level && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '42px', fontWeight: 'bold', color: '#22C55E' }}>
                    {level}
                  </span>
                  <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>
                    Nivel
                  </span>
                </div>
              )}
            </div>

            {/* Tagline */}
            <div
              style={{
                position: 'absolute',
                bottom: '60px',
                left: '60px',
                right: '60px',
                fontSize: '20px',
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
              }}
            >
              Hall of Fame — Duobi-Jac
            </div>
          </>
        ) : (
          <>
            {/* Generic card (original) */}
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: 'white',
                lineHeight: '1.1',
                marginBottom: '16px',
                letterSpacing: '-2px',
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: '28px',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: '1.4',
                marginBottom: stats ? '32px' : '0',
                maxWidth: '800px',
              }}
            >
              {subtitle}
            </div>

            {stats && (
              <div style={{ display: 'flex', gap: '40px' }}>
                {stats.split('|').map((stat) => {
                  const [value, label] = stat.split(':');
                  return (
                    <div key={stat} style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#22C55E' }}>
                        {value}
                      </span>
                      <span style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)' }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #22C55E, #3B82F6, #8B5CF6)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // Per-user images: 5 min cache (user data can change)
        // Generic images: 1 day cache (static content)
        'Cache-Control': isPerUser
          ? 'public, s-maxage=300, max-age=300, stale-while-revalidate=600'
          : 'public, s-maxage=86400, max-age=86400, stale-while-revalidate=172800',
      },
    },
  );
}
