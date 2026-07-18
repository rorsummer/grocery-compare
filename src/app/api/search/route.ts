import { NextRequest, NextResponse } from 'next/server';
import { getSearchKeywords } from '@/data/translations';
import { searchCountdown, searchPaknsave, searchNewWorld, Product } from '@/lib/scrapers';

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get('q') || '';

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
  const unique: Product[] = [];
  for (const item of allResults) {
    const key = `${item.name}-${item.store}`.toLowerCase();
    if (!seen.has(key) && item.price > 0) {
      seen.add(key);
      unique.push(item);
    }
  }

  unique.sort((a, b) => a.price - b.price);

  return NextResponse.json({
    keyword,
    results: unique.slice(0, 24),
    total: unique.length,
  });
}
