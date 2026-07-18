'use client';

import { useState, useCallback, useEffect } from 'react';
import { getNearbyStores, Store } from '@/data/stores';

interface Product {
  name: string;
  price: number;
  store: string;
  brand: string;
  image: string;
  link: string;
}

type Lang = 'zh' | 'en';

const texts: Record<Lang, {
  title: string;
  subtitle: string;
  placeholder: string;
  search: string;
  searching: string;
  noResults: string;
  error: string;
  priceLowToHigh: string;
  poweredBy: string;
  locationHint: string;
  enableLocation: string;
  locating: string;
  locationDenied: string;
  nearbyStores: string;
  km: string;
  resultCount: string;
}> = {
  zh: {
    title: '奥克兰超市比价',
    subtitle: '搜索商品，找到最便宜的价格',
    placeholder: '输入商品名称，如：牛奶、eggs、rice...',
    search: '搜索',
    searching: '正在搜索...',
    noResults: '没有找到结果，试试其他关键词',
    error: '搜索出错，请稍后重试',
    priceLowToHigh: '按价格从低到高排列',
    poweredBy: '数据来源：Woolworths、Pak\'nSave、New World',
    locationHint: '开启定位可查看附近超市',
    enableLocation: '定位',
    locating: '定位中...',
    locationDenied: '无法获取位置，请允许定位权限',
    nearbyStores: '附近超市',
    km: '公里',
    resultCount: '共 {count} 个结果',
  },
  en: {
    title: 'Auckland Grocery Compare',
    subtitle: 'Find the cheapest grocery prices near you',
    placeholder: 'Search products, e.g. milk, 牛奶, rice...',
    search: 'Search',
    searching: 'Searching...',
    noResults: 'No results found, try another keyword',
    error: 'Search failed, please try again',
    priceLowToHigh: 'Sorted by price: low to high',
    poweredBy: 'Data from: Woolworths, Pak\'nSave, New World',
    locationHint: 'Enable location to see nearby stores',
    enableLocation: 'Locate',
    locating: 'Locating...',
    locationDenied: 'Location unavailable, please allow access',
    nearbyStores: 'Nearby Stores',
    km: 'km',
    resultCount: '{count} results',
  },
};

const brandColors: Record<string, string> = {
  countdown: 'bg-green-100 text-green-800',
  paknsave: 'bg-yellow-100 text-yellow-800',
  newworld: 'bg-red-100 text-red-800',
  chinese: 'bg-orange-100 text-orange-800',
};

const brandIcons: Record<string, string> = {
  paknsave: '🟡',
  countdown: '🟢',
  newworld: '🔴',
  chinese: '🟠',
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
  const [nearbyStores, setNearbyStores] = useState<(Store & { distance: number })[]>([]);

  const t = texts[lang];

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError(t.locationDenied);
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
        setNearbyStores(nearby.slice(0, 10));
      },
      () => {
        setLocError(t.locationDenied);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [t.locationDenied]);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError('');

    try {
      let url = `/api/search?q=${encodeURIComponent(q)}`;
      if (userLoc) {
        url += `&lat=${userLoc.lat}&lng=${userLoc.lng}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results || []);
        setHasSearched(true);
      }
    } catch {
      setError(t.error);
    }
    setLoading(false);
  }, [query, userLoc, t.error]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
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
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
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

        {/* Location error */}
        {locError && (
          <p className="text-xs text-red-500 text-center mb-4">{locError}</p>
        )}

        {/* Nearby stores */}
        {nearbyStores.length > 0 && !hasSearched && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 mb-2">{t.nearbyStores}</p>
            <div className="flex flex-wrap gap-2">
              {nearbyStores.map((store) => (
                <span
                  key={store.name}
                  className={`text-xs px-2.5 py-1 rounded-full border ${brandColors[store.brand] || 'bg-gray-100 text-gray-600'}`}
                >
                  {brandIcons[store.brand] || ''} {store.name} {store.distance}{t.km}
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
              {t.resultCount.replace('{count}', String(results.length))} &middot; {t.priceLowToHigh}
            </p>
            <div className="space-y-3">
              {results.map((item, index) => (
                <a
                  key={`${item.name}-${item.store}-${index}`}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
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
                      <p className="font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${brandColors[item.brand] || 'bg-gray-100 text-gray-600'}`}>
                          {item.store}
                        </span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-green-700 whitespace-nowrap">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </a>
              ))}
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
    </main>
  );
}
