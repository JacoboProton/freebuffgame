import type { Metadata } from 'next';
import { HallOfFameClient } from './page-client';

const BASE_URL = 'https://rxktk3y4.insforge.site';
const OG_API = `${BASE_URL}/api/og`;

const defaultOgImage = `${OG_API}?title=Hall%20of%20Fame&subtitle=Los%20Usuarios%20M%C3%A1s%20Legendarios`;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const shareUser = typeof params.shareUser === 'string' ? params.shareUser : null;
  const rank = typeof params.rank === 'string' ? params.rank : null;
  const legendaryCount = typeof params.legendaryCount === 'string' ? params.legendaryCount : null;
  const level = typeof params.level === 'string' ? params.level : null;

  // If per-user share params are present, generate a personalized OG image
  if (shareUser && rank) {
    const ogParams = new URLSearchParams();
    ogParams.set('userName', shareUser);
    ogParams.set('rank', rank);
    if (legendaryCount) ogParams.set('legendaryCount', legendaryCount);
    if (level) ogParams.set('level', level);

    const ogImage = `${OG_API}?${ogParams.toString()}`;
    const title = `#${rank} ${shareUser} — Hall of Fame | Duobi-Jac`;
    const description = `${shareUser} está en el #${rank} del Hall of Fame con ${legendaryCount || '?'} logros legendarios. Nivel ${level || '?'}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/hall-of-fame`,
        siteName: 'Duobi-Jac',
        locale: 'es_ES',
        type: 'profile',
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  }

  // Default Hall of Fame metadata
  return {
    title: 'Hall of Fame — Los Usuarios Más Legendarios',
    description:
      'Descubre a los usuarios más legendarios de Duobi-Jac: los maestros que han completado todos los exámenes finales, obtenido puntuaciones perfectas, dominado todos los cursos y desbloqueado los logros más difíciles.',
    keywords: [
      'Duobi-Jac', 'Hall of Fame', 'logros legendarios', 'gamificación',
      'aprendizaje', 'cursos online', 'ranking',
    ],
    openGraph: {
      title: 'Hall of Fame — Los Usuarios Más Legendarios | Duobi-Jac',
      description:
        'Descubre a los usuarios más legendarios de Duobi-Jac: los maestros que han completado todos los exámenes finales, obtenido puntuaciones perfectas y desbloqueado los logros más difíciles.',
      url: `${BASE_URL}/hall-of-fame`,
      siteName: 'Duobi-Jac',
      locale: 'es_ES',
      type: 'website',
      images: [{ url: defaultOgImage, width: 1200, height: 630, alt: 'Hall of Fame — Los Usuarios Más Legendarios de Duobi-Jac' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Hall of Fame — Los Usuarios Más Legendarios',
      description:
        'Los maestros que han completado todos los exámenes finales, obtenido puntuaciones perfectas y desbloqueado los logros más difíciles.',
      images: [defaultOgImage],
    },
  };
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HallOfFamePage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <HallOfFameClient
      shareUser={typeof params.shareUser === 'string' ? params.shareUser : null}
      rank={typeof params.rank === 'string' ? params.rank : null}
      legendaryCount={typeof params.legendaryCount === 'string' ? params.legendaryCount : null}
      level={typeof params.level === 'string' ? params.level : null}
    />
  );
}