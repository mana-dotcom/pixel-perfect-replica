import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Compass, Hotel, Plane, Sparkles } from 'lucide-react';
import type { TravelState } from '@/lib/trips';

function useCountUp(target: number, run: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return value;
}

function Stat({ icon, value, label, run }: { icon: ReactNode; value: number; label: string; run: boolean }) {
  const count = useCountUp(value, run);
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{count.toString().padStart(2, '0')}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function AgencyStatement({ state }: { state: TravelState }) {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') { setRun(true); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { setRun(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const upcoming = state.trips.filter((trip) => !trip.completed);
  const circuits = upcoming.length;
  const hotels = new Set(upcoming.flatMap((trip) => trip.hotels)).size;
  const satisfied = state.trips.filter((trip) => trip.completed).reduce((sum, trip) => sum + trip.registered, 0)
    || upcoming.reduce((sum, trip) => sum + trip.registered, 0);

  return (
    <section className="statement" id="agence" ref={ref}>
      <div className="statement-grid">
        <div className="statement-copy">
          <div className="eyebrow section-eyebrow">La maison de voyage</div>
          <h2 className="section-title">De la Tunisie à l’Algérie, <em>avec soin.</em></h2>
          <p className="statement-lead">
            Dzayer n’est pas une agence de masse. C’est une maison de voyage qui compose, à mains d’artisan,
            des itinéraires serrés entre la Méditerranée et le Sahara. Nous choisissons les hôtels, les routes
            et les rencontres pour que chaque départ depuis Tunis devienne une véritable traversée —
            intime, habitée, et jamais la même.
          </p>
          <p className="statement-note"><Sparkles size={12} /> Petits groupes, guides locaux, hôtels choisis pièce par pièce.</p>
        </div>
        <div className="statement-stats" ref={ref}>
          <Stat icon={<Compass size={18} />} value={circuits} label="Circuits au départ de Tunis" run={run} />
          <Stat icon={<Hotel size={18} />} value={hotels} label="Hôtels partenaires" run={run} />
          <Stat icon={<Plane size={18} />} value={satisfied} label="Voyageurs satisfaits" run={run} />
        </div>
      </div>
    </section>
  );
}
