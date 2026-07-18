import { exec } from 'child_process';
import { promisify } from 'util';
import * as https from 'https';

const execAsync = promisify(exec);

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

// --- Token cache (in-memory, ~25 min TTL) ---
interface TokenCache {
  token: string;
  expEpochMs: number;
}

const tokenCache: Record<string, TokenCache> = {};

function jwtExpMs(token: string): number {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (typeof json.exp === 'number') return json.exp * 1000;
  } catch {
    /* fall through */
  }
  return Date.now() + 25 * 60_000;
}

/** Extract fs-user-token from a homepage response via Node.js https (fallback when curl unavailable) */
function fetchTokenViaHttps(origin: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const u = new URL(origin);
    const req = https.request(
      {
        hostname: u.hostname,
        path: '/',
        method: 'GET',
        headers: {
          'User-Agent': UA,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-NZ,en;q=0.9',
        },
        ciphers: [
          'TLS_AES_128_GCM_SHA256',
          'TLS_AES_256_GCM_SHA384',
          'TLS_CHACHA20_POLY1305_SHA256',
          'ECDHE-ECDSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES128-GCM-SHA256',
          'ECDHE-ECDSA-AES256-GCM-SHA384',
          'ECDHE-RSA-AES256-GCM-SHA384',
        ].join(':'),
        honorCipherOrder: true,
        minVersion: 'TLSv1.2',
      },
      (res) => {
        const raw = res.headers['set-cookie'];
        if (!raw) {
          reject(new Error('No set-cookie header'));
          return;
        }
        const cookies = Array.isArray(raw) ? raw.join(';') : raw;
        const m = cookies.match(/fs-user-token=([^;]+)/);
        if (m) resolve(m[1]);
        else reject(new Error(`No fs-user-token cookie from ${origin}`));
      },
    );
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('https request timeout'));
    });
    req.end();
  });
}

async function mintGuestToken(origin: string, label: string): Promise<string> {
  const cached = tokenCache[label];
  if (cached && cached.expEpochMs - Date.now() > 60_000) {
    return cached.token;
  }

  // Strategy 1: curl via shell (works on Windows with browser headers)
  const cmd =
    `curl -s -D - -o /dev/null --max-time 20 ` +
    `-H "User-Agent: ${UA}" ` +
    `-H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" ` +
    `-H "Accept-Language: en-NZ,en;q=0.9" ` +
    `"${origin}/"`;

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { stdout } = await execAsync(cmd, {
        maxBuffer: 4 * 1024 * 1024,
        timeout: 25000,
      });
      const m = stdout.match(/set-cookie:\s*fs-user-token=([^;]+)/i);
      if (m) {
        const token = m[1];
        tokenCache[label] = { token, expEpochMs: jwtExpMs(token) };
        return token;
      }
      lastErr = new Error(`No fs-user-token from ${origin}`);
    } catch (err) {
      lastErr = err;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 500));
    }
  }
  console.error(`[${label}] curl failed: ${lastErr instanceof Error ? lastErr.message : String(lastErr)}`);

  // Strategy 2: Node.js https fallback (for environments without curl, e.g. Vercel)
  try {
    const token = await fetchTokenViaHttps(origin);
    tokenCache[label] = { token, expEpochMs: jwtExpMs(token) };
    console.error(`[${label}] https fallback succeeded`);
    return token;
  } catch (httpsErr) {
    const reason = httpsErr instanceof Error ? httpsErr.message : String(httpsErr);
    console.error(`[${label}] https fallback also failed: ${reason}`);
    throw httpsErr;
  }
}

// --- Product types ---
export interface Product {
  name: string;
  price: number;
  store: string;
  brand: 'countdown' | 'paknsave' | 'newworld';
  image: string;
  link: string;
}

