import type { Metadata } from 'next';

const BASE_URL = 'https://rxktk3y4.insforge.site';
const OG_API = `${BASE_URL}/api/og`;

const defaultOgImage = `${OG_API}?title=Hall%20of%20Fame&subtitle=Los%20Usuarios%20M%C3%A1s%20Legendarios`;

export async function generateMetadata(): Promise<Metadata> {
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

export default function HallOfFameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}