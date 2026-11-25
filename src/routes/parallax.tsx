import { createFileRoute } from '@tanstack/react-router';
import ParallaxDemo from '@/demos/default';

export const Route = createFileRoute('/parallax')({
  head: () => ({
    meta: [
      { title: 'Parallax — Dzayer' },
      { name: 'description', content: 'A scroll-driven parallax showcase built with GSAP ScrollTrigger and Lenis.' },
    ],
  }),
  component: ParallaxDemo,
});
