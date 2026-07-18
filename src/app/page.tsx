'use client';

import { useState, useCallback, useEffect } from 'react';
import { getNearbyStores } from '@/data/stores';
import {
  getRecordBook,
  addToRecordBook,
  removeFromRecordBook,
  clearRecordBook,
  isInRecordBook,
  getRecommendation,
  type RecordItem,
} from '@/lib/shopping-list';

interface Product {
  name: string;
  price: number;
  store: string;
  brand: string;
  image: string;
  link: string;
  distance?: number;
  score?: number;
}

type Lang = 'zh' | 'en';
type SortMode = 'price' | 'best';

const T = {
  zh: {
    title: '奥克兰超市比价',
    subtitle: '搜索商品，找到最便宜的价格',
    placeholder: '输入商品名称，如：牛奶、eggs、rice...',
    search: '搜索',
    searching: '搜索中...',
    noResults: '没有找到结果，试试其他关键词',
    error: '搜索出错，请稍后重试',
    priceSort: '价格优先',
    bestSort: '最佳匹配',
    priceSortDesc: '按价格从低到高排列',
    bestSortDesc: '综合价格与距离排序',
    poweredBy: '数据来源：Woolworths、Pak\'nSave、New World',
    enableLocation: '📍 定位',
    locating: '定位中...',
    locationDenied: '无法获取位置',
    nearbyStores: '附近超市',
    km: '公里',
    away: '距离',
    resultCount: '共 {count} 个结果',
    needLocation: '开启定位可用最佳匹配排序',
    recordBook: '📒 记录册',
    addToBook: '加入记录册',
    removeFromBook: '从记录册移除',
    emptyBook: '记录册是空的，搜索并添加商品吧',
    recommendation: '推荐商场',
    address: '地址',
    budget: '预算',
    travelTime: '前往方式',
    clearAll: '清空记录',
    min: '分钟',
    close: '关闭',
  },
  en: {
    title: 'Auckland Grocery Compare',
    subtitle: 'Find the cheapest grocery prices near you',
    placeholder: 'Search products, e.g. milk, 牛奶, rice...',
    search: 'Search',
    searching: 'Searching...',
    noResults: 'No results found, try another keyword',
    error: 'Search failed, please try again',
    priceSort: 'Price',
    bestSort: 'Best Match',
    priceSortDesc: 'Sorted by price: low to high',
    bestSortDesc: 'Weighted by price & distance',
    poweredBy: 'Data from: Woolworths, Pak\'nSave, New World',
    enableLocation: '📍 Locate',
    locating: 'Locating...',
    locationDenied: 'Location unavailable',
    nearbyStores: 'Nearby Stores',
    km: 'km',
    away: 'away',
    resultCount: '{count} results',
    needLocation: 'Enable location for best match sorting',
    recordBook: '📒 Record',
    addToBook: 'Add to list',
    removeFromBook: 'Remove from list',
    emptyBook: 'Your record book is empty. Search and add items!',
    recommendation: 'Recommended Store',
    address: 'Address',
    budget: 'Budget',
    travelTime: 'Travel Options',
    clearAll: 'Clear All',
    min: 'min',
    close: 'Close',
  },
};

