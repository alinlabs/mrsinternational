const ORIGIN_PRODUKSI_KANONIK = [
  'https://mrs.international.my.id',
  'https://international.my.id',
  'https://mrsinternational.vercel.app',
];

function tambahHostHttps(allowlist: Set<string>, hostMentah?: string): void {
  const host = (hostMentah ?? '').split(',')[0].trim();
  if (!host) return;
  const bersih = host.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  if (!bersih) return;
  try {
    allowlist.add(new URL(`https://${bersih}`).origin);
  } catch {
    // Abaikan host tidak valid
  }
}

export function periksaOriginDiizinkan(params: {
  origin?: string;
  host?: string;
  forwardedHost?: string;
  forwardedProto?: string;
}): { diizinkan: boolean; originHeader: string | null } {
  const origin = (params.origin ?? '').trim();
  if (!origin) {
    return { diizinkan: true, originHeader: null };
  }

  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return { diizinkan: false, originHeader: null };
  }

  const kandidatAllowlist = new Set<string>(ORIGIN_PRODUKSI_KANONIK);

  const appUrl = (process.env.APP_URL ?? '').trim();
  if (appUrl && appUrl !== 'MY_APP_URL') {
    try {
      kandidatAllowlist.add(new URL(appUrl).origin);
    } catch {
      // Abaikan APP_URL yang tidak valid
    }
  }

  tambahHostHttps(kandidatAllowlist, process.env.VERCEL_URL);
  tambahHostHttps(kandidatAllowlist, process.env.VERCEL_BRANCH_URL);
  tambahHostHttps(kandidatAllowlist, process.env.VERCEL_PROJECT_PRODUCTION_URL);

  const extraCors = (process.env.ALLOWED_CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  for (const item of extraCors) {
    try {
      kandidatAllowlist.add(new URL(item).origin);
    } catch {
      // Abaikan origin tidak valid
    }
  }

  const hostAktif = (params.forwardedHost || params.host || '').split(',')[0].trim();
  if (hostAktif) {
    const proto = (params.forwardedProto || '').split(',')[0].trim();
    if (proto === 'http' || proto === 'https') {
      kandidatAllowlist.add(`${proto}://${hostAktif}`);
    } else {
      kandidatAllowlist.add(`https://${hostAktif}`);
      kandidatAllowlist.add(`http://${hostAktif}`);
    }
  }

  if (kandidatAllowlist.has(parsedOrigin.origin)) {
    return { diizinkan: true, originHeader: parsedOrigin.origin };
  }

  return { diizinkan: false, originHeader: null };
}
