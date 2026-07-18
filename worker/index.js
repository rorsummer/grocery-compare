/**
 * Foodstuffs Token Proxy — Cloudflare Worker
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

async function tryGetToken(origin) {
  const res = await fetch(origin + '/', {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-NZ,en;q=0.9',
    },
    redirect: 'follow',
    cf: { cacheTtl: 0 },
  });

  // If challenged, throw so we can retry
  if (res.headers.get('cf-mitigated') === 'challenge') {
    throw new Error('cf_challenge');
  }

  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) {
    throw new Error('no_set_cookie');
  }

  const m = setCookie.match(/fs-user-token=([^;]+)/);
  if (!m) {
    throw new Error('no_fs_user_token');
  }

  return m[1];
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = url.searchParams.get('origin');

    if (!origin) {
      return new Response('Missing ?origin=', { status: 400 });
    }

    if (!origin.startsWith('https://www.paknsave.co.nz') &&
        !origin.startsWith('https://www.newworld.co.nz')) {
      return new Response('Invalid origin', { status: 403 });
    }

    let lastErr = 'unknown';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const token = await tryGetToken(origin);
        return new Response(token, {
          headers: { 'Content-Type': 'text/plain' },
        });
      } catch (err) {
        lastErr = err.message;
        if (attempt < 2) {
          // Exponential backoff: 1s, 2s
          await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
        }
      }
    }

    return new Response(lastErr, { status: 502 });
  },
};
