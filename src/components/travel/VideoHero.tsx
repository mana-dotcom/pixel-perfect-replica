import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, MapPin, MoveDown, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';

const scenes = [
  { title: "Jardin d’Essai & Maqam Echahid", subtitle: "L’âme verdoyante et historique d’Alger", label: 'Alger · Jardin d’Essai' },
  { title: "Notre-Dame d’Afrique", subtitle: "Panorama sur la baie d’Alger", label: 'Alger · Bologhine' },
  { title: 'Djamaâ El Djazaïr', subtitle: 'Grandeur architecturale au coucher du soleil', label: 'Alger · Mohammadia' },
];

const bounds = [0, 0.35, 0.7, 1];

export function scrollToTrips() {
  document.getElementById('voyages')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

export function VideoHero() {
  const container = useRef<HTMLDivElement>(null);
  const filmVideo = useRef<HTMLVideoElement>(null);
  const backdropVideo = useRef<HTMLVideoElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneIndexRef = useRef(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [curtainUp, setCurtainUp] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Lift the curtain shortly after mount as a fallback (the film's loadeddata
    // event lifts it sooner when the video is ready).
    const fallback = window.setTimeout(() => setCurtainUp(true), 2200);
    return () => window.clearTimeout(fallback);
  }, []);

  useEffect(() => {
    const clip = filmVideo.current;
    const backdrop = bgRef.current;
    const element = container.current;
    const copy = copyRef.current;
    const sceneEl = sceneRef.current;
    if (!clip || !backdrop || !element || !copy || !sceneEl) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let target = 0;
    let rendered = 0;

    const update = () => {
      const rect = element.getBoundingClientRect();
      const viewport = element.firstElementChild?.getBoundingClientRect().height ?? window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / (rect.height - viewport)));
      target = progress;
      const idx = progress < bounds[1] ? 0 : progress < bounds[2] ? 1 : 2;
      if (idx !== sceneIndexRef.current) {
        sceneIndexRef.current = idx;
        setSceneIndex(idx);
      }
    };

    const tick = () => {
      rendered = reduced ? target : rendered + (target - rendered) * 0.15;

      // Scrub the sharp film timeline to match scroll progress (forward & back).
      if (Number.isFinite(clip.duration)) {
        const desired = Math.min(clip.duration - 0.04, rendered * clip.duration);
        if (!clip.seeking && Math.abs(clip.currentTime - desired) > 0.03) {
          clip.currentTime = desired;
        }
      }

      // Parallax drift on the film wrapper.
      const scale = 1 + rendered * 0.1;
      backdrop.style.transform = `scale(${scale})`;

      // Hero copy fades out in the opening stretch.
      const copyOpacity = Math.max(0, 1 - rendered / 0.14);
      copy.style.opacity = String(copyOpacity);
      copy.style.transform = `translateY(${-rendered * 26}px)`;

      // Scene title: words reveal one by one, then drift away.
      const idx = sceneIndexRef.current;
      const segStart = bounds[idx];
      const segEnd = bounds[idx + 1];
      const local = (rendered - segStart) / (segEnd - segStart);
      const words = sceneEl.querySelectorAll<HTMLElement>('.word');
      const n = words.length || 1;
      words.forEach((w, i) => {
        const inStart = (i / n) * 0.4;
        const inDur = 0.18;
        const outStart = 0.62 + (i / n) * 0.18;
        const outDur = 0.2;
        let op = 0;
        let ty = 24;
        if (local < inStart) { op = 0; ty = 24; }
        else if (local < inStart + inDur) { const p = (local - inStart) / inDur; op = p; ty = 24 * (1 - p); }
        else if (local < outStart) { op = 1; ty = 0; }
        else if (local < outStart + outDur) { const p = (local - outStart) / outDur; op = 1 - p; ty = -28 * p; }
        else { op = 0; ty = -28; }
        w.style.opacity = String(Math.max(0, Math.min(1, op)));
        w.style.transform = `translateY(${ty}px)`;
      });
      const labelOpacity = Math.max(0, Math.min(1, local < 0.4 ? local / 0.4 : local > 0.62 ? (1 - local) / 0.38 : 1));
      const label = sceneEl.querySelector<HTMLElement>('.scene-label');
      if (label) label.style.opacity = String(labelOpacity);
      const subtitle = sceneEl.querySelector<HTMLElement>('.scene-subtitle');
      if (subtitle) subtitle.style.opacity = String(labelOpacity * 0.9);

      frame = requestAnimationFrame(tick);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      clip.pause();
    };
  }, []);

  const scene = scenes[sceneIndex] ?? scenes[0];
  if (!scene) return null;
  const words = scene.title.split(' ');

  return (
    <>
      <div className={`curtain ${curtainUp ? 'lifted' : ''}`} aria-hidden={curtainUp}>
        <div className="curtain-emblem">
          <svg viewBox="0 0 40 48" fill="none" aria-hidden="true">
            <path d="M5 43V20C5 11 12 4 20 2c8 2 15 9 15 18v23H5Z" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11 43V22c0-7 4-12 9-15 5 3 9 8 9 15v21M12 35l7-9 5 5 8-10M8 40h24" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="21" cy="18" r="3" stroke="currentColor" />
          </svg>
          <div className="curtain-word">Dzayer</div>
          <div className="curtain-tag">L’Algérie, autrement</div>
        </div>
      </div>

      <section className="hero-scroll" ref={container} aria-label="Découvrir Alger">
        <div className="hero-viewport">
          {/* Soft ambient blurred full-bleed video backdrop */}
          <video
            ref={backdropVideo}
            className="hero-backdrop"
            src="/hero-algeria.mp4"
            poster="/images/alger.jpg"
            muted
            loop
            autoPlay
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="hero-scrim" />

          {/* Crisp centered unstretched sharp film, scrubbed by the scroll */}
          <div className="hero-film-wrap" ref={bgRef}>
            {failed ? (
              <img className="hero-film" src="/images/alger.jpg" alt="Le Jardin d’Essai à Alger" />
            ) : (
              <video
                ref={filmVideo}
                className="hero-film"
                src="/hero-algeria.mp4"
                poster="/images/alger.jpg"
                muted
                playsInline
                preload="auto"
                onLoadedData={() => setCurtainUp(true)}
                onError={() => setFailed(true)}
                aria-label="Voyage aérien à travers les monuments d’Alger"
              />
            )}
          </div>

          <div className="hero-overlay">
            <div className="hero-copy" ref={copyRef}>
              <div className="eyebrow">De la Tunisie à l’Algérie</div>
              <h1 className="hero-title">Dzayer,<br /> <em>à cœur ouvert.</em></h1>
              <p className="hero-description">Des ruelles d’Alger aux dunes du Sahara, des voyages qui rapprochent, des souvenirs qui restent.</p>
              <Button variant="editorial" className="hero-cta" onClick={scrollToTrips}>Découvrir nos voyages <ArrowUpRight /></Button>
              <div className="hero-footnote"><Plane size={12} /> Départs de Tunis <span>·</span> Petits groupes <span>·</span> Grandes rencontres</div>
            </div>

            <div className="hero-scene-title" ref={sceneRef} aria-live="polite">
              <div className="scene-label"><MapPin size={12} /> {scene.label}</div>
              <h2>{words.map((word, i) => <span className="word" key={i}>{word}&nbsp;</span>)}</h2>
              <p className="scene-subtitle">{scene.subtitle}</p>
            </div>
          </div>

          <div className="hero-cue"><MoveDown size={18} strokeWidth={1} /> Défiler le voyage</div>
        </div>
      </section>
    </>
  );
}
