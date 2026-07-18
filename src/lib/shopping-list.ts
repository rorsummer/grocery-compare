'use client';

const STORAGE_KEY = 'grocery-record-book';

export interface RecordItem {
  name: string;
  price: number;
  store: string;
  brand: string;
  image: string;
  link: string;
}

// ---- localStorage helpers ----

export function getRecordBook(): RecordItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecordBook(items: RecordItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToRecordBook(item: RecordItem): RecordItem[] {
  const list = getRecordBook();
  const exists = list.find(
    (i) => i.name === item.name && i.store === item.store
  );
  if (!exists) {
    list.push(item);
    saveRecordBook(list);
  }
  return list;
}

export function removeFromRecordBook(name: string, store: string): RecordItem[] {
  const list = getRecordBook().filter(
    (i) => !(i.name === name && i.store === store)
  );
  saveRecordBook(list);
  return list;
}

export function clearRecordBook(): void {
  saveRecordBook([]);
}

export function isInRecordBook(name: string, store: string): boolean {
  return getRecordBook().some((i) => i.name === name && i.store === store);
}

// ---- store recommendation ----

interface StoreCandidate {
  name: string;
  brand: string;
  address: string;
  lat: number;
  lng: number;
  matchedItems: { name: string; price: number }[];
  totalCost: number;
  coverage: number; // fraction of list items found at this store
  distanceKm: number;
}

interface TravelEstimate {
  mode: string;
  label: string;
  icon: string;
  minutes: number;
}

interface Recommendation {
  topStore: StoreCandidate;
  allStores: StoreCandidate[];
  totalBudget: number;
  travelEstimates: TravelEstimate[];
}

// All stores with addresses (subset from stores.ts needed for recommendation)
const allStores: { name: string; brand: string; address: string; lat: number; lng: number }[] = [
  // Pak'nSave
  { name: "Pak'nSave Royal Oak", brand: 'paknsave', address: '691 Manukau Road, Royal Oak', lat: -36.9021, lng: 174.778 },
  { name: "Pak'nSave Mt Albert", brand: 'paknsave', address: '1145 New North Road, Mt Albert', lat: -36.8845, lng: 174.716 },
  { name: "Pak'nSave Albany", brand: 'paknsave', address: 'Don McKinnon Drive, Albany', lat: -36.734, lng: 174.697 },
  { name: "Pak'nSave Sylvia Park", brand: 'paknsave', address: '286 Mount Wellington Highway, Mt Wellington', lat: -36.9167, lng: 174.844 },
  { name: "Pak'nSave Glen Innes", brand: 'paknsave', address: '150 Apirana Avenue, Glen Innes', lat: -36.873, lng: 174.86 },
  { name: "Pak'nSave Manukau", brand: 'paknsave', address: '67 Cavendish Drive, Manukau', lat: -36.993, lng: 174.873 },
  { name: "Pak'nSave Henderson", brand: 'paknsave', address: '295 Lincoln Road, Henderson', lat: -36.881, lng: 174.629 },
  { name: "Pak'nSave Botany", brand: 'paknsave', address: '2 Bishop Dunn Place, Botany', lat: -36.932, lng: 174.914 },
  { name: "Pak'nSave Westgate", brand: 'paknsave', address: '7 Westgate Drive, Westgate', lat: -36.82, lng: 174.608 },
  { name: "Pak'nSave Ormiston", brand: 'paknsave', address: '1 Bellingham Road, Ormiston', lat: -36.967, lng: 174.917 },
  { name: "Pak'nSave Wairau Park", brand: 'paknsave', address: '150 Don McKinnon Drive, Wairau Park', lat: -36.774, lng: 174.736 },
  { name: "Pak'nSave Silverdale", brand: 'paknsave', address: '2 Hibiscus Coast Highway, Silverdale', lat: -36.632, lng: 174.676 },
  // Woolworths
  { name: 'Woolworths Metro Victoria St', brand: 'countdown', address: '19-25 Victoria Street West, Auckland CBD', lat: -36.8474, lng: 174.7655 },
  { name: 'Woolworths City (Quay Street)', brand: 'countdown', address: '76 Quay Street, Auckland CBD', lat: -36.8485, lng: 174.7633 },
  { name: 'Woolworths Newmarket', brand: 'countdown', address: '309 Broadway, Newmarket', lat: -36.87, lng: 174.778 },
  { name: 'Woolworths Mt Eden', brand: 'countdown', address: '284 Dominion Road, Mt Eden', lat: -36.877, lng: 174.763 },
  { name: 'Woolworths Grey Lynn', brand: 'countdown', address: '272 Richmond Road, Grey Lynn', lat: -36.862, lng: 174.735 },
  { name: 'Woolworths Ponsonby', brand: 'countdown', address: '1 College Hill, Ponsonby', lat: -36.856, lng: 174.744 },
  { name: 'Woolworths St Lukes', brand: 'countdown', address: '80 St Lukes Road, St Lukes', lat: -36.882, lng: 174.736 },
  { name: 'Woolworths Albany', brand: 'countdown', address: '100 Don McKinnon Drive, Albany', lat: -36.728, lng: 174.704 },
  { name: 'Woolworths Botany Downs', brand: 'countdown', address: '588 Chapel Road, Botany Downs', lat: -36.925, lng: 174.912 },
  { name: 'Woolworths Manukau', brand: 'countdown', address: '652 Great South Road, Manukau', lat: -36.99, lng: 174.879 },
  { name: 'Woolworths Lynnmall', brand: 'countdown', address: '3058 Great North Road, New Lynn', lat: -36.906, lng: 174.662 },
  { name: 'Woolworths Mt Roskill', brand: 'countdown', address: '112 Stoddard Road, Mt Roskill', lat: -36.909, lng: 174.737 },
  { name: 'Woolworths Remuera', brand: 'countdown', address: '320 Remuera Road, Remuera', lat: -36.878, lng: 174.8 },
  { name: 'Woolworths Meadowbank', brand: 'countdown', address: '35 St Johns Road, Meadowbank', lat: -36.872, lng: 174.83 },
  // New World
  { name: 'New World Metro Queen Street', brand: 'newworld', address: '125 Queen Street, Auckland CBD', lat: -36.85, lng: 174.765 },
  { name: 'New World Victoria Park', brand: 'newworld', address: '2 College Hill, Freemans Bay', lat: -36.849, lng: 174.754 },
  { name: 'New World Mt Roskill', brand: 'newworld', address: '53 May Road, Mt Roskill', lat: -36.912, lng: 174.741 },
  { name: 'New World Albany', brand: 'newworld', address: '219 Don McKinnon Drive, Albany', lat: -36.735, lng: 174.71 },
  { name: 'New World Howick', brand: 'newworld', address: '64 Picton Street, Howick', lat: -36.895, lng: 174.932 },
  { name: 'New World Stonefields', brand: 'newworld', address: '40 Stonefields Avenue, Stonefields', lat: -36.886, lng: 174.84 },
  { name: 'New World Eastridge', brand: 'newworld', address: '215 Kepa Road, Mission Bay', lat: -36.87, lng: 174.825 },
  { name: 'New World Mt Albert', brand: 'newworld', address: '2-6 Rahiri Road, Mt Albert', lat: -36.88, lng: 174.712 },
  { name: 'New World Newmarket', brand: 'newworld', address: '14-28 Gillies Avenue, Newmarket', lat: -36.872, lng: 174.78 },
  { name: 'New World Remuera', brand: 'newworld', address: '4 Victoria Avenue, Remuera', lat: -36.883, lng: 174.798 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateTravelTime(distanceKm: number, mode: string): number | null {
  switch (mode) {
    case 'walking':
      if (distanceKm > 5) return null; // too far to walk
      return Math.round((distanceKm / 5) * 60 + 2); // 5 km/h + 2 min
    case 'cycling':
      if (distanceKm > 15) return null;
      return Math.round((distanceKm / 15) * 60 + 3);
    case 'bus':
      if (distanceKm > 30) return null;
      return Math.round((distanceKm / 25) * 60 + 8); // wait time
    case 'driving':
      return Math.round((distanceKm / 40) * 60 + 5); // parking
    default:
      return null;
  }
}

export function getRecommendation(
  userLat: number | null,
  userLng: number | null
): Recommendation | null {
  const list = getRecordBook();
  if (list.length === 0) return null;

  const totalBudget = list.reduce((sum, i) => sum + i.price, 0);

  // For each store, find matched items
  const storeMap = new Map<string, StoreCandidate>();

  for (const item of list) {
    const store = allStores.find((s) => s.brand === item.brand);
    if (!store) continue;

    const key = store.name;
    if (!storeMap.has(key)) {
      const distanceKm = userLat !== null && userLng !== null
        ? haversineKm(userLat, userLng, store.lat, store.lng)
        : 99;
      storeMap.set(key, {
        name: store.name,
        brand: store.brand,
        address: store.address,
        lat: store.lat,
        lng: store.lng,
        matchedItems: [],
        totalCost: 0,
        coverage: 0,
        distanceKm,
      });
    }

    const entry = storeMap.get(key)!;
    entry.matchedItems.push({ name: item.name, price: item.price });
    entry.totalCost += item.price;
  }

  // Calculate coverage
  for (const [, store] of storeMap) {
    store.coverage = store.matchedItems.length / list.length;
  }

  // Score stores: coverage * 0.5 + (1 / (1 + distance)) * 0.3 + (totalCost proximity) * 0.2
  const candidates = Array.from(storeMap.values());
  if (candidates.length === 0) return null;

  const minCost = Math.min(...candidates.map((s) => s.totalCost));
  const maxCost = Math.max(...candidates.map((s) => s.totalCost), minCost + 1);

  const scored = candidates.map((s) => {
    const coverageScore = s.coverage;
    const distanceScore = 1 / (1 + s.distanceKm / 5); // normalize to ~5km
    const costScore = 1 - (s.totalCost - minCost) / (maxCost - minCost);
    const score = coverageScore * 0.5 + distanceScore * 0.3 + costScore * 0.2;
    return { ...s, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);
  const topStore = scored[0];

  // Travel estimates for the top store
  const travelEstimates: TravelEstimate[] = [];
  const modes = [
    { key: 'walking', label: '步行', icon: '🚶', labelEn: 'Walking' },
    { key: 'cycling', label: '骑行', icon: '🚲', labelEn: 'Cycling' },
    { key: 'bus', label: '公交', icon: '🚌', labelEn: 'Bus' },
    { key: 'driving', label: '驾车', icon: '🚗', labelEn: 'Driving' },
  ];

  if (userLat !== null && userLng !== null) {
    for (const m of modes) {
      const minutes = estimateTravelTime(topStore.distanceKm, m.key);
      if (minutes !== null) {
        travelEstimates.push({ mode: m.key, label: m.label, icon: m.icon, minutes });
      }
    }
  }

  return {
    topStore,
    allStores: scored,
    totalBudget,
    travelEstimates,
  };
}
