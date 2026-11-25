import { useState, type SyntheticEvent } from 'react';
import { Camera, MapPin } from 'lucide-react';
import type { TravelState } from '@/lib/trips';

const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget;
  img.style.display = 'none';
  img.parentElement?.classList.add('image-fallback');
};

export function SouvenirGallery({ state }: { state: TravelState }) {
  const [active, setActive] = useState<string | null>(null);
  const past = state.trips.filter((trip) => trip.completed && trip.souvenirs && trip.souvenirs.photos.length > 0);
  const selected = past.find((trip) => trip.id === active) ?? null;

  return (
    <section className="souvenirs" id="souvenirs">
      <div className="souvenirs-header">
        <div>
          <div className="eyebrow section-eyebrow"><Camera size={11} /> Souvenirs de voyages</div>
          <h2 className="section-title">Ce qui reste, <em>longtemps après.</em></h2>
          <p className="section-description">Quelques circuits déjà vécus, et les instants qui y sont restés.</p>
        </div>
      </div>

      {past.length === 0 ? (
        <p className="souvenirs-empty">Les premiers souvenirs de la maison Dzayer seront bientôt ici.</p>
      ) : (
        <div className="souvenir-list">
          {past.map((trip, index) => (
            <article className={`souvenir-item ${index % 2 ? 'reverse' : ''}`} key={trip.id}>
              <div className="souvenir-photos">
                <div className="souvenir-photo-main">
                  <img src={trip.souvenirs!.photos[0]} alt={trip.title} loading="lazy" onError={handleImageError} />
                </div>
                {trip.souvenirs!.photos[1] && (
                  <div className="souvenir-photo-side">
                    <img src={trip.souvenirs!.photos[1]} alt={trip.title} loading="lazy" onError={handleImageError} />
                  </div>
                )}
              </div>
              <div className="souvenir-text">
                <div className="souvenir-meta"><MapPin size={11} /> {trip.region} <span>·</span> {trip.date}</div>
                <h3 className="souvenir-title">{trip.title}</h3>
                <ul className="souvenir-highlights">
                  {trip.souvenirs!.highlights.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <button className="souvenir-link" onClick={() => setActive(trip.id)}>Voyage réalisé · {trip.registered} voyageurs</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="souvenir-lightbox" role="dialog" aria-modal="true" onClick={() => setActive(null)}>
          <div className="lightbox-inner" onClick={(event) => event.stopPropagation()}>
            <button className="lightbox-close" aria-label="Fermer" onClick={() => setActive(null)}>×</button>
            <div className="lightbox-photos">
              {selected.souvenirs!.photos.map((photo, i) => (
                <img key={i} src={photo} alt={`${selected.title} ${i + 1}`} onError={handleImageError} />
              ))}
            </div>
            <h3>{selected.title}</h3>
            <ul className="souvenir-highlights">
              {selected.souvenirs!.highlights.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}


