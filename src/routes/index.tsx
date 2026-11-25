import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Compass, HeartHandshake, Plane, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { VideoHero, scrollToTrips } from '@/components/travel/VideoHero';
import { TripCatalog } from '@/components/travel/TripCatalog';
import { initialTrips, readTravelState, registerTravelers, STORAGE_KEY, type Registration, type TravelState } from '@/lib/trips';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'rahalet naima — Dzayer, à cœur ouvert' },
    { name: 'description', content: 'Découvrez nos voyages de Tunis à Alger, Constantine, Oran et Djanet. Petits groupes, hôtels choisis et rencontres authentiques avec rahalet naima.' },
    { property: 'og:title', content: 'rahalet naima — Dzayer, à cœur ouvert' },
    { property: 'og:description', content: 'Quatre circuits soigneusement choisis pour rencontrer l’Algérie, de la Méditerranée au Sahara.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

function Brand() {
  return <a href="#" className="brand" aria-label="rahalet naima — accueil"><svg className="brand-symbol" viewBox="0 0 40 48" fill="none" aria-hidden="true"><path d="M5 43V20C5 11 12 4 20 2c8 2 15 9 15 18v23H5Z" stroke="currentColor" strokeWidth="1.4" /><path d="M11 43V22c0-7 4-12 9-15 5 3 9 8 9 15v21M12 35l7-9 5 5 8-10M8 40h24" stroke="currentColor" strokeWidth="1.2" /><circle cx="21" cy="18" r="3" stroke="currentColor" /></svg><div><div className="brand-name">rahalet naima<span className="text-accent">.</span></div><div className="brand-tagline">L’Algérie, autrement</div></div></a>;
}

function Index() {
  const [state, setState] = useState<TravelState>({ trips: initialTrips, registrations: [] });
  const latest = useRef(state);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  useEffect(() => {
    const saved = readTravelState(); latest.current = saved; setState(saved);
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY) { const value = readTravelState(); latest.current = value; setState(value); } };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const register = (registration: Registration) => {
    const saved = readTravelState();
    const next = registerTravelers(saved, registration);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { throw new Error('Le stockage de cet appareil est indisponible. Votre inscription n’a pas été enregistrée.'); }
    latest.current = next; setState(next);
  };
  return <>
    <header className="site-nav"><Brand /><nav className="nav-links" aria-label="Navigation principale"><Button variant="link" className="nav-link" onClick={scrollToTrips}>Nos voyages</Button><Button variant="link" className="nav-link" onClick={() => setRegistrationsOpen(true)}>Inscriptions {state.registrations.length > 0 && `(${state.registrations.length})`}</Button><Button className="nav-cta" onClick={scrollToTrips}>Découvrir les circuits <ArrowUpRight /></Button></nav></header>
    <main><VideoHero /><div className="journey-strip"><div className="journey-item"><Plane /><div><strong>Au départ de Tunis</strong><small>Votre voyage commence ici</small></div></div><div className="journey-item"><Users /><div><strong>En petit comité</strong><small>Pour de vraies rencontres</small></div></div><div className="journey-item"><Compass /><div><strong>Des circuits choisis</strong><small>L’essentiel, et l’inattendu</small></div></div><div className="journey-item"><HeartHandshake /><div><strong>À vos côtés</strong><small>Du premier jour au retour</small></div></div></div><TripCatalog state={state} onRegister={register} /></main>
    <footer className="site-footer"><Brand /><span className="footer-copy">Tunisie → Algérie · Des voyages, des liens, des souvenirs.</span><Button variant="link" onClick={() => setRegistrationsOpen(true)} className="text-xs">Mes inscriptions <ArrowUpRight /></Button></footer>
    <Dialog open={registrationsOpen} onOpenChange={setRegistrationsOpen}><DialogContent className="detail-dialog"><DialogTitle className="detail-title">Mes inscriptions</DialogTitle><DialogDescription>Vos voyages enregistrés sur cet appareil. Inscriptions de démonstration, non transmises à l’agence.</DialogDescription>{state.registrations.length === 0 ? <div className="empty-registration"><ShieldCheck className="mx-auto mb-4" /><p>Votre prochaine histoire reste à écrire.</p><Button className="mt-5" onClick={() => { setRegistrationsOpen(false); scrollToTrips(); }}>Choisir mon voyage <ArrowUpRight /></Button></div> : state.registrations.map((registration) => { const trip = state.trips.find((item) => item.id === registration.tripId); return <article key={registration.id} className="registration-item"><h3>{trip?.title}</h3><p>{registration.fullName} · {registration.travelers} voyageur(s)</p><p>{trip?.date} · {registration.email}</p><p className="text-olive">Inscription enregistrée · Aucun paiement effectué</p></article>; })}</DialogContent></Dialog>
  </>;
}
