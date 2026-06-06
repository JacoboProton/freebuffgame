import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const BASE_URL = 'https://rxktk3y4.insforge.site';
const API_URL = 'https://rxktk3y4.us-east.insforge.app';

interface HallOfFameEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  totalLegendaryCount: number;
  firstLegendaryAt: string;
  achievements: {
    key: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    unlockedAt: string;
  }[];
}

async function getUserData(userId: string): Promise<HallOfFameEntry | null> {
  try {
    const res = await fetch(`${API_URL}/leaderboard/hall-of-fame`, {
      next: { revalidate: 300 }, // revalidate every 5 minutes
    });
    if (!res.ok) return null;
    const json = await res.json();
    const entry = json.data?.hallOfFame?.find(
      (e: HallOfFameEntry) => e.userId === userId
    );
    return entry || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const user = await getUserData(userId);

  if (!user) {
    return {
      title: 'Usuario no encontrado — Duobi-Jac',
      description: 'Este usuario no está en el Hall of Fame de Duobi-Jac.',
    };
  }

  const ogImageUrl = `${BASE_URL}/api/og?userName=${encodeURIComponent(user.name)}&rank=${user.rank}&legendaryCount=${user.totalLegendaryCount}&level=${user.level}`;
  const title = `#${user.rank} ${user.name} — Hall of Fame | Duobi-Jac`;
  const description = `${user.name} está en el #${user.rank} del Hall of Fame con ${user.totalLegendaryCount} logro${user.totalLegendaryCount > 1 ? 's' : ''} legendario${user.totalLegendaryCount > 1 ? 's' : ''}. Nivel ${user.level} con ${user.xp.toLocaleString()} XP.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/share/${userId}`,
      siteName: 'Duobi-Jac',
      locale: 'es_ES',
      type: 'profile',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await getUserData(userId);

  if (!user) {
    notFound();
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎓</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
            Usuario no encontrado
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            Este usuario no está en el Hall of Fame de Duobi-Jac.
          </p>
        </div>
      </div>
    );
  }

  const initial = user.name[0]?.toUpperCase() || '?';
  const achievementCount = user.achievements?.length || 0;

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
          background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '480px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '40px 32px',
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

        {/* Avatar */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: user.avatar
              ? `url(${user.avatar}) center/cover`
              : 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '42px',
            fontWeight: 'bold',
            border: '3px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          {!user.avatar && initial}
        </div>

        {/* Rank badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '12px',
          }}
        >
          #{user.rank} en el Hall of Fame
        </div>

        {/* Name */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '8px',
            lineHeight: 1.2,
          }}
        >
          {user.name}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
            marginBottom: '24px',
          }}
        >
          Maestro del Conocimiento — Nivel {user.level}
        </p>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            marginBottom: '28px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#F59E0B',
              }}
            >
              {user.totalLegendaryCount}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              Logros Legendarios
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#22C55E',
              }}
            >
              {user.level}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              Nivel
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#8B5CF6',
              }}
            >
              {user.xp.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
              XP Total
            </div>
          </div>
        </div>

        {/* Achievements */}
        {achievementCount > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '28px',
            }}
          >
            {user.achievements.map((ach) => (
              <div
                key={ach.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '13px',
                }}
              >
                <span>{ach.icon}</span>
                <span style={{ opacity: 0.8 }}>{ach.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <a
          href={`${BASE_URL}/register`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #22C55E, #10B981)',
            color: 'white',
            padding: '12px 28px',
            borderRadius: '24px',
            fontSize: '15px',
            fontWeight: '600',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(34,197,94,0.3)',
            transition: 'transform 0.2s',
          }}
        >
          Únete a Duobi-Jac →
        </a>
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
