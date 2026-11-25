import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, MapPin, MoveDown, Plane, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import videoAsset from '@/assets/alger-journey.mp4.asset.json';
import poster from '@/assets/alger-poster.jpg.asset.json';

const scenes = [
  { title: "Jardin d’Essai & Maqam Echahid", subtitle: "L’âme verdoyante et historique d’Alger", label: 'Alger · Jardin d’Essai' },
  { title: "Notre-Dame d’Afrique", subtitle: "Panorama sur la baie d’Alger", label: 'Alger · Bologhine' },
  { title: 'Djamaâ El Djazaïr', subtitle: 'Grandeur architecturale au coucher du soleil', label: 'Alger · Mohammadia' },
];

export function scrollToTrips() {
  document.getElementById('voyages')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

export function VideoHero() {
  const container = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const ambient = useRef<HTMLVideoElement>(null);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const clip = video.current;
    const backdrop = ambient.current;
    const element = container.current;
    if (!clip || !backdrop || !element) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 600px)').matches;
    let frame = 0;
    let target = 0;
    let rendered = 0;
    let lastBackdrop = 0;
    let mobileFallback = false;
    let seekStarted = 0;
    const update = () => {
      const bounds = element.getBoundingClientRect();
      const viewport = element.firstElementChild?.getBoundingClientRect().height ?? window.innerHeight;
      const progress = Math.min(1, Math.max(0, -bounds.top / (bounds.height - viewport)));
      target = progress;
      if (!mobileFallback) setSceneIndex(progress < .35 ? 0 : progress < .7 ? 1 : 2);
    };
    const timeUpdate = () => {
      if (mobileFallback) setSceneIndex(clip.currentTime < 3 ? 0 : clip.currentTime < 5.6 ? 1 : 2);
    };
    const tick = () => {
      rendered = reduced ? target : rendered + (target - rendered) * .15;
      if (Number.isFinite(clip.duration) && !mobileFallback) {
        const desired = Math.min(clip.duration - .04, rendered * clip.duration);
        if (!clip.seeking && Math.abs(clip.currentTime - desired) > .035) {
          clip.currentTime = desired;
          seekStarted = performance.now();
        }
        if (mobile && clip.seeking && seekStarted > 0 && performance.now() - seekStarted > 1800) {
          mobileFallback = true;
          clip.loop = true;
          void clip.play().catch(() => { mobileFallback = false; });
          backdrop.loop = true;
          void backdrop.play().catch(() => {});
        }
        if (!backdrop.seeking && Math.abs(backdrop.currentTime - clip.currentTime) > .13 && performance.now() - lastBackdrop > 100) {
          backdrop.currentTime = clip.currentTime;
          lastBackdrop = performance.now();
        }
      }
      frame = requestAnimationFrame(tick);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    clip.addEventListener('timeupdate', timeUpdate);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      clip.removeEventListener('timeupdate', timeUpdate);
      clip.pause();
      backdrop.pause();
    };
  }, []);

  const scene = scenes[sceneIndex] ?? scenes[0];
  if (!scene) return null;

  return (
    <section className="hero-scroll" ref={container} aria-label="Découvrir Alger">
      <div className="hero-viewport">
        <video className="hero-ambient" ref={ambient} src={videoAsset.url} poster={poster.url} muted playsInline preload="auto" aria-hidden="true" />
        <div className="hero-veil" />
        <div className="hero-layout">
          <div className="hero-copy">
            <div className="eyebrow">De la Tunisie à l’Algérie</div>
            <h1 className="hero-title">Dzayer,<br /> <em>à cœur ouvert.</em></h1>
            <p className="hero-description">Des ruelles d’Alger aux dunes du Sahara,<br />des voyages qui rapprochent, des souvenirs<br className="hidden sm:block" /> qui restent. Avec rahalet naima.</p>
            <Button variant="editorial" className="hero-cta" onClick={scrollToTrips}>Découvrir nos voyages <ArrowUpRight /></Button>
            <div className="hero-footnote"><Plane size={12} /> Départs de Tunis <span>·</span> Petits groupes <span>·</span> Grandes rencontres</div>
          </div>
          <div className="hero-frame">
            {failed ? <img className="h-full w-full object-contain" src={poster.url} alt="Le Jardin d’Essai à Alger" /> : <video ref={video} src={videoAsset.url} poster={poster.url} muted playsInline preload="auto" onError={() => setFailed(true)} aria-label="Voyage aérien à travers les monuments d’Alger" />}
            <div className="frame-corner"><Sparkles size={10} /> Un regard sur Dzayer</div>
            <div className="scene-caption" key={sceneIndex} aria-live="polite">
              <div className="scene-label"><MapPin size={10} /> {scene.label}</div>
              <h2>{scene.title}</h2><p>{scene.subtitle}</p>
            </div>
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