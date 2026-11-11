import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
const TARGET = 0.5;
export default function Simulator() {
  const [diopter, setDiopter] = useState(-4);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const frame = useRef();
  const reduced = useReducedMotion();
  const clarity = Math.max(
    0,
    Math.round(100 - (Math.abs(diopter - TARGET) / 6) * 100),
  );
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  function stop() {
    cancelAnimationFrame(frame.current);
    setBusy(false);
  }
  function reset() {
    stop();
    setDiopter(-4);
    setAnnouncement("Demonstração reiniciada.");
  }
  function autofocus() {
    stop();
    setBusy(true);
    setAnnouncement("Alinhando camadas.");
    const from = diopter;
    const start = performance.now();
    function tick(now) {
      const t = reduced ? 1 : Math.min(1, (now - start) / 850);
      setDiopter(from + (TARGET - from) * (1 - (1 - t) ** 3));
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else {
        setDiopter(TARGET);
        setBusy(false);
        setAnnouncement(
          "Auto-foco concluído. Nitidez simulada de 100 por cento.",
        );
      }
    }
    frame.current = requestAnimationFrame(tick);
  }
  return (
    <section id="simulador" className="sim-section section-pad">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Experimente</div>
            <h2>Veja o foco mudar.</h2>
          </div>
          <p>Arraste o controle ou ative o auto-foco.</p>
        </div>
        <div className="simulator">
          <div className="vision-window">
            <div
              className="vision-scene"
              id="vision-scene"
              style={{
                filter: `blur(${Math.min(8, Math.abs(diopter - TARGET) * 1.35)}px)`,
              }}
            >
              <div className="scene-window">
                <span />
                <span />
                <span />
              </div>
              <div className="scene-plant">
                <i />
                <i />
                <i />
              </div>
              <div className="reading-sheet">
                <span className="sheet-overline">UM NOVO OLHAR</span>
                <h3>
                  Enxergar abre
                  <br />
                  possibilidades.
                </h3>
                <p>
                  Para ler uma história.
                  <br />
                  Para aprender algo novo.
                  <br />
                  Para ver o que vem pela frente.
                </p>
                <div className="sheet-lines" />
                <span className="sheet-page">RAYG AI / 01</span>
              </div>
              <div className="scene-pencil" />
            </div>
            <div className="view-label">
              VISÃO SIMULADA{" "}
              <span id="focus-status">
                {busy
                  ? "Alinhando camadas…"
                  : clarity === 100
                    ? "Foco alinhado"
                    : "Ajuste manual"}
              </span>
            </div>
            <div className="focus-reticle" aria-hidden="true" />
            <div className="clarity-pill">
              <span className="status-dot" />
              <output id="clarity">{clarity}%</output> de nitidez
            </div>
          </div>
          <div className="sim-controls">
            <h3>Ajuste o foco.</h3>
            <div className="diopter-label">
              <label htmlFor="diopter">Ajuste de dioptria</label>
              <output id="diopter-value" htmlFor="diopter">
                {diopter > 0 ? "+" : ""}
                {diopter.toFixed(1).replace(".", ",")} D
              </output>
            </div>
            <input
              id="diopter"
              type="range"
              min="-6"
              max="3"
              step="0.1"
              value={diopter}
              onChange={(e) => {
                stop();
                setDiopter(Number(e.target.value));
              }}
              aria-describedby="sim-note"
              aria-valuetext={`${diopter.toFixed(1)} dioptrias`}
            />
            <div className="range-labels">
              <span>−6,0 D</span>
              <span>+3,0 D</span>
            </div>
            <div
              className={`lens-stack ${clarity === 100 ? "aligned" : ""}`}
              aria-hidden="true"
            >
              <i />
              <i />
              <i />
              <span>Alinhamento das 3 camadas</span>
            </div>
            <button
              id="autofocus"
              className="button full-width"
              disabled={busy}
              aria-disabled={busy}
              onClick={autofocus}
            >
              {busy
                ? "Alinhando as lentes…"
                : clarity === 100
                  ? "✓ Foco alinhado"
                  : "⌖ Ativar auto-foco"}
            </button>
            <button id="reset-focus" className="reset-button" onClick={reset}>
              Reiniciar <span aria-hidden="true">↺</span>
            </button>
            <p className="fine-print" id="sim-note">
              Simulação ilustrativa. Não mede seu grau nem substitui um exame.
            </p>
            <span className="sr-only" role="status">
              {announcement}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
