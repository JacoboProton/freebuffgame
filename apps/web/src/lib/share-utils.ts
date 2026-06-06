const SHARE_URL = 'https://rxktk3y4.insforge.site/hall-of-fame';

interface ShareEntry {
  rank: number;
  totalLegendaryCount: number;
}

export function getShareText(entry: ShareEntry): string {
  return entry.rank <= 3
    ? `🏛️ ¡Soy #${entry.rank} en el Hall of Fame de Duobi-Jac! 🏆 ${entry.totalLegendaryCount} logro${entry.totalLegendaryCount > 1 ? 's' : ''} legendario${entry.totalLegendaryCount > 1 ? 's' : ''} desbloqueado${entry.totalLegendaryCount > 1 ? 's' : ''}. ¡Aprende jugando! ✨`
    : `🏛️ ¡Estoy en el Hall of Fame de Duobi-Jac! 🏆 Posición #${entry.rank} con ${entry.totalLegendaryCount} logro${entry.totalLegendaryCount > 1 ? 's' : ''} legendario${entry.totalLegendaryCount > 1 ? 's' : ''}. ¡Aprende jugando! ✨`;
}

export async function handleShare(entry: ShareEntry): Promise<void> {
  const text = getShareText(entry);
  if (navigator.share) {
    await navigator.share({ title: 'Hall of Fame — Duobi-Jac', text, url: SHARE_URL });
  } else {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SHARE_URL)}`,
      '_blank',
    );
  }
}

export function shareToTwitter(entry: ShareEntry): void {
  const text = getShareText(entry);
  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text + ' ' + SHARE_URL)}`,
    '_blank',
  );
}

export function shareToWhatsApp(entry: ShareEntry): void {
  const text = `${getShareText(entry)} ${SHARE_URL}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export function shareToFacebook(entry: ShareEntry): void {
  const shortText = entry.rank <= 3
    ? `🏛️ Soy #${entry.rank} en el Hall of Fame de Duobi-Jac 🏆`
    : `🏛️ Estoy en el Hall of Fame de Duobi-Jac — Posición #${entry.rank} 🏆`;
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}&quote=${encodeURIComponent(shortText)}`,
    '_blank',
  );
}

export function copyShareLink(): Promise<void> {
  return navigator.clipboard.writeText(SHARE_URL);
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
