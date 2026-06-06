import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Hall of Fame';
  const subtitle = searchParams.get('subtitle') || 'Los usuarios más legendarios de Duobi-Jac';
  const stats = searchParams.get('stats') || '';

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

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
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

        {/* Title */}
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

        {/* Subtitle */}
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

        {/* Stats row */}
        {stats && (
          <div
            style={{
              display: 'flex',
              gap: '40px',
            }}
          >
            {stats.split('|').map((stat) => {
              const [value, label] = stat.split(':');
              return (
                <div key={stat} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '36px',
                      fontWeight: 'bold',
                      color: '#22C55E',
                    }}
                  >
                    {value}
                  </span>
                  <span
                    style={{
                      fontSize: '18px',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
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
    },
  );
}
