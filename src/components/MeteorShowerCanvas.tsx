import React, { useEffect, useRef } from 'react';

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  phaseSpeed: number;
  isAmber: boolean;
}

interface MistWisp {
  x: number;
  y: number;
  vx: number;
  rx: number;
  ry: number;
  alpha: number;
  phase: number;
  phaseSpeed: number;
}

interface MeteorShowerCanvasProps {
  paused?: boolean;
}

/**
 * Calm Atmospheric Mist & Slow Floating Dust Motes (Home Screen)
 * Uses pre-rendered offscreen canvas sprites so the animation loop runs with
 * zero per-frame gradient allocations and minimal GPU/CPU overhead.
 */
export const MeteorShowerCanvas: React.FC<MeteorShowerCanvasProps> = ({
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (paused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Pre-render Mist radial gradient sprite once into an offscreen 256x256 canvas
    const mistSpriteSize = 256;
    const mistHalf = mistSpriteSize / 2;
    const mistSprite = document.createElement('canvas');
    mistSprite.width = mistSpriteSize;
    mistSprite.height = mistSpriteSize;
    const mistCtx = mistSprite.getContext('2d');
    if (mistCtx) {
      const grad = mistCtx.createRadialGradient(
        mistHalf,
        mistHalf,
        0,
        mistHalf,
        mistHalf,
        mistHalf
      );
      grad.addColorStop(0, 'rgba(167, 159, 199, 1)');
      grad.addColorStop(0.55, 'rgba(58, 47, 107, 0.45)');
      grad.addColorStop(1, 'rgba(7, 6, 15, 0)');
      mistCtx.fillStyle = grad;
      mistCtx.fillRect(0, 0, mistSpriteSize, mistSpriteSize);
    }

    // 1. Slow drifting atmospheric mist wisps (3 subtle layers)
    const mistWisps: MistWisp[] = Array.from({ length: 3 }, (_, idx) => ({
      x: (width * (idx + 0.5)) / 3,
      y: height * (0.42 + idx * 0.18),
      vx: (idx % 2 === 0 ? 1 : -1) * (0.08 + idx * 0.03),
      rx: Math.max(260, width * 0.28),
      ry: Math.max(90, height * 0.14),
      alpha: 0.035 + idx * 0.01,
      phase: idx * 2.1,
      phaseSpeed: 0.004 + idx * 0.001,
    }));

    // 2. Slow floating dust motes (14 faint particles)
    const dustCount = 14;
    const particles: DustParticle[] = Array.from({ length: dustCount }, (_, idx) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -0.08 - Math.random() * 0.12,
      radius: 1.0 + Math.random() * 1.4,
      baseAlpha: 0.16 + Math.random() * 0.24,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 0.008 + Math.random() * 0.008,
      isAmber: idx % 4 === 0,
    }));

    const render = () => {
      if (document.hidden) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw gentle drifting mist wisps via pre-rendered sprite
      for (let i = 0; i < mistWisps.length; i++) {
        const w = mistWisps[i];
        w.x += w.vx;
        w.phase += w.phaseSpeed;
        if (w.x - w.rx > width) w.x = -w.rx;
        if (w.x + w.rx < 0) w.x = width + w.rx;

        ctx.globalAlpha = w.alpha * (0.75 + 0.25 * Math.sin(w.phase));
        ctx.drawImage(
          mistSprite,
          w.x - w.rx,
          w.y - w.ry,
          w.rx * 2,
          w.ry * 2
        );
      }

      // Draw slow-drifting dust motes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.phaseSpeed;
        p.x += p.vx + Math.sin(p.phase * 0.7) * 0.06;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.globalAlpha = p.baseAlpha * (0.55 + 0.45 * Math.sin(p.phase));
        ctx.fillStyle = p.isAmber ? '#CFB1F1' : '#e6e2f5';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && animationFrameId === null) {
        animationFrameId = requestAnimationFrame(render);
      } else if (document.hidden && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [paused]);

  if (paused) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
      aria-hidden="true"
    />
  );
};
