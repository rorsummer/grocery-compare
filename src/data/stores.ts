export interface Store {
  name: string;
  brand: 'paknsave' | 'countdown' | 'newworld' | 'chinese';
  lat: number;
  lng: number;
  address: string;
}

export const stores: Store[] = [
  // Pak'nSave 奥克兰地区
  { name: "Pak'nSave Royal Oak", brand: 'paknsave', lat: -36.9021, lng: 174.7780, address: '691 Manukau Road, Royal Oak' },
  { name: "Pak'nSave Mt Albert", brand: 'paknsave', lat: -36.8845, lng: 174.7160, address: '1145 New North Road, Mt Albert' },
  { name: "Pak'nSave Albany", brand: 'paknsave', lat: -36.7340, lng: 174.6970, address: 'Don McKinnon Drive, Albany' },
  { name: "Pak'nSave Sylvia Park", brand: 'paknsave', lat: -36.9167, lng: 174.8440, address: '286 Mount Wellington Highway, Mt Wellington' },
  { name: "Pak'nSave Glen Innes", brand: 'paknsave', lat: -36.8730, lng: 174.8600, address: '150 Apirana Avenue, Glen Innes' },
  { name: "Pak'nSave Manukau", brand: 'paknsave', lat: -36.9930, lng: 174.8730, address: '67 Cavendish Drive, Manukau' },
  { name: "Pak'nSave Henderson", brand: 'paknsave', lat: -36.8810, lng: 174.6290, address: '295 Lincoln Road, Henderson' },
  { name: "Pak'nSave Botany", brand: 'paknsave', lat: -36.9320, lng: 174.9140, address: '2 Bishop Dunn Place, Botany' },
  { name: "Pak'nSave Westgate", brand: 'paknsave', lat: -36.8200, lng: 174.6080, address: '7 Westgate Drive, Westgate' },
  { name: "Pak'nSave Ormiston", brand: 'paknsave', lat: -36.9670, lng: 174.9170, address: '1 Bellingham Road, Ormiston' },

  // Countdown / Woolworths 奥克兰地区
  { name: 'Woolworths Newmarket', brand: 'countdown', lat: -36.8700, lng: 174.7780, address: '309 Broadway, Newmarket' },
  { name: 'Woolworths City (Quay Street)', brand: 'countdown', lat: -36.8485, lng: 174.7633, address: '76 Quay Street, Auckland CBD' },
  { name: 'Woolworths Mt Eden', brand: 'countdown', lat: -36.8770, lng: 174.7630, address: 'Dominion Road, Mt Eden' },
  { name: 'Woolworths Grey Lynn', brand: 'countdown', lat: -36.8620, lng: 174.7350, address: '272 Richmond Road, Grey Lynn' },
  { name: 'Woolworths Ponsonby', brand: 'countdown', lat: -36.8560, lng: 174.7440, address: '1 College Hill, Ponsonby' },
  { name: 'Woolworths St Lukes', brand: 'countdown', lat: -36.8820, lng: 174.7360, address: '80 St Lukes Road, St Lukes' },
  { name: 'Woolworths Albany', brand: 'countdown', lat: -36.7280, lng: 174.7040, address: '100 Don McKinnon Drive, Albany' },
  { name: 'Woolworths Botany Downs', brand: 'countdown', lat: -36.9250, lng: 174.9120, address: '588 Chapel Road, Botany Downs' },
  { name: 'Woolworths Manukau', brand: 'countdown', lat: -36.9900, lng: 174.8790, address: '652 Great South Road, Manukau' },
  { name: 'Woolworths Lynnmall', brand: 'countdown', lat: -36.9060, lng: 174.6620, address: '3058 Great North Road, New Lynn' },

  // New World 奥克兰地区
  { name: 'New World Metro Queen Street', brand: 'newworld', lat: -36.8500, lng: 174.7650, address: '125 Queen Street, Auckland CBD' },
  { name: 'New World Victoria Park', brand: 'newworld', lat: -36.8490, lng: 174.7540, address: '2 College Hill, Freemans Bay' },
  { name: 'New World Mt Roskill', brand: 'newworld', lat: -36.9120, lng: 174.7410, address: '53 May Road, Mt Roskill' },
  { name: 'New World Albany', brand: 'newworld', lat: -36.7350, lng: 174.7100, address: '219 Don McKinnon Drive, Albany' },
  { name: 'New World Howick', brand: 'newworld', lat: -36.8950, lng: 174.9320, address: '64 Picton Street, Howick' },
  { name: 'New World Stonefields', brand: 'newworld', lat: -36.8860, lng: 174.8400, address: '40 Stonefields Avenue, Stonefields' },
  { name: 'New World Eastridge', brand: 'newworld', lat: -36.8700, lng: 174.8250, address: '215 Kepa Road, Mission Bay' },

  // 华人超市
  { name: 'Tai Ping Trading Newmarket', brand: 'chinese', lat: -36.8720, lng: 174.7770, address: '5-7 Kent Street, Newmarket' },
  { name: 'Tai Ping Trading Mt Wellington', brand: 'chinese', lat: -36.9150, lng: 174.8350, address: '1/44 Lunn Avenue, Mt Wellington' },
  { name: 'Lim Chhour Food City', brand: 'chinese', lat: -36.8700, lng: 174.7750, address: 'Khyber Pass Road, Newmarket' },
  { name: 'Da Hua Supermarket', brand: 'chinese', lat: -36.9140, lng: 174.7800, address: 'Dominion Road, Mt Roskill' },
  { name: 'Jadan Supermarket', brand: 'chinese', lat: -36.8830, lng: 174.7200, address: '955 New North Road, Mt Albert' },
];

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function getNearbyStores(lat: number, lng: number, radiusKm = 10) {
  return stores
    .map((store) => ({
      ...store,
      distance: getDistance(lat, lng, store.lat, store.lng),
    }))
    .filter((store) => store.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
