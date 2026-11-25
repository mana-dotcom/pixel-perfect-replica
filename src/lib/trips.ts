export interface Souvenir {
  photos: string[];
  highlights: string[];
}

export interface Trip {
  id: string;
  title: string;
  region: string;
  category: string;
  date: string;
  duration: string;
  price: number;
  capacity: number;
  registered: number;
  places: string[];
  hotels: string[];
  itinerary: string[];
  /** Past/completed trip shown in the Souvenirs gallery. */
  completed?: boolean;
  /** Curated photos + highlights for a completed trip. */
  souvenirs?: Souvenir;
}

export interface Registration {
  id: string;
  tripId: string;
  fullName: string;
  phone: string;
  email: string;
  travelers: number;
  createdAt: string;
}

export interface TravelState {
  trips: Trip[];
  registrations: Registration[];
}

export const STORAGE_KEY = 'dzayer-travel-v2';

export const initialTrips: Trip[] = [
  {
    id: 'alger', title: 'Escapade à Alger & La Casbah', region: 'Alger, la ville blanche', category: 'Culture & patrimoine',
    date: '18 – 22 déc. 2026', duration: '5 jours · 4 nuits', price: 890, capacity: 24, registered: 18,
    places: ["Jardin d’Essai", 'La Casbah', "Notre-Dame d’Afrique", 'Maqam Echahid'],
    hotels: ['Hôtel El Aurassi ★★★★★'],
    itinerary: ['Départ de Tunis, arrivée à Alger et installation à l’hôtel.', 'Promenade guidée dans la Casbah, palais et déjeuner traditionnel.', 'Jardin d’Essai, Maqam Echahid et musée national du Moudjahid.', 'Notre-Dame d’Afrique, Djamaâ El Djazaïr et balade sur le front de mer.', 'Matinée libre, derniers souvenirs et retour à Tunis.'],
  },
  {
    id: 'constantine', title: 'Constantine & Les Ponts Suspendus', region: 'Constantine, la ville des ponts', category: 'Culture & patrimoine',
    date: '24 – 27 déc. 2026', duration: '4 jours · 3 nuits', price: 720, capacity: 20, registered: 16,
    places: ["Pont Sidi M’Cid", 'Palais Ahmed Bey', 'Pont Sidi Rached', 'Djémila'],
    hotels: ['Constantine Marriott Hotel ★★★★★'],
    itinerary: ['Départ de Tunis et installation à Constantine.', 'Les ponts suspendus, les gorges du Rhumel et le palais Ahmed Bey.', 'Excursion aux vestiges romains de Djémila et dîner de groupe.', 'Découverte de la vieille ville puis retour à Tunis.'],
  },
  {
    id: 'oran', title: 'Oran La Radieuse', region: 'Oran, la perle de l’ouest', category: 'Évasion méditerranéenne',
    date: '8 – 12 janv. 2027', duration: '5 jours · 4 nuits', price: 1050, capacity: 24, registered: 24,
    places: ['Fort Santa Cruz', 'Front de mer', 'Sidi El Houari', 'Place du 1er Novembre'],
    hotels: ['Royal Hotel Oran ★★★★★'],
    itinerary: ['Départ de Tunis, arrivée et installation à Oran.', 'Découverte du quartier historique Sidi El Houari et du centre-ville.', 'Fort et chapelle de Santa Cruz, panorama sur la Méditerranée.', 'Front de mer et excursion côtière à Aïn El Turck.', 'Petit-déjeuner et retour à Tunis.'],
  },
  {
    id: 'djanet', title: 'Aventure Sahara & Djanet', region: 'Djanet, aux portes du Tassili', category: 'Nature & aventure',
    date: '16 – 22 janv. 2027', duration: '7 jours · 6 nuits', price: 1890, capacity: 16, registered: 9,
    places: ["Tassili n’Ajjer", 'Dunes de Tadrart', 'Essendilène', 'Oasis de Djanet'],
    hotels: ['Hôtel La Grotte ★★★', 'Bivouac saharien aménagé'],
    itinerary: ['Départ de Tunis via Alger, arrivée à Djanet et accueil par l’équipe locale.', 'Oasis de Djanet, marché et découverte de la culture touarègue.', 'Départ en 4×4 vers la Tadrart et premier bivouac sous les étoiles.', 'Dunes rouges, arches de grès et peintures rupestres.', 'Randonnée accompagnée dans les paysages du Tassili.', 'Canyon d’Essendilène et retour à l’hôtel de Djanet.', 'Transfert à l’aéroport et retour à Tunis via Alger.'],
  },
  // — Souvenirs de Voyages : circuits déjà réalisés —
  {
    id: 'souvenir-alger', title: 'Alger, la Blanche', region: 'Alger · Casbah & Méditerranée', category: 'Culture & patrimoine',
    date: 'Mars 2026', duration: '5 jours · réalisé', price: 0, capacity: 24, registered: 24, completed: true,
    places: ['La Casbah', 'Jardin d’Essai', 'Notre-Dame d’Afrique'],
    hotels: ['Hôtel El Aurassi ★★★★★'],
    itinerary: [],
    souvenirs: {
      photos: ['/images/alger.jpg', '/images/oran.jpg'],
      highlights: ['Le dédale blanc de la Casbah au lever du jour', 'Le calme du Jardin d’Essai entre palmiers et bambous', 'Le panorama sur la baie depuis Notre-Dame d’Afrique'],
    },
  },
  {
    id: 'souvenir-djanet', title: 'Djanet, portes du Tassili', region: 'Djanet · Tassili n’Ajjer', category: 'Nature & aventure',
    date: 'Février 2026', duration: '7 jours · réalisé', price: 0, capacity: 16, registered: 16, completed: true,
    places: ["Tassili n’Ajjer", 'Dunes de Tadrart', 'Essendilène'],
    hotels: ['Bivouac saharien aménagé'],
    itinerary: [],
    souvenirs: {
      photos: ['/images/djanet.jpg', '/images/tassili.jpg'],
      highlights: ['Les dunes rouges de la Tadrart au coucher du soleil', 'Les peintures rupestres du Tassili, mémoire du désert', 'Le ciel étoilé du bivouac à Essendilène'],
    },
  },
];

