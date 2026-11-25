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

export const STORAGE_KEY = 'rahalet-naima-v1';

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

export function readTravelState(): TravelState {
  const fallback = { trips: initialTrips.map((trip) => ({ ...trip })), registrations: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || !('trips' in parsed) || !('registrations' in parsed)) return fallback;
    if (!Array.isArray(parsed.trips) || !Array.isArray(parsed.registrations)) return fallback;
    const saved = parsed as TravelState;
    if (saved.trips.length !== initialTrips.length || !saved.trips.every((trip) => initialTrips.some((seed) => seed.id === trip.id) && Number.isInteger(trip.registered) && trip.registered >= 0 && trip.registered <= trip.capacity)) return fallback;
    return saved;
  } catch { return fallback; }
}