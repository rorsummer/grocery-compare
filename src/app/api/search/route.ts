import { NextRequest, NextResponse } from 'next/server';
import { getSearchKeywords } from '@/data/translations';
import { getNearestByBrand } from '@/data/stores';
import { searchCountdown, searchPaknsave, searchNewWorld, Product } from '@/lib/scrapers';

function bestScore(products: Product[], userLat: number, userLng: number): Product[] {
  const brandDist = getNearestByBrand(userLat, userLng);

  // 给每个商品附加到最近同品牌门店的距离
  const withDist = products.map((p) => {
    const d = brandDist.get(p.brand);
    return { ...p, distance: d !== undefined ? d : 99 };
  });

  // 归一化
  const prices = withDist.map((p) => p.price);
  const dists = withDist.map((p) => p.distance);
  const maxPrice = Math.max(...prices, 1);
  const maxDist = Math.max(...dists, 1);

  // 加权评分：价格权重 60%，距离权重 40%
  const scored = withDist.map((p) => ({
    ...p,
    score: (p.price / maxPrice) * 0.6 + (p.distance / maxDist) * 0.4,
  }));

  scored.sort((a, b) => a.score - b.score);
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

  const keywords = getSearchKeywords(keyword.trim());

  const allResults: Product[] = [];

  for (const kw of keywords) {
    const [cd, pns, nw] = await Promise.all([
      searchCountdown(kw),
      searchPaknsave(kw),
      searchNewWorld(kw),
    ]);
    allResults.push(...cd, ...pns, ...nw);
  }

  // 去重
  const seen = new Set<string>();
  let unique: (Product & { distance?: number; score?: number })[] = [];
  for (const item of allResults) {
    const key = `${item.name}-${item.store}`.toLowerCase();
    if (!seen.has(key) && item.price > 0) {
      seen.add(key);
      unique.push({ ...item });
    }
  }

  // 排序
  const userLat = latStr ? parseFloat(latStr) : null;
  const userLng = lngStr ? parseFloat(lngStr) : null;

  if (sort === 'best' && userLat !== null && userLng !== null) {
    unique = bestScore(unique, userLat, userLng);
  } else {
    unique.sort((a, b) => a.price - b.price);
  }

  return NextResponse.json({
    keyword,
    sort,
    results: unique.slice(0, 24),
    total: unique.length,
  });
}
