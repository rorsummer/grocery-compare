/**
 * Foodstuffs Token Proxy — Cloudflare Worker
 *
 * Deploy: npx wrangler deploy
 */

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const origin = url.searchParams.get('origin');
    const debug = url.searchParams.has('debug');

    if (!origin) {
      return new Response('Missing ?origin=', { status: 400 });
    }

    if (!origin.startsWith('https://www.paknsave.co.nz') &&
        !origin.startsWith('https://www.newworld.co.nz')) {
      return new Response('Invalid origin', { status: 403 });
    }

    try {
      const res = await fetch(origin + '/', {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-NZ,en;q=0.9',
        },
        redirect: 'follow',
      });

      const setCookie = res.headers.get('set-cookie');

      if (debug) {
        return new Response(JSON.stringify({
          status: res.status,
          hasSetCookie: !!setCookie,
          cookiePreview: setCookie ? setCookie.slice(0, 500) : null,
          bodyPreview: (await res.text()).slice(0, 500),
        }, null, 2), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!setCookie) {
        return new Response('No set-cookie header', { status: 502 });
      }

      const m = setCookie.match(/fs-user-token=([^;]+)/);
      if (!m) {
        return new Response('No fs-user-token in cookies', { status: 502 });
      }

      return new Response(m[1], {
        headers: { 'Content-Type': 'text/plain' },
      });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  },
};
