import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { activateTab } from "./Brand.jsx";
import "./packaging.css";
import CaseViewer from "./CaseViewer.jsx";

const kits = [
  {
    id: "essencial",
    name: "Essencial",
    price: 250,
    finish: "Estojo com zíper.",
    case: "Estojo compacto com zíper",
    description: "Caixa branca, estojo de tecido com zíper e flanela.",
    material: "Tecido com zíper",
    box: "Caixa branca",
  },
  {
    id: "pro",
    name: "Pro",
    price: 400,
    finish: "Estojo estruturado.",
    case: "Estojo estruturado com aba",
    description:
      "Caixa rígida preta, flanela e estojo de aba com costura em azul esverdeado.",
    material: "Acabamento com costura",
    box: "Caixa rígida preta",
  },
  {
    id: "ultra",
    name: "Ultra AI",
    price: 750,
    finish: "Caixa com gaveta.",
    case: "Estojo com fechamento de envelope",
    description:
      "Acabamento metálico, interior acolchoado e gaveta para o estojo e a flanela.",
    material: "Acabamento de envelope",
    box: "Caixa com gaveta",
  },
];

export default function PackagingShowcase() {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const kit = kits[index];
  return (
    <section
      id="estojos"
      className="packaging-section case-section section-pad"
      aria-labelledby="packaging-title"
    >
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Os três kits</div>
            <h2 id="packaging-title">Abra a caixa.</h2>
          </div>
        </div>
        <div className="kit-tabs" role="tablist" aria-label="Estojos por plano">
          {kits.map((item, i) => (
            <button
              key={item.id}
              id={`kit-tab-${item.id}`}
              role="tab"
              tabIndex={index === i ? 0 : -1}
              aria-selected={index === i}
              aria-controls="kit-panel"
              onClick={() => setIndex(i)}
              onKeyDown={(e) => activateTab(e, i, kits.length, setIndex)}
            >
              <span className="kit-tab-number">0{i + 1}</span>
              <span>
                <strong>RAYG {item.name}</strong>
                <small>{item.case}</small>
              </span>
              <span className="kit-tab-arrow" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </div>
        <div
          className="kit-display"
          role="tabpanel"
          tabIndex="0"
          id="kit-panel"
          aria-labelledby={`kit-tab-${kit.id}`}
        >
          <CaseViewer variant={kit.id} name={kit.name} />
          <div className="kit-panel">
            <div>
              <div className="eyebrow">Kit conceitual</div>
              <h3>{kit.finish}</h3>
            </div>
            <div className="kit-specs">
              <div className="kit-plan-price">
                <span>Plano {kit.name}</span>
                <strong>R$ {kit.price}</strong>
              </div>
              <div>
                <span>Estojo</span>
                <strong>{kit.material}</strong>
              </div>
              <div>
                <span>Apresentação</span>
                <strong>{kit.box}</strong>
              </div>
              <a className="text-link" href={`#plano-${kit.id}`}>
                Ver plano <span aria-hidden="true">↗</span>
              </a>
            </div>
            <details className="copy-details kit-more">
              <summary>Detalhes do kit</summary>
              <p>{kit.description}</p>
            </details>
          </div>
        </div>
        <details className="kit-reference">
          <summary>Ver propostas de embalagem</summary>
          <figure className="packaging-figure">
            <div
              className="packaging-image-wrap"
              style={{ "--kit-index": index }}
            >
              <img
                src="/assets/rayg-kits-concept.png"
                alt="Três kits conceituais RAYG AI: Essencial em caixa branca com estojo de zíper, Pro em caixa preta com estojo de aba, e Ultra AI em caixa metálica com gaveta e estojo de envelope."
                width="1536"
                height="1024"
                loading="lazy"
              />
              <motion.div
                className="kit-highlight"
                aria-hidden="true"
                initial={false}
                animate={{ x: `${index * 100}%` }}
                transition={{
                  duration: reduced ? 0 : 0.45,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <span />
              </motion.div>
            </div>
            <figcaption>
              Visualização conceitual criada a partir da referência da marca.
              Materiais e acessórios são propostas para o projeto.
            </figcaption>
          </figure>
        </details>
      </div>
    </section>
  );
}
