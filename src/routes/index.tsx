import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Compass, HeartHandshake, Lock, Plane, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { VideoHero, scrollToTrips } from '@/components/travel/VideoHero';
import { TripCatalog } from '@/components/travel/TripCatalog';
import { AgencyStatement } from '@/components/travel/AgencyStatement';
import { SouvenirGallery } from '@/components/travel/SouvenirGallery';
import { AgencyDashboard } from '@/components/travel/AgencyDashboard';
import { initialTrips, persistTravelState, readTravelState, registerTravelers, STORAGE_KEY, type Registration, type TravelState } from '@/lib/trips';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Dzayer — Voyages de la Tunisie à l’Algérie' },
    { name: 'description', content: 'Dzayer : des circuits choisis de la Tunisie à l’Algérie, de la Méditerranée au Sahara. Petits groupes, hôtels choisis et rencontres authentiques.' },
    { property: 'og:title', content: 'Dzayer — Voyages de la Tunisie à l’Algérie' },
    { property: 'og:description', content: 'Quatre circuits soigneusement choisis pour rencontrer l’Algérie, de la Méditerranée au Sahara.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Index,
});

function Brand() {
  return <a href="#" className="brand" aria-label="Dzayer — accueil"><svg className="brand-symbol" viewBox="0 0 40 48" fill="none" aria-hidden="true"><path d="M5 43V20C5 11 12 4 20 2c8 2 15 9 15 18v23H5Z" stroke="currentColor" strokeWidth="1.4" /><path d="M11 43V22c0-7 4-12 9-15 5 3 9 8 9 15v21M12 35l7-9 5 5 8-10M8 40h24" stroke="currentColor" strokeWidth="1.2" /><circle cx="21" cy="18" r="3" stroke="currentColor" /></svg><div><div className="brand-name">Dzayer<span className="text-accent">.</span></div><div className="brand-tagline">L’Algérie, autrement</div></div></a>;
}

function Index() {
  const [state, setState] = useState<TravelState>({ trips: initialTrips, registrations: [] });
  const latest = useRef(state);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);
  const [agencyOpen, setAgencyOpen] = useState(false);

  useEffect(() => {
    const saved = readTravelState(); latest.current = saved; setState(saved);
    const sync = (event: StorageEvent) => { if (event.key === STORAGE_KEY) { const value = readTravelState(); latest.current = value; setState(value); } };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const update = (next: TravelState) => {
    latest.current = next; setState(next);
    try { persistTravelState(next); } catch { /* storage full or unavailable */ }
  };

  const register = (registration: Registration) => {
    const saved = readTravelState();
    try { update(registerTravelers(saved, registration)); }
    catch (failure) { throw failure instanceof Error ? failure : new Error('Votre inscription n’a pas pu être enregistrée.'); }
  };

  const scrollToSouvenirs = () => document.getElementById('souvenirs')?.scrollIntoView({ behavior: 'smooth' });

  return <>
    <header className="site-nav"><Brand /><nav className="nav-links" aria-label="Navigation principale"><Button variant="link" className="nav-link" onClick={scrollToTrips}>Nos voyages</Button><Button variant="link" className="nav-link" onClick={scrollToSouvenirs}>Souvenirs</Button><Button variant="link" className="nav-link" onClick={() => setRegistrationsOpen(true)}>Inscriptions {state.registrations.length > 0 && `(${state.registrations.length})`}</Button><Button className="nav-cta" onClick={scrollToTrips}>Découvrir les circuits <ArrowUpRight /></Button></nav></header>

    <main>
      <VideoHero />
      <AgencyStatement state={state} />
      <TripCatalog state={state} onRegister={register} />
      <SouvenirGallery state={state} />
      <div className="journey-strip"><div className="journey-item"><Plane /><div><strong>Au départ de Tunis</strong><small>Votre voyage commence ici</small></div></div><div className="journey-item"><Users /><div><strong>En petit comité</strong><small>Pour de vraies rencontres</small></div></div><div className="journey-item"><Compass /><div><strong>Des circuits choisis</strong><small>L’essentiel, et l’inattendu</small></div></div><div className="journey-item"><HeartHandshake /><div><strong>À vos côtés</strong><small>Du premier jour au retour</small></div></div></div>
    </main>

    <footer className="site-footer"><Brand /><div className="footer-right"><span className="footer-copy">Tunisie → Algérie · Des voyages, des liens, des souvenirs.</span><button className="agency-lock" aria-label="Espace agence" title="Espace agence" onClick={() => setAgencyOpen(true)}><Lock size={13} /> <span>Espace agence</span></button></div></footer>

    <Dialog open={registrationsOpen} onOpenChange={setRegistrationsOpen}><DialogContent className="detail-dialog"><DialogTitle className="detail-title">Mes inscriptions</DialogTitle><DialogDescription>Vos voyages enregistrés sur cet appareil. Inscriptions de démonstration, non transmises à l’agence.</DialogDescription>{state.registrations.length === 0 ? <div className="empty-registration"><ShieldCheck className="mx-auto mb-4" /><p>Votre prochaine histoire reste à écrire.</p><Button className="mt-5" onClick={() => { setRegistrationsOpen(false); scrollToTrips(); }}>Choisir mon voyage <ArrowUpRight /></Button></div> : state.registrations.map((registration) => { const trip = state.trips.find((item) => item.id === registration.tripId); return <article key={registration.id} className="registration-item"><h3>{trip?.title}</h3><p>{registration.fullName} · {registration.travelers} voyageur(s)</p><p>{trip?.date} · {registration.email}</p><p className="text-olive">Inscription enregistrée · Aucun paiement effectué</p></article>; })}</DialogContent></Dialog>

    <AgencyDashboard open={agencyOpen} onOpenChange={setAgencyOpen} state={state} onMutate={update} />
  </>;
}
