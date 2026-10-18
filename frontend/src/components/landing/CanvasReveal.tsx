import React, { useEffect, useRef } from 'react';

export const CanvasReveal: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle dot grid
    const spacing = 28;
    const dots: Array<{ x: number; y: number; baseAlpha: number; currentAlpha: number }> = [];

    for (let x = spacing / 2; x < width; x += spacing) {
      for (let y = spacing / 2; y < height; y += spacing) {
        dots.push({
          x,
          y,
          baseAlpha: 0.12 + Math.random() * 0.15,
          currentAlpha: 0.12
        });
      }
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connective grid
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dx = mouseX - d.x;
        const dy = mouseY - d.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Responsive radius
        if (dist < 140) {
          const factor = 1 - dist / 140;
          d.currentAlpha = d.baseAlpha + factor * 0.7;
        } else {
          d.currentAlpha += (d.baseAlpha - d.currentAlpha) * 0.05;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        // Lime Sprout #E4FD97 on hover, muted green otherwise
        if (d.currentAlpha > 0.3) {
          ctx.fillStyle = `rgba(228, 253, 151, ${d.currentAlpha})`;
        } else {
          ctx.fillStyle = `rgba(169, 180, 158, ${d.currentAlpha})`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={`hero-bg-canvas ${className}`} />;
};
