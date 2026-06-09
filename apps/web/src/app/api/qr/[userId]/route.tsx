import QRCode from 'qrcode';

const BASE_URL = 'https://rxktk3y4.insforge.site';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const shareUrl = `${BASE_URL}/share/${userId}`;

  // Generate QR code as SVG string
  let svgString: string;
  try {
    svgString = await QRCode.toString(shareUrl, {
      type: 'svg',
      width: 400,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H', // High — allows center logo overlay
    });
  } catch {
    return new Response('Failed to generate QR code', { status: 500 });
  }

  // Inject a small "D" logo circle in the center of the QR code
  const logoSvg = `
    <circle cx="200" cy="200" r="32" fill="white" stroke="#22C55E" stroke-width="4"/>
    <text x="200" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#22C55E">D</text>
  `;

  const finalSvg = svgString.replace(
    '</svg>',
    `${logoSvg}</svg>`
  );

  return new Response(finalSvg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, s-maxage=86400, max-age=86400, stale-while-revalidate=172800',
    },
  });
}
