import { useState, type SyntheticEvent } from 'react';
import { ArrowUpRight, CalendarDays, Check, Hotel, MapPin, Plane, Route, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { remainingPlaces, type Registration, type Trip, type TravelState } from '@/lib/trips';

const images: Record<string, string> = {
  alger: '/images/alger.jpg',
  constantine: '/images/constantine.jpg',
  oran: '/images/oran.jpg',
  djanet: '/images/djanet.jpg',
};

const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  img.style.display = 'none';
  img.parentElement?.classList.add('image-fallback');
};
const filters = ['Tous les voyages', 'Culture & patrimoine', 'Évasion méditerranéenne', 'Nature & aventure'];
const amount = (value: number) => new Intl.NumberFormat('fr-TN').format(value);

export function TripCatalog({ state, onRegister }: { state: TravelState; onRegister: (registration: Registration) => void }) {
  const [filter, setFilter] = useState(filters[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Registration | null>(null);
  const [travelers, setTravelers] = useState(1);
  const [error, setError] = useState('');
  const selected = state.trips.find((trip) => trip.id === selectedId);
  const open = (trip: Trip) => { setSelectedId(trip.id); setConfirmed(null); setTravelers(1); setError(''); };

  return (
    <section className="catalog" id="voyages">
      <div className="catalog-header">
        <div><div className="eyebrow section-eyebrow">Nos prochaines échappées</div><h2 className="section-title">Un voyage. <em>Mille histoires.</em></h2><p className="section-description">Quatre façons de rencontrer l’Algérie. Choisissez celle qui vous ressemble.</p></div>
        <div className="collection-count"><Route size={14} /> 04 circuits soigneusement choisis</div>
      </div>
      <div className="filters" aria-label="Catégories de voyages">{filters.map((item) => <Button key={item} className="filter-button" variant={filter === item ? 'default' : 'outline'} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</Button>)}</div>
      <div className="trip-grid">{state.trips.filter((trip) => !trip.completed && (filter === filters[0] || trip.category === filter)).map((trip) => {
        const remaining = remainingPlaces(trip);
        return <article className="trip-card" key={trip.id}>
          <div className="trip-image"><img src={images[trip.id]} alt={trip.region} loading="lazy" onError={handleImageError} /><span className="trip-category"><MapPin size={10} /> {trip.category}</span><span className="trip-duration">{trip.duration}</span></div>
          <div className="trip-body">
            <div className="trip-region"><MapPin size={10} /> {trip.region}</div><h3 className="trip-title">{trip.title}</h3>
            <div className="trip-meta"><span><Plane size={12} /> Départ de Tunis</span><span><CalendarDays size={12} /> {trip.date}</span></div>
            <div className="trip-info"><strong><Route size={12} /> Lieux à visiter</strong>{trip.places.join(' · ')}</div>
            <div className="trip-info"><strong><Hotel size={12} /> Hôtels inclus</strong>{trip.hotels.join(' · ')}</div>
            <div className="capacity-row"><span><Users size={10} className="mr-1 inline" /> {trip.registered} / {trip.capacity} inscrits</span><span className={`remaining ${remaining < 5 ? 'urgent' : ''}`}>{remaining === 0 ? 'Complet' : `${remaining} places restantes`}</span></div>
            <div className="capacity-bar" role="progressbar" aria-label="Voyageurs inscrits" aria-valuenow={trip.registered} aria-valuemin={0} aria-valuemax={trip.capacity}>{Array.from({ length: 24 }, (_, i) => <span key={i} className={i / 24 < trip.registered / trip.capacity ? 'filled' : ''} />)}</div>
            <div className="trip-bottom"><div className="price"><span>À partir de</span><strong>{amount(trip.price)} <small>TND / pers.</small></strong></div><Button className="trip-button" variant={remaining === 0 ? 'outline' : 'default'} onClick={() => open(trip)}>{remaining === 0 ? 'Voir les détails' : 'Voir détails & S’inscrire'} <ArrowUpRight size={13} /></Button></div>
          </div>
        </article>;
      })}</div>
      <div className="editorial-note"><h2>Si près de chez nous. Si loin du quotidien.</h2><p>Des rencontres sincères, des adresses choisies et le plaisir de voyager ensemble.</p><p className="form-notice">Circuits, tarifs et hôtels présentés à titre d’exemple. Inscriptions enregistrées uniquement sur cet appareil.</p></div>
      <Dialog open={Boolean(selected)} onOpenChange={(isOpen) => { if (!isOpen) setSelectedId(null); }}>
        {selected && <DialogContent className="detail-dialog"><DialogTitle className="detail-title">{selected.title}</DialogTitle><DialogDescription>{selected.date} · {selected.duration} · Départ de Tunis</DialogDescription>
          {confirmed ? <div className="confirmation" role="status"><div className="confirmation-icon"><Check size={25} /></div><h3>Le voyage commence ici.</h3><p>Merci {confirmed.fullName}, votre inscription pour {confirmed.travelers} voyageur(s) a bien été enregistrée sur cet appareil.</p><p>{selected.title}<br />{selected.date}<br /><strong>{amount(selected.price * confirmed.travelers)} TND</strong></p><p>Aucun paiement n’a été effectué. Ceci est une inscription de démonstration, sans réservation auprès de l’agence.</p><Button onClick={() => setSelectedId(null)}>Continuer à explorer <ArrowUpRight /></Button></div> : <div className="detail-columns">
            <div><h3 className="detail-heading">Au programme</h3><ol className="itinerary">{selected.itinerary.map((day, index) => <li key={day}><span className="day-number">J{index + 1}</span><span>{day}</span></li>)}</ol><h3 className="detail-heading">Hôtels inclus</h3><ul className="hotel-list">{selected.hotels.map((hotel) => <li key={hotel}>{hotel}</li>)}</ul></div>
            <div><h3 className="detail-heading">S’inscrire à ce voyage</h3><p className="mb-4 text-xs text-olive">{remainingPlaces(selected) === 0 ? 'Ce voyage est complet.' : `${remainingPlaces(selected)} places encore disponibles`}</p>
              {remainingPlaces(selected) > 0 ? <form className="registration-form" onSubmit={(event) => {
                event.preventDefault(); setError('');
                const data = new FormData(event.currentTarget);
                const fullName = String(data.get('fullName') ?? '').trim();
                const phone = String(data.get('phone') ?? '').trim();
                const email = String(data.get('email') ?? '').trim();
                if (!fullName || !phone || !email) { setError('Veuillez compléter vos coordonnées.'); return; }
                const registration: Registration = { id: crypto.randomUUID(), tripId: selected.id, fullName, phone, email, travelers, createdAt: new Date().toISOString() };
                try { onRegister(registration); setConfirmed(registration); } catch (failure) { setError(failure instanceof Error ? failure.message : 'Votre inscription n’a pas pu être enregistrée.'); }
              }}>
                <label className="form-field">Nom et prénom<input name="fullName" autoComplete="name" required placeholder="Votre nom complet" maxLength={100} /></label>
                <label className="form-field">Téléphone<input name="phone" type="tel" autoComplete="tel" required placeholder="+216" maxLength={30} /></label>
                <label className="form-field">Adresse e-mail<input name="email" type="email" autoComplete="email" required placeholder="vous@exemple.com" maxLength={150} /></label>
                <label className="form-field">Nombre de voyageurs<input name="travelers" type="number" min={1} max={remainingPlaces(selected)} step={1} required value={travelers} onChange={(event) => setTravelers(Number(event.target.value))} /></label>
                <div className="form-total"><span>Total pour {travelers} voyageur(s)</span><strong>{amount(selected.price * travelers)} TND</strong></div>
                {error && <p className="form-error" role="alert">{error}</p>}
                <Button type="submit" disabled={!Number.isInteger(travelers) || travelers < 1 || travelers > remainingPlaces(selected)}>Confirmer mon inscription <ArrowUpRight /></Button>
                <p className="form-notice">Inscription de démonstration conservée sur cet appareil uniquement. Aucun paiement ni envoi à l’agence.</p>
              </form> : <p className="form-notice">Toutes les places ont été prises. Découvrez nos autres départs.</p>}
            </div>
          </div>}
        </DialogContent>}
      </Dialog>
    </section>
  );
}