const brandColors: Record<string, string> = {
  countdown: 'bg-green-100 text-green-800',
  paknsave: 'bg-yellow-100 text-yellow-800',
  newworld: 'bg-red-100 text-red-800',
  chinese: 'bg-orange-100 text-orange-800',
  asian: 'bg-pink-100 text-pink-800',
  convenience: 'bg-blue-100 text-blue-800',
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>('zh');
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [nearbyStores, setNearbyStores] = useState<{ name: string; brand: string; distance: number }[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('price');

  // Record book
  const [recordBook, setRecordBook] = useState<RecordItem[]>([]);
  const [showRecordBook, setShowRecordBook] = useState(false);

  // Load record book from localStorage on mount
  useEffect(() => {
    setRecordBook(getRecordBook());
  }, []);

  const t = T[lang];

  // ---- Location ----
  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocError(T[lang].locationDenied);
      return;
    }
    setLocating(true);
    setLocError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(loc);
        setLocating(false);
        const nearby = getNearbyStores(loc.lat, loc.lng, 15);
        setNearbyStores(nearby.slice(0, 10).map(s => ({ name: s.name, brand: s.brand, distance: s.distance })));
        setSortMode('best');
      },
      () => {
        setLocError(T[lang].locationDenied);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [lang]);

  // ---- Search ----
  const doSearch = useCallback(async (searchQuery: string, mode: SortMode, loc: { lat: number; lng: number } | null) => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/search?q=${encodeURIComponent(searchQuery)}&sort=${mode}`;
      if (loc) {
        url += `&lat=${loc.lat}&lng=${loc.lng}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResults([]);
      } else {
        setResults(data.results || []);
        setHasSearched(true);
      }
    } catch {
      setError(T[lang].error);
      setResults([]);
    }
    setLoading(false);
  }, [lang]);

  const handleSearch = () => {
    const q = query.trim();
    if (!q || loading) return;
    doSearch(q, sortMode, userLoc);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSortChange = (mode: SortMode) => {
    if (mode === 'best' && !userLoc) {
      requestLocation();
      return;
    }
    setSortMode(mode);
    if (query.trim()) {
      doSearch(query.trim(), mode, userLoc);
    }
  };

  // ---- Record book ----
  const handleToggleBookmark = (item: Product) => {
    if (isInRecordBook(item.name, item.store)) {
      const updated = removeFromRecordBook(item.name, item.store);
      setRecordBook(updated);
    } else {
      const updated = addToRecordBook({
        name: item.name,
        price: item.price,
        store: item.store,
        brand: item.brand,
        image: item.image,
        link: item.link,
      });
      setRecordBook(updated);
    }
  };

  const handleClearBook = () => {
    clearRecordBook();
    setRecordBook([]);
  };

  const recommendation = showRecordBook ? getRecommendation(userLoc?.lat ?? null, userLoc?.lng ?? null) : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-2 gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={requestLocation}
              disabled={locating}
              className={`text-sm border rounded-full px-3 py-1.5 transition-colors ${
                userLoc
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-white hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              {locating ? t.locating : userLoc ? '📍' : t.enableLocation}
            </button>
            <button
              onClick={() => setShowRecordBook(true)}
              className="text-sm border rounded-full px-3 py-1.5 transition-colors bg-white hover:bg-gray-100 relative"
            >
              {t.recordBook}
              {recordBook.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {recordBook.length}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')}
            className="text-sm bg-white border rounded-full px-4 py-1.5 hover:bg-gray-100 transition-colors"
          >
            {lang === 'zh' ? 'English' : '中文'}
          </button>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-1 text-gray-900">{t.title}</h1>
        <p className="text-gray-500 text-center mb-8">{t.subtitle}</p>

        {/* Search bar */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            className="flex-1 border border-gray-300 rounded-xl px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
            autoFocus
          />
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium text-lg transition-colors shadow-sm disabled:cursor-not-allowed"
          >
            {loading ? t.searching : t.search}
          </button>
        </div>

        {/* Sort toggle */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => handleSortChange('price')}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                sortMode === 'price'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.priceSort}
            </button>
            <button
              onClick={() => handleSortChange('best')}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                sortMode === 'best'
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={!userLoc ? t.needLocation : ''}
            >
              {t.bestSort}
            </button>
          </div>
          {locError && (
            <span className="text-xs text-red-500">{locError}</span>
          )}
        </div>

        {/* Nearby stores */}
        {nearbyStores.length > 0 && !hasSearched && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-2">{t.nearbyStores}</p>
            <div className="flex flex-wrap gap-1.5">
              {nearbyStores.map((store) => (
                <span
                  key={store.name}
                  className={`text-xs px-2.5 py-1 rounded-full border ${brandColors[store.brand] || 'bg-gray-100 text-gray-600'}`}
                >
                  {store.name} · {store.distance}{t.km}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Powered by */}
        {!hasSearched && (
          <p className="text-center text-sm text-gray-400 mb-6">{t.poweredBy}</p>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center mb-4">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-3">
              {t.resultCount.replace('{count}', String(results.length))}
              &middot; {sortMode === 'price' ? t.priceSortDesc : t.bestSortDesc}
            </p>
            <div className="space-y-3">
              {results.map((item, index) => {
                const bookmarked = isInRecordBook(item.name, item.store);
                return (
                  <div
                    key={`${item.name}-${item.store}-${index}`}
                    className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative group"
                  >
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-contain rounded-lg bg-gray-50 flex-shrink-0"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs flex-shrink-0">
                          暂无
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-900 hover:text-green-700 transition-colors truncate block"
                        >
                          {item.name}
                        </a>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${brandColors[item.brand] || 'bg-gray-100 text-gray-600'}`}>
                            {item.store}
                          </span>
                          {item.distance !== undefined && (
                            <span className="text-xs text-gray-400">
                              ~{item.distance}{t.km} {t.away}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <div>
                          <p className="text-xl font-bold text-green-700">
                            ${item.price.toFixed(2)}
                          </p>
                          {item.score !== undefined && (
                            <p className="text-xs text-gray-400">
                              {Math.round(item.score * 100)}分
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleBookmark(item);
                          }}
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                            bookmarked
                              ? 'bg-green-100 text-green-600 hover:bg-red-100 hover:text-red-500'
                              : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                          }`}
                          title={bookmarked ? t.removeFromBook : t.addToBook}
                        >
                          {bookmarked ? '✓' : '+'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && hasSearched && results.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">{t.noResults}</p>
          </div>
        )}

        {/* Empty state */}
        {!hasSearched && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-gray-400">{t.placeholder}</p>
          </div>
        )}
      </div>

      {/* ============ Record Book Modal ============ */}
      {showRecordBook && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowRecordBook(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl animate-slide-in">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b z-10 px-5 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {t.recordBook}
                {recordBook.length > 0 && (
                  <span className="ml-2 text-sm text-gray-400 font-normal">
                    ({recordBook.length})
                  </span>
                )}
              </h2>
              <button
                onClick={() => setShowRecordBook(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕ {t.close}
              </button>
            </div>

            <div className="px-5 py-4">
              {/* Empty state */}
              {recordBook.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-4xl mb-3">📒</p>
                  <p className="text-gray-400">{t.emptyBook}</p>
                </div>
              )}

              {/* Items list */}
              {recordBook.map((item) => (
                <div
                  key={`${item.name}-${item.store}`}
                  className="flex items-center gap-3 py-3 border-b border-gray-50"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded bg-gray-50 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-300 text-xs flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <span className={`inline-block text-xs px-1.5 py-0.5 rounded-full mt-0.5 ${brandColors[item.brand] || 'bg-gray-100 text-gray-600'}`}>
                      {item.store}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-green-700 flex-shrink-0">${item.price.toFixed(2)}</p>
                  <button
                    onClick={() => {
                      const updated = removeFromRecordBook(item.name, item.store);
                      setRecordBook(updated);
                    }}
                    className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0"
                    title={t.removeFromBook}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Budget */}
              {recordBook.length > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    {t.budget}: <span className="text-lg font-bold">${recordBook.reduce((s, i) => s + i.price, 0).toFixed(2)}</span>
                  </p>
                </div>
              )}

              {/* Recommendation */}
              {recommendation && recommendation.allStores.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-bold text-blue-900 mb-3">
                    🏪 {t.recommendation}
                  </h3>
                  <p className="text-base font-bold text-blue-800">
                    {recommendation.topStore.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {t.address}: {recommendation.topStore.address}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    已匹配 {recommendation.topStore.matchedItems.length}/{recordBook.length} 件商品
                    &middot; 总计 ${recommendation.topStore.totalCost.toFixed(2)}
                  </p>

                  {/* Travel times */}
                  {recommendation.travelEstimates.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs font-medium text-blue-900 mb-2">{t.travelTime}:</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {recommendation.travelEstimates.map((est) => (
                          <div key={est.mode} className="flex items-center gap-1.5 text-xs text-blue-700">
                            <span>{est.icon}</span>
                            <span>{est.label}</span>
                            <span className="font-medium">{est.minutes}{t.min}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Other stores */}
                  {recommendation.allStores.length > 1 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-500 mb-1">其他可选商场:</p>
                      {recommendation.allStores.slice(1, 4).map((s) => (
                        <p key={s.name} className="text-xs text-blue-400">
                          {s.name} · 匹配{s.matchedItems.length}件 · ${s.totalCost.toFixed(2)}
                          {s.distanceKm < 99 ? ` · ${s.distanceKm.toFixed(1)}km` : ''}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User needs location for recommendation */}
              {recordBook.length > 0 && !userLoc && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-center">
                  <p className="text-sm text-yellow-700">
                    {lang === 'zh'
                      ? '开启定位后可查看推荐商场和前往方式'
                      : 'Enable location to see store recommendations and travel options'}
                  </p>
                  <button
                    onClick={requestLocation}
                    className="mt-2 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-4 py-1.5 rounded-full transition-colors"
                  >
                    {t.enableLocation}
                  </button>
                </div>
              )}

              {/* Clear all */}
              {recordBook.length > 0 && (
                <button
                  onClick={handleClearBook}
                  className="mt-4 w-full text-center text-sm text-red-400 hover:text-red-600 py-2 transition-colors"
                >
                  {t.clearAll}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
