const SHARE_URL = 'https://rxktk3y4.insforge.site/hall-of-fame';
const OG_API = 'https://rxktk3y4.insforge.site/api/og';

interface ShareEntry {
  rank: number;
  totalLegendaryCount: number;
  name?: string;
  level?: number;
  userId?: string;
}

/** Build the dynamic OG image URL for a specific user */
export function getUserOgImageUrl(entry: ShareEntry): string {
  const params = new URLSearchParams();
  if (entry.name) params.set('userName', entry.name);
  params.set('rank', String(entry.rank));
  params.set('legendaryCount', String(entry.totalLegendaryCount));
  if (entry.level) params.set('level', String(entry.level));
  return `${OG_API}?${params.toString()}`;
}

/** Build a per-user share URL with OG params in the hash so crawlers see them via meta tags */
function getUserShareUrl(entry: ShareEntry): string {
  if (entry.name && entry.userId) {
    return `${SHARE_URL}?shareUser=${encodeURIComponent(entry.name)}&rank=${entry.rank}&legendaryCount=${entry.totalLegendaryCount}&level=${entry.level || 1}&userId=${entry.userId}`;
  }
  return SHARE_URL;
}

export function getShareText(entry: ShareEntry): string {
  return entry.rank <= 3
    ? `🏛️ ¡Soy #${entry.rank} en el Hall of Fame de Duobi-Jac! 🏆 ${entry.totalLegendaryCount} logro${entry.totalLegendaryCount > 1 ? 's' : ''} legendario${entry.totalLegendaryCount > 1 ? 's' : ''} desbloqueado${entry.totalLegendaryCount > 1 ? 's' : ''}. ¡Aprende jugando! ✨`
    : `🏛️ ¡Estoy en el Hall of Fame de Duobi-Jac! 🏆 Posición #${entry.rank} con ${entry.totalLegendaryCount} logro${entry.totalLegendaryCount > 1 ? 's' : ''} legendario${entry.totalLegendaryCount > 1 ? 's' : ''}. ¡Aprende jugando! ✨`;
}

export async function handleShare(entry: ShareEntry): Promise<void> {
  const text = getShareText(entry);
  const url = getUserShareUrl(entry);
  if (navigator.share) {
    await navigator.share({ title: `${entry.name ? entry.name + ' — ' : ''}Hall of Fame — Duobi-Jac`, text, url });
  } else {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank',
    );
  }
}

export function shareToTwitter(entry: ShareEntry): void {
  const text = getShareText(entry);
  const url = getUserShareUrl(entry);
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + url)}`,
    '_blank',
  );
}

export function shareToWhatsApp(entry: ShareEntry): void {
  const text = `${getShareText(entry)} ${getUserShareUrl(entry)}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export function shareToFacebook(entry: ShareEntry): void {
  const url = getUserShareUrl(entry);
  const shortText = entry.rank <= 3
    ? `🏛️ Soy #${entry.rank} en el Hall of Fame de Duobi-Jac 🏆`
    : `🏛️ Estoy en el Hall of Fame de Duobi-Jac — Posición #${entry.rank} 🏆`;
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shortText)}`,
    '_blank',
  );
}

export function copyShareLink(entry?: ShareEntry): Promise<void> {
  const url = entry ? getUserShareUrl(entry) : SHARE_URL;
  return navigator.clipboard.writeText(url);
}

export function shareHallOfFameGeneric(): void {
  const text = '🏛️ Mira el Hall of Fame de Duobi-Jac — los usuarios más legendarios de la plataforma. 🏆';
  if (navigator.share) {
    navigator.share({ title: 'Hall of Fame — Duobi-Jac', text, url: SHARE_URL });
  } else {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SHARE_URL)}`,
      '_blank',
    );
  }
}
