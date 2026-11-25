import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, MapPin, MoveDown, Plane } from 'lucide-react';
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
  const video = useRef<HTMLVideoElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const sceneIndexRef = useRef(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const clip = video.current;
    const backdrop = bgRef.current;
    const element = container.current;
    const copy = copyRef.current;
    const sceneEl = sceneRef.current;
    if (!clip || !backdrop || !element || !copy || !sceneEl) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let target = 0;
    let rendered = 0;
    let mobileFallback = false;
    let seekStarted = 0;

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

      // Scrub the video timeline to match scroll progress.
      if (Number.isFinite(clip.duration) && !mobileFallback) {
        const desired = Math.min(clip.duration - 0.04, rendered * clip.duration);
        if (!clip.seeking && Math.abs(clip.currentTime - desired) > 0.035) {
          clip.currentTime = desired;
          seekStarted = performance.now();
        }
        // Mobile browsers block manual seeking; fall back to autoplay.
        if (window.matchMedia('(max-width: 600px)').matches && clip.seeking && seekStarted > 0 && performance.now() - seekStarted > 1800) {
          mobileFallback = true;
          clip.loop = true;
          void clip.play().catch(() => { mobileFallback = false; });
        }
      }

      // Subtle parallax scale on the background.
      const scale = 1 + rendered * 0.14;
      const translateY = rendered * 9;
      backdrop.style.transform = `scale(${scale}) translateY(${translateY}%)`;

      // Hero copy fades out in the first stretch of the scroll.
      const copyOpacity = Math.max(0, 1 - rendered / 0.16);
      copy.style.opacity = String(copyOpacity);
      copy.style.transform = `translateY(${-rendered * 30}px)`;

      // Scene title fades in/out within its scroll segment.
      const idx = sceneIndexRef.current;
      const segStart = bounds[idx];
      const segEnd = bounds[idx + 1];
      const local = (rendered - segStart) / (segEnd - segStart);
      const sceneOpacity = Math.max(0, Math.min(1, local < 0.2 ? local / 0.2 : local > 0.8 ? (1 - local) / 0.2 : 1));
      sceneEl.style.opacity = String(sceneOpacity);
      sceneEl.style.transform = `translateY(${(1 - sceneOpacity) * 24}px)`;

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

  return (
    <section className="hero-scroll" ref={container} aria-label="Découvrir Alger">
      <div className="hero-viewport">
        <div className="hero-background" ref={bgRef}>
          {failed ? (
            <img className="hero-background-media" src="/images/alger.jpg" alt="Le Jardin d’Essai à Alger" />
          ) : (
            <video
              ref={video}
              className="hero-background-media"
              src="/hero-algeria.mp4"
              poster="/images/alger.jpg"
              muted
              playsInline
              preload="auto"
              onError={() => setFailed(true)}
              aria-label="Voyage aérien à travers les monuments d’Alger"
            />
          )}
        </div>
        <div className="hero-scrim" />
        <div className="hero-overlay">
          <div className="hero-copy" ref={copyRef}>
            <div className="eyebrow">De la Tunisie à l’Algérie</div>
            <h1 className="hero-title">Dzayer,<br /> <em>à cœur ouvert.</em></h1>
            <p className="hero-description">Des ruelles d’Alger aux dunes du Sahara, des voyages qui rapprochent, des souvenirs qui restent. Avec rahalet naima.</p>
            <Button variant="editorial" className="hero-cta" onClick={scrollToTrips}>Découvrir nos voyages <ArrowUpRight /></Button>
            <div className="hero-footnote"><Plane size={12} /> Départs de Tunis <span>·</span> Petits groupes <span>·</span> Grandes rencontres</div>
          </div>
          <div className="hero-scene-title" ref={sceneRef} aria-live="polite">
            <div className="scene-label"><MapPin size={12} /> {scene.label}</div>
            <h2>{scene.title}</h2>
            <p>{scene.subtitle}</p>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="scroll-prompt"><MoveDown size={22} strokeWidth={1} /> Au fil du voyage</div>
          <div className="scene-nav"><span>0{sceneIndex + 1}</span>{scenes.map((item, index) => <span key={item.title} className={`scene-tick ${index === sceneIndex ? 'active' : ''}`} />)}<span>03</span><ArrowDown size={12} /></div>
        </div>
      </div>
    </section>
  );
}
