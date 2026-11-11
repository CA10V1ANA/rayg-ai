import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import "./case-viewer.css";

export default function CaseViewer({ variant, name, brand = "RAYG" }) {
  const host = useRef(null),
    controller = useRef(null);
  const near = useInView(host, { once: true, margin: "300px 0px" });
  const [ready, setReady] = useState(false),
    [unavailable, setUnavailable] = useState(false),
    [openings, setOpenings] = useState({ essencial: 0, pro: 0, ultra: 0 });
  const opening = openings[variant] ?? 0;
  const setOpening = (value) =>
    setOpenings((previous) => ({ ...previous, [variant]: value }));
  const mechanisms = {
    essencial: "Tampa removível",
    pro: "Tampa articulada",
    ultra: "Tampa e gaveta em etapas",
  };
  const hints = {
    essencial: "Levante e afaste a tampa.",
    pro: "Abra a tampa articulada.",
    ultra: "Abra a tampa. Depois, deslize a gaveta.",
  };
  useEffect(() => {
    if (!near) return;
    setReady(false);
    let canceled = false,
      studio;
    import("./case-studio.js")
      .then(({ createCaseStudio }) => {
        if (canceled) return;
        try {
          studio = createCaseStudio(
            host.current,
            variant,
            () => setUnavailable(true),
            brand,
          );
          controller.current = studio;
          setReady(true);
        } catch {
          setUnavailable(true);
        }
      })
      .catch(() => {
        if (!canceled) setUnavailable(true);
      });
    return () => {
      canceled = true;
      studio?.dispose();
    };
  }, [near]);
  useEffect(() => {
    if (ready) controller.current?.setVariant(variant, opening / 100);
  }, [variant, ready]);
  useEffect(() => {
    if (ready) controller.current?.setOpening(opening / 100);
  }, [opening, ready]);
  const disabled = !ready || unavailable;
  return (
    <div className="case-viewer">
      <div className="case-viewer-top">
        <span>
          {brand} {name}
          <small>{mechanisms[variant]}</small>
        </span>
        <span>CONCEITO 3D</span>
      </div>
      <div
        ref={host}
        className="case-canvas"
        id="case-canvas"
        role="img"
        aria-label={`Caixa conceitual do ${brand} ${name}, ${opening === 0 ? "fechada" : opening === 100 ? "aberta" : `com abertura de ${opening}%`}`}
      >
        {!ready && !unavailable && (
          <span className="case-loading" role="status">
            Preparando a caixa…
          </span>
        )}
        {unavailable && (
          <div className="case-fallback">
            <img
              src={
                brand === "AQUILA"
                  ? "/assets/aquila/brandmark.svg"
                  : "/assets/rayg-kits-concept.png"
              }
              alt={`Apresentação conceitual ${brand}`}
            />
            <p>A visualização 3D não está disponível neste aparelho.</p>
          </div>
        )}
      </div>
      <div className="case-controls">
        <div className="case-range">
          <div>
            <label htmlFor="case-opening">Abertura da caixa</label>
            <output htmlFor="case-opening">
              {opening === 0
                ? "Fechada"
                : opening === 100
                  ? "Aberta"
                  : `${opening}%`}
            </output>
          </div>
          <input
            id="case-opening"
            type="range"
            min="0"
            max="100"
            step="1"
            value={opening}
            disabled={disabled}
            onChange={(e) => setOpening(Number(e.target.value))}
            aria-describedby="case-hint"
          />
        </div>
        <button
          className="button case-toggle"
          id="case-toggle"
          disabled={disabled}
          aria-pressed={opening > 0}
          onClick={() => setOpening(opening > 0 ? 0 : 100)}
        >
          {opening > 0 ? "Fechar caixa" : "Abrir caixa"}{" "}
          <span aria-hidden="true">{opening > 0 ? "−" : "+"}</span>
        </button>
      </div>
      <p className="case-hint" id="case-hint">
        {unavailable
          ? "A visualização 3D não está disponível neste aparelho."
          : hints[variant]}
      </p>
    </div>
  );
}
