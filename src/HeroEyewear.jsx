import { useEffect, useRef, useState } from "react";

export default function HeroEyewear({ paused, reducedMotion }) {
  const host = useRef(null);
  const controller = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let canceled = false;
    let studio;
    import("./hero-eyewear-studio.js")
      .then(({ createHeroEyewearStudio }) => {
        if (canceled) return;
        try {
          studio = createHeroEyewearStudio(host.current, () => setReady(false));
          controller.current = studio;
          setReady(true);
        } catch {
          setReady(false);
        }
      })
      .catch(() => {
        if (!canceled) setReady(false);
      });
    return () => {
      canceled = true;
      controller.current = null;
      studio?.dispose();
    };
  }, []);
  useEffect(() => {
    controller.current?.setPaused(paused || reducedMotion);
  }, [paused, reducedMotion, ready]);
  return (
    <div
      className={`hero-product${ready ? " is-ready" : ""}`}
      role="img"
      aria-label={
        ready
          ? "Modelo conceitual 3D dos óculos AQUILA, com armação escura e detalhes rosé"
          : "Imagem conceitual dos óculos AQUILA"
      }
    >
      <img
        src="/assets/aquila/eyewear-concept.webp"
        width="1500"
        height="844"
        alt=""
        fetchPriority="high"
        aria-hidden="true"
      />
      <div className="hero-product-canvas" ref={host} aria-hidden="true" />
    </div>
  );
}
