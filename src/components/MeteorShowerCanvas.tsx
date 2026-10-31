import React, { useEffect, useRef } from 'react';

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  thickness: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  delay: number;
}

interface MeteorShowerCanvasProps {
  paused?: boolean;
}

export const MeteorShowerCanvas: React.FC<MeteorShowerCanvasProps> = ({
  paused = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef<boolean>(paused);
  pausedRef.current = paused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Sparse, scattered count: only 8 meteors across the whole screen (some delayed so only ~5-7 visible at once)
    const METEOR_COUNT = 8;
    // Uniform parallel diagonal angle (~29 degrees from top-right to bottom-left, matching the reference image)
    const BASE_ANGLE = 29 * (Math.PI / 180);

    const createMeteor = (initialSpread = false): Meteor => {
      const isFaintTiny = Math.random() < 0.62;
      const angle = BASE_ANGLE + (Math.random() - 0.5) * 0.025; // Nearly parallel streaks
      const speed = isFaintTiny ? 3.2 + Math.random() * 2.2 : 4.5 + Math.random() * 2.5;

      // Right to Left movement: vx negative, vy positive
      const vx = -Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      // Scattered broadly across the sky
      const startX = initialSpread
        ? Math.random() * width * 1.3
        : width * 0.25 + Math.random() * width * 1.05;
      const startY = initialSpread
        ? Math.random() * height * 0.85 - height * 0.15
        : -60 + Math.random() * (height * 0.65);

      const maxLife = 110 + Math.floor(Math.random() * 90);

      return {
        x: startX,
        y: startY,
        vx,
        vy,
        length: isFaintTiny ? 55 + Math.random() * 65 : 110 + Math.random() * 95,
        thickness: isFaintTiny ? 0.6 + Math.random() * 0.45 : 1.05 + Math.random() * 0.5,
        alpha: 0,
        // Subtle, pale opacity like the reference photo
        maxAlpha: isFaintTiny ? 0.18 + Math.random() * 0.18 : 0.38 + Math.random() * 0.22,
        life: initialSpread ? Math.floor(Math.random() * maxLife * 0.7) : 0,
        maxLife,
        delay: initialSpread ? Math.floor(Math.random() * 50) : Math.floor(Math.random() * 95),
      };
    };

    const meteors: Meteor[] = Array.from({ length: METEOR_COUNT }, () =>
      createMeteor(true)
    );

    const render = () => {
      if (document.hidden || pausedRef.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < meteors.length; i++) {
        const m = meteors[i];

        if (m.delay > 0) {
          m.delay--;
          continue;
        }

        m.x += m.vx;
        m.y += m.vy;
        m.life++;

        const progress = m.life / m.maxLife;
        if (progress < 0.2) {
          m.alpha = (progress / 0.2) * m.maxAlpha;
        } else if (progress > 0.72) {
          m.alpha = ((1 - progress) / 0.28) * m.maxAlpha;
        } else {
          m.alpha = m.maxAlpha;
        }

        const speed = Math.hypot(m.vx, m.vy) || 1;
        const ux = m.vx / speed;
        const uy = m.vy / speed;

        const tailX = m.x - ux * m.length;
        const tailY = m.y - uy * m.length;

        const currentAlpha = Math.max(0, Math.min(1, m.alpha));

        if (currentAlpha > 0.01) {
          ctx.save();

          // 1. Soft misty cyan-blue outer atmospheric haze along the streak (matching reference image)
          const hazeGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
          hazeGrad.addColorStop(0, `rgba(165, 238, 255, ${currentAlpha * 0.32})`);
          hazeGrad.addColorStop(0.25, `rgba(120, 205, 235, ${currentAlpha * 0.18})`);
          hazeGrad.addColorStop(1, 'rgba(90, 170, 210, 0)');

          ctx.strokeStyle = hazeGrad;
          ctx.lineWidth = m.thickness * 4.2;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          // 2. Thin, delicate pale-cyan / white core streak
          const coreGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
          coreGrad.addColorStop(0, `rgba(235, 252, 255, ${currentAlpha})`);
          coreGrad.addColorStop(0.15, `rgba(180, 238, 250, ${currentAlpha * 0.78})`);
          coreGrad.addColorStop(0.55, `rgba(130, 205, 230, ${currentAlpha * 0.25})`);
          coreGrad.addColorStop(1, 'rgba(110, 185, 215, 0)');

          ctx.strokeStyle = coreGrad;
          ctx.lineWidth = m.thickness;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(tailX, tailY);
          ctx.stroke();

          ctx.restore();
        }

        if (
          m.life >= m.maxLife ||
          m.x + m.length < -80 ||
          m.y - m.length > height + 80
        ) {
          meteors[i] = createMeteor(false);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 h-full w-full"
      aria-hidden="true"
    />
  );
};
