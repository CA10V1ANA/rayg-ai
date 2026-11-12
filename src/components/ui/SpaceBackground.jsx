import { useEffect, useRef } from "react";

// Adapted from the supplied SpaceBackground: scoped canvas, responsive DPR,
// frame-independent motion, and no work when hidden or motion is reduced.
export default function SpaceBackground({
  particleCount = 260,
  particleColor = "#e6a8a8",
  backgroundColor = "transparent",
  reducedMotion = false,
  className = "",
}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    let frame = 0,
      width = 0,
      height = 0,
      radius = 0,
      previous = 0,
      elapsed = 0;
    let particles = [];
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.max(100, Math.min(width * 0.36, height * 0.25, 220));
      particles = Array.from(
        { length: width < 600 ? Math.min(particleCount, 160) : particleCount },
        () => ({
          angle: Math.random() * Math.PI * 2,
          ring: radius * (1.1 + Math.random() * 2.2),
          size: 0.6 + Math.random() * 2.1,
          speed: 0.08 + Math.random() * 0.25,
          opacity: 0.12 + Math.random() * 0.65,
        }),
      );
    };
    const render = (now) => {
      const dt = Math.min((now - previous) / 1000 || 0.016, 0.05);
      previous = now;
      elapsed += dt;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = particleColor;
      const count = Math.min(particles.length, Math.floor(40 + elapsed * 150));
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.ring = radius + (p.ring - radius) * Math.exp(-dt * 2.6);
        p.angle += p.speed * dt;
        ctx.globalAlpha = p.opacity * Math.min(1, elapsed * 2);
        ctx.beginPath();
        ctx.arc(
          width / 2 + Math.cos(p.angle) * p.ring,
          height / 2 + Math.sin(p.angle) * p.ring * 0.76,
          p.size,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(render);
    };
    const resume = () => {
      previous = 0;
      frame = requestAnimationFrame(render);
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) resume();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    if (!document.hidden) resume();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [particleCount, particleColor, reducedMotion]);
  return (
    <canvas
      ref={canvasRef}
      className={`intro-particles ${className}`}
      style={{ background: backgroundColor }}
      aria-hidden="true"
    />
  );
}