// --- Woolworths (Countdown) ---
export async function searchCountdown(keyword: string): Promise<Product[]> {
  try {
    const url = `https://www.woolworths.co.nz/api/v1/products?target=search&search=${encodeURIComponent(keyword)}&inStockProductsOnly=true&size=12`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        Accept: 'application/json',
        Origin: 'https://www.woolworths.co.nz',
        Referer: 'https://www.woolworths.co.nz/shop/search/products?searchTerm=' + encodeURIComponent(keyword),
        'X-Requested-With': 'XMLHttpRequest',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.products?.items || [];
    return items.map((item: Record<string, unknown>) => {
      const p = item as Record<string, unknown>;
      const price = (p as Record<string, unknown>)?.price as Record<string, unknown> | undefined;
      return {
        name: (p.name as string) || 'Unknown',
        price: (price?.salePrice as number) || (price?.originalPrice as number) || 0,
        store: 'Woolworths',
        brand: 'countdown' as const,
        image: (p.images as Record<string, unknown>)?.big as string || '',
        link: `https://www.woolworths.co.nz/shop/product/${p.sku}`,
      };
    });
  } catch {
    return [];
  }
}

// --- Foodstuffs (Pak'nSave + New World) ---
interface FoodstuffsConfig {
  origin: string;
  apiHost: string;
  label: string;
  displayName: string;
  brand: 'paknsave' | 'newworld';
  defaultStoreId: string;
}

const PAKNSAVE_CONFIG: FoodstuffsConfig = {
  origin: 'https://www.paknsave.co.nz',
  apiHost: 'https://api-prod.paknsave.co.nz',
  label: 'paknsave',
  displayName: "Pak'nSave",
  brand: 'paknsave',
  defaultStoreId: 'e1925ea7-01bc-4358-ae7c-c6502da5ab12', // Royal Oak
};

const NEWWORLD_CONFIG: FoodstuffsConfig = {
  origin: 'https://www.newworld.co.nz',
  apiHost: 'https://api-prod.newworld.co.nz',
  label: 'newworld',
  displayName: 'New World',
  brand: 'newworld',
  defaultStoreId: '60928d93-06fa-4d8f-92a6-8c359e7e846d', // New World Metro Auckland
};

async function searchFoodstuffs(
  keyword: string,
  config: FoodstuffsConfig
): Promise<Product[]> {
  try {
    const token = await mintGuestToken(config.origin, config.label);

    const body = {
      algoliaQuery: {
        attributesToHighlight: [],
        attributesToRetrieve: ['productID', 'Type'],
        facets: ['brand', 'category1NI', 'onPromotion'],
        filters: `stores:${config.defaultStoreId}`,
        hitsPerPage: 12,
        maxValuesPerFacet: 100,
        page: 0,
        query: keyword,
      },
      algoliaFacetQueries: [],
      storeId: config.defaultStoreId,
      hitsPerPage: 12,
      page: 0,
      sortOrder: 'NI_POPULARITY_ASC',
      tobaccoQuery: true,
    };

    const res = await fetch(`${config.apiHost}/v1/edge/search/paginated/products`, {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Origin: config.origin,
        Referer: config.origin + '/',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.products || [];

    return items.map((p: Record<string, unknown>) => {
      const sp = (p as Record<string, unknown>)?.singlePrice as Record<string, unknown> | undefined;
      const pId = (p.productId as string) || '';
      const numeric = pId.split('-')[0];
      return {
        name: (p.name as string) || (p.displayName as string) || 'Unknown',
        price: sp?.price ? Math.round(Number(sp.price)) / 100 : 0,
        store: config.displayName,
        brand: config.brand,
        image: numeric
          ? `https://a.fsimg.co.nz/product/retail/fan/image/200x200/${numeric}.png`
          : '',
        link: `${config.origin}/shop/product/${p.productId}`,
      };
    });
  } catch {
    return [];
  }
}

export async function searchPaknsave(keyword: string): Promise<Product[]> {
  return searchFoodstuffs(keyword, PAKNSAVE_CONFIG);
}

export async function searchNewWorld(keyword: string): Promise<Product[]> {
  return searchFoodstuffs(keyword, NEWWORLD_CONFIG);
}
