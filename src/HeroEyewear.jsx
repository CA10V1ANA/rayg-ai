import { useEffect, useRef, useState } from "react";

export default function HeroEyewear({ paused, reducedMotion }) {
  const host = useRef(null);
  const controller = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let canceled = false;
    let studio;
    import("./hero-eyewear-studio.js")
      .then(({ createHeroEyewearStudio }) => {
        if (canceled) return;
        try {
          studio = createHeroEyewearStudio(host.current, () => {
            setReady(false);
            setFailed(true);
          });
          controller.current = studio;
          setReady(true);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => {
        if (!canceled) setFailed(true);
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
      className={`hero-product${ready ? " is-ready" : ""}${failed ? " is-failed" : ""}`}
      role="img"
      aria-label={
        failed
          ? "Imagem conceitual dos óculos AQUILA"
          : "Modelo conceitual 3D dos óculos AQUILA, com armação escura e detalhes rosé"
      }
    >
      {failed && (
        <img
          src="/assets/aquila/eyewear-concept.webp"
          width="1500"
          height="844"
          alt=""
          fetchPriority="high"
          aria-hidden="true"
        />
      )}
      {!ready && !failed && (
        <span className="hero-product-loading" role="status">
          Preparando os óculos em 3D…
        </span>
      )}
      <div className="hero-product-canvas" ref={host} aria-hidden="true" />
    </div>
  );
}
