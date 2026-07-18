import { NextRequest, NextResponse } from 'next/server';
import { getSearchKeywords } from '@/data/translations';
import { getNearestByBrand } from '@/data/stores';
import { searchCountdown, searchPaknsave, searchNewWorld, Product } from '@/lib/scrapers';

/** Score how well a product name matches the user's original query */
function relevanceScore(productName: string, rawQuery: string): number {
  const name = productName.toLowerCase();
  const q = rawQuery.trim().toLowerCase();
  if (!q) return 1;

  const queryWords = q.split(/\s+/);
  // Split name into tokens for word-boundary matching
  const nameWords = name.split(/[\s,.\-()/]+/).filter(Boolean);

  // Exact phrase match — only if the phrase appears at word boundaries
  const idx = name.indexOf(q);
  if (idx >= 0) {
    const before = idx === 0 || /[\s,.\-()/]/.test(name[idx - 1]);
    const end = idx + q.length;
    const after = end === name.length || /[\s,.\-()/]/.test(name[end]);
    if (before && after) return 1.0 + queryWords.length * 0.1;
  }

  // Count exact word-boundary matches
  let matched = 0;
  for (const w of queryWords) {
    if (w.length <= 2) continue; // skip tiny words like "of", "in"
    if (nameWords.some((nw) => nw === w)) matched++;
  }

  // If none of the substantive words matched, this is a poor result
  if (matched === 0) return 0;

  // Higher score for matching more words
  return matched / queryWords.length;
}

function bestScore(
  products: (Product & { relevance?: number })[],
  userLat: number,
  userLng: number
): (Product & { distance?: number; score?: number })[] {
  const brandDist = getNearestByBrand(userLat, userLng);

  const withDist = products.map((p) => {
    const d = brandDist.get(p.brand);
    return { ...p, distance: d !== undefined ? d : 99 };
  });

  const prices = withDist.map((p) => p.price);
  const dists = withDist.map((p) => p.distance);
  const maxPrice = Math.max(...prices, 1);
  const maxDist = Math.max(...dists, 1);

  // 价格 55%、距离 30%、相关性 15%（分数越高越好）
  const scored = withDist.map((p) => ({
    ...p,
    score:
      (1 - p.price / maxPrice) * 0.55 +
      (1 - p.distance / maxDist) * 0.30 +
      (p.relevance || 0) * 0.15,
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('q') || '';
  const sort = request.nextUrl.searchParams.get('sort') || 'price';
  const latStr = request.nextUrl.searchParams.get('lat');
  const lngStr = request.nextUrl.searchParams.get('lng');

  if (!keyword.trim()) {
    return NextResponse.json({ error: '请输入搜索词' }, { status: 400 });
  }

  const rawQuery = keyword.trim();
  const keywords = getSearchKeywords(rawQuery);

  // 用于相关性匹配：中文输入用翻译后的英文关键词，英文用原文
  const matchQuery = keywords[0] || rawQuery.toLowerCase();

  // 限制关键词数量，避免请求过多超时
  const searchKeywords = keywords.slice(0, 3);

  const allResults: Product[] = [];
  const apiErrors: string[] = [];

  for (const kw of searchKeywords) {
    const [cd, pns, nw] = await Promise.all([
      searchCountdown(kw),
      searchPaknsave(kw),
      searchNewWorld(kw),
    ]);
    allResults.push(...cd, ...pns, ...nw);

    // Track per-keyword which APIs returned empty
    if (cd.length === 0 && pns.length === 0 && nw.length === 0) {
      apiErrors.push(`keyword "${kw}" returned 0 results from all stores`);
    } else {
      if (cd.length === 0) apiErrors.push(`Woolworths: 0 results for "${kw}"`);
      if (pns.length === 0) apiErrors.push(`Pak'nSave: 0 results for "${kw}"`);
      if (nw.length === 0) apiErrors.push(`New World: 0 results for "${kw}"`);
    }
  }

  // 去重 + 计算相关性
  const seen = new Set<string>();
  let unique: (Product & { relevance?: number; distance?: number; score?: number })[] = [];

  for (const item of allResults) {
    const key = `${item.name}-${item.store}`.toLowerCase();
    if (!seen.has(key) && item.price > 0) {
      seen.add(key);
      const rel = relevanceScore(item.name, matchQuery);

      // 零相关性结果一律过滤：搜索词未命中任何词语边界
      if (rel === 0) continue;

      unique.push({ ...item, relevance: rel });
    }
  }

  // 排序
  const userLat = latStr ? parseFloat(latStr) : null;
  const userLng = lngStr ? parseFloat(lngStr) : null;

  if (sort === 'best' && userLat !== null && userLng !== null) {
    unique = bestScore(unique, userLat, userLng);
  } else if (sort === 'price') {
    // 价格模式：先按相关性分层，再按价格排
    unique.sort((a, b) => {
      // 高相关性的优先展示
      const relDiff = (b.relevance || 0) - (a.relevance || 0);
      if (Math.abs(relDiff) > 0.3) return relDiff;
      return a.price - b.price;
    });
  }

  return NextResponse.json({
    keyword: rawQuery,
    keywords: keywords.slice(0, 5),
    sort,
    results: unique.slice(0, 24),
    total: unique.length,
    apiErrors: apiErrors.length > 0 ? apiErrors : undefined,
  });
}
