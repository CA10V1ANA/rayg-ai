import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
export const money = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export function Reveal({ children, className }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      className={className}
      initial={reduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.article>
  );
}
export function ScrollSection({ children, className, id }) {
  const target = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start 94%", "start 58%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.18, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [38, 0]);
  return (
    <motion.section
      ref={target}
      id={id}
      className={className}
      style={reduced ? undefined : { opacity, y }}
    >
      {children}
    </motion.section>
  );
}
export function ProductStudio({ immersive = false }) {
  const host = useRef(null);
  const controller = useRef(null);
  const [rotating, setRotating] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    let canceled = false;
    let scene;
    import("./eyewear.js")
      .then(({ createEyewearStudio }) => {
        if (canceled) return;
        try {
          scene = createEyewearStudio(
            host.current,
            () => setUnavailable(true),
            { immersive },
          );
          controller.current = scene;
          setLoaded(true);
        } catch {
          setUnavailable(true);
        }
      })
      .catch(() => setUnavailable(true));
    return () => {
      canceled = true;
      scene?.dispose();
    };
  }, [immersive]);
  function toggleRotation() {
    const next = !rotating;
    setRotating(next);
    controller.current?.setRotating(next);
  }
  return (
    <div className="product-studio" id="product-studio">
      <div className="studio-top">
        <span>RAYG / ADAPTIVE EYEWEAR</span>
        <span className="concept-label">CONCEITO 3D</span>
      </div>
      <div className="studio-orbit orbit-one" />
      <div className="studio-orbit orbit-two" />
      <div
        id="product-canvas"
        ref={host}
        role="img"
        aria-label="Modelo 3D conceitual de óculos pretos com lentes em azul esverdeado e LEDs nas hastes"
      >
        {(!loaded || unavailable) && (
          <img
            className="product-fallback"
            src="/assets/glasses.svg"
            alt="Representação conceitual do RAYG AI"
            width="800"
            height="500"
          />
        )}
      </div>
      <div className="product-callout">
        <span className="callout-line" />
        <span>
          <small>UM NOVO PONTO DE VISTA</small>3 camadas. Um só foco.
        </span>
      </div>
      <div className="studio-bottom">
        <span>
          <i className="status-dot" /> Lentes adaptativas
        </span>
        {!unavailable ? (
          <button
            id="rotate-product"
            onClick={toggleRotation}
            aria-pressed={rotating}
          >
            {rotating ? "Pausar rotação" : "Girar modelo"}{" "}
            <span aria-hidden="true">↻</span>
          </button>
        ) : (
          <span>Visualização ilustrativa</span>
        )}
      </div>
    </div>
  );
}
export function EconomyCalculator() {
  const [cost, setCost] = useState("250");
  const [count, setCount] = useState("5");
  const valid =
    cost !== "" &&
    count !== "" &&
    Number(cost) >= 1 &&
    Number(cost) <= 10000 &&
    Number.isInteger(Number(cost)) &&
    Number(count) >= 1 &&
    Number(count) <= 20 &&
    Number.isInteger(Number(count));
  const total = valid ? Number(cost) * Number(count) : null;
  return (
    <div className="calculator">
      <h3>Compare em 5 anos.</h3>
      <div className="calculator-inputs">
        <label>
          Custo por óculos (R$)
          <input
            type="number"
            id="cost"
            min="1"
            max="10000"
            step="1"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            aria-invalid={!valid}
          />
        </label>
        <label>
          Compras em 5 anos
          <input
            type="number"
            id="replacements"
            min="1"
            max="20"
            step="1"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            aria-invalid={!valid}
          />
        </label>
      </div>
      <div className="comparison-row">
        <span>Óculos convencionais</span>
        <strong id="traditional-cost">{valid ? money(total) : "—"}</strong>
      </div>
      <div className="comparison-track">
        <div
          style={{
            transform: `scaleX(${valid ? total / Math.max(total, 250) : 0})`,
          }}
        />
      </div>
      <div className="comparison-row">
        <span>RAYG Essencial</span>
        <strong>R$ 250</strong>
      </div>
      <div className="comparison-track rayg-track">
        <div
          style={{
            transform: `scaleX(${valid ? 250 / Math.max(total, 250) : 0})`,
          }}
        />
      </div>
      <div className="savings-result">
        <span>Economia estimada</span>
        <strong id="savings" aria-live="polite">
          {valid ? money(Math.max(0, total - 250)) : "—"}
        </strong>
      </div>
      <p className="fine-print">
        Estimativa ilustrativa, sem manutenção ou reposição.
      </p>
      <details className="copy-details">
        <summary>Como calculamos</summary>
        <p>
          Comparamos o custo informado com um Essencial a R$ 250. Durabilidade e
          necessidade de troca ainda dependem de validação.
        </p>
      </details>
      <span className="fine-print" id="calc-error" role="status">
        {!valid
          ? "Use um custo inteiro de R$ 1 a R$ 10.000 e de 1 a 20 compras inteiras."
          : ""}
      </span>
    </div>
  );
}