export function remainingPlaces(trip: Trip) {
  return Math.max(0, trip.capacity - trip.registered);
}

export function registerTravelers(state: TravelState, registration: Registration): TravelState {
  const trip = state.trips.find((item) => item.id === registration.tripId);
  if (!trip) throw new Error('Ce voyage n’est plus disponible.');
  if (!Number.isInteger(registration.travelers) || registration.travelers < 1) {
    throw new Error('Veuillez choisir au moins un voyageur.');
  }
  if (registration.travelers > remainingPlaces(trip)) {
    throw new Error(`Il reste seulement ${remainingPlaces(trip)} place(s) pour ce voyage.`);
  }
  return {
    trips: state.trips.map((item) => item.id === trip.id ? { ...item, registered: item.registered + registration.travelers } : item),
    registrations: [...state.registrations, registration],
  };
}

export function removeRegistration(state: TravelState, registrationId: string): TravelState {
  const registration = state.registrations.find((item) => item.id === registrationId);
  if (!registration) return state;
  return {
    trips: state.trips.map((trip) => trip.id === registration.tripId
      ? { ...trip, registered: Math.max(0, trip.registered - registration.travelers) }
      : trip),
    registrations: state.registrations.filter((item) => item.id !== registrationId),
  };
}

export function createTrip(state: TravelState, trip: Trip): TravelState {
  return { trips: [...state.trips, trip], registrations: state.registrations };
}

export function updateTrip(state: TravelState, id: string, patch: Partial<Trip>): TravelState {
  return {
    trips: state.trips.map((trip) => {
      if (trip.id !== id) return trip;
      const next = { ...trip, ...patch };
      next.registered = Math.min(next.registered, next.capacity);
      return next;
    }),
    registrations: state.registrations,
  };
}

export function deleteTrip(state: TravelState, id: string): TravelState {
  return {
    trips: state.trips.filter((trip) => trip.id !== id),
    registrations: state.registrations.filter((item) => item.tripId !== id),
  };
}

export function setSouvenirs(state: TravelState, tripId: string, souvenirs: Souvenir): TravelState {
  return {
    trips: state.trips.map((trip) => trip.id === tripId ? { ...trip, completed: true, souvenirs } : trip),
    registrations: state.registrations,
  };
}

export function makeId(prefix = 'id'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function persistTravelState(state: TravelState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isValidTrip(value: unknown): value is Trip {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' && typeof t.title === 'string' && typeof t.region === 'string' &&
    typeof t.category === 'string' && typeof t.date === 'string' && typeof t.duration === 'string' &&
    typeof t.price === 'number' && typeof t.capacity === 'number' && typeof t.registered === 'number' &&
    Number.isInteger(t.registered) && t.registered >= 0 && t.registered <= t.capacity &&
    Array.isArray(t.places) && Array.isArray(t.hotels) && Array.isArray(t.itinerary)
  );
}

export function readTravelState(): TravelState {
  const fallback = { trips: initialTrips.map((trip) => ({ ...trip })), registrations: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !('trips' in parsed) || !('registrations' in parsed)) return fallback;
    const saved = parsed as TravelState;
    if (!Array.isArray(saved.trips) || !Array.isArray(saved.registrations)) return fallback;
    if (!saved.trips.every(isValidTrip)) return fallback;
    return saved;
  } catch { return fallback; }
}
