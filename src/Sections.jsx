import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ProductStudio,
  EconomyCalculator,
  Reveal,
  ScrollSection,
} from "./Widgets.jsx";
import { BrandLogo } from "./Brand.jsx";
import "./product-first.css";
import "./concise-copy.css";
import PlanMotionCard from "./PlanMotionCard.jsx";
export function Hero() {
  const hero = useRef(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const productY = useTransform(scrollYProgress, [0, 1], [0, -72]);
  const productScale = useTransform(
    scrollYProgress,
    [0, 0.48, 1],
    [1, 1.035, 0.95],
  );
  const copyY = useTransform(scrollYProgress, [0, 0.72], [0, -28]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.72], [1, 0.2]);
  const purchaseY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  return (
    <section
      className="hero product-first container"
      id="inicio"
      ref={hero}
    >
      <motion.div
        className="hero-copy"
        style={reduced ? undefined : { y: copyY, opacity: copyOpacity }}
      >
        <h1>A inteligência por trás da sua visão.</h1>
      </motion.div>
      <motion.div
        className="hero-product-motion"
        style={reduced ? undefined : { y: productY, scale: productScale }}
      >
        <ProductStudio immersive />
      </motion.div>
      <motion.div
        className="hero-purchase"
        style={reduced ? undefined : { y: purchaseY }}
      >
        <div className="hero-actions">
          <span className="starting-price">
            A partir de <strong>R$ 250</strong>
          </span>
          <a className="button" href="#modelos">
            Ver modelos <span aria-hidden="true">↗</span>
          </a>
        </div>
        <a className="text-link demo-link" href="#simulador">
          <span className="play-icon" aria-hidden="true">
            ▷
          </span>{" "}
          Testar o simulador
        </a>
        <div className="hero-note">
          <span className="tiny-cross" aria-hidden="true">
            +
          </span>{" "}
          Projeto acadêmico em desenvolvimento.
        </div>
      </motion.div>
    </section>
  );
}

export function Technology() {
  const steps = [
    ["Mapear", "Identificar a necessidade visual."],
    ["Alinhar", "Reposicionar as três camadas."],
    ["Ajustar", "Buscar foco para perto e longe."],
  ];
  return (
    <ScrollSection id="tecnologia" className="container technology section-pad">
      <div className="tech-intro">
        <div className="eyebrow">Tecnologia</div>
        <h2>
          Três camadas.
          <br />
          Um foco.
        </h2>
        <div
          className="tech-diagram"
          role="img"
          aria-label="Diagrama de três camadas ópticas"
        >
          <span className="lens-layer layer-1" />
          <span className="lens-layer layer-2" />
          <span className="lens-layer layer-3" />
          <span className="optical-axis" />
        </div>
        <span className="fine-print">Representação conceitual.</span>
      </div>
      <div className="steps">
        {steps.map(([title, description], i) => (
          <Reveal className="step" key={title}>
            <span className="step-number">0{i + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </ScrollSection>
  );
}

const modelCopy = [
  {
    id: "essencial",
    className: "social",
    label: "Acesso social",
    name: "Essencial",
    description: "Tarifa Cidadã.",
    price: 250,
    monthly: 25,
    features: ["Lentes adaptativas", "Acesso pela Tarifa Cidadã"],
    summary: "Quem pode solicitar?",
    details:
      "Proposta para estudantes da rede pública, pessoas inscritas no CadÚnico e famílias de baixa renda. Os critérios de elegibilidade ainda serão definidos.",
  },
  {
    id: "pro",
    className: "featured",
    label: "Dia a dia",
    name: "Pro",
    description: "Trabalho e estudo.",
    price: 400,
    monthly: 40,
    features: ["Filtro de luz azul", "UV400 e antirreflexo", "Estojo rígido"],
  },
  {
    id: "ultra",
    className: "ultra",
    label: "Premium",
    name: "Ultra AI",
    description: "Tecnologia e acesso.",
    price: 750,
    monthly: 75,
    features: [
      "Calibração por sensores",
      "Lentes fotossensíveis",
      "Subsídio à linha Essencial",
    ],
    summary: "Como funciona o subsídio?",
    details:
      "No programa proposto “Compre 1, Subsidie 1”, parte do valor ajuda a custear o desconto de um Essencial. Não equivale à doação integral de outro óculos. A proposta inclui armação ultraleve e LEDs de calibração.",
  },
];
export function Models({ onSelect }) {
  return (
    <ScrollSection id="modelos" className="models-section section-pad">
      <div className="container">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Modelos</div>
            <h2>Escolha seu RAYG.</h2>
          </div>
        </div>
        <div className="pricing-grid">
          {modelCopy.map((model, index) => (
            <PlanMotionCard
              className={`price-card ${model.className}`}
              id={`plano-${model.id}`}
              key={model.id}
              scrollIndex={index}
            >
              <div className="card-label">{model.label}</div>
              <h3>RAYG {model.name}</h3>
              <p>{model.description}</p>
              <img
                src="assets/glasses.svg"
                alt={`Design conceitual do RAYG ${model.name}`}
                width="800"
                height="500"
                loading="eager"
              />
              <div className="price">
                <small>R$</small> {model.price}
                <span>,00</span>
              </div>
              <div className="installments">
                ou 10x de R$ {model.monthly},00 sem juros*
              </div>
              <button
                className={`button ${model.id === "pro" ? "" : "button-outline"}`}
                data-model={model.id}
                onClick={onSelect}
              >
                Escolher {model.name}
                <span aria-hidden="true">↗</span>
              </button>
              <ul>
                {model.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              {model.details && (
                <details className="copy-details card-details">
                  <summary>{model.summary}</summary>
                  <p>{model.details}</p>
                </details>
              )}
            </PlanMotionCard>
          ))}
        </div>
        <p className="pricing-note">
          * Modelos, recursos e valores propostos para o hackathon. Compra
          simulada, sem cobrança.
        </p>
        <div className="impact-strip">
          <span className="impact-symbol" aria-hidden="true">
            ↗
          </span>
          <div>
            <h3>O Ultra AI apoia o Essencial.</h3>
          </div>
          <a href="#projeto" className="text-link">
            O projeto <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </ScrollSection>
  );
}

export function Project() {
  return (
    <ScrollSection id="projeto" className="container project section-pad">
      <div className="project-copy">
        <div className="eyebrow">Pesquisa</div>
        <h2>Acesso à visão.</h2>
        <p>Pesquisa acadêmica para unir adaptação óptica e inclusão.</p>
        <details className="copy-details">
          <summary>Sobre a pesquisa</summary>
          <p>
            O RAYG AI é um projeto liderado pela professora idealizadora do
            óculos e apresentado em hackathon. A tecnologia e o modelo de acesso
            ainda serão desenvolvidos e validados.
          </p>
        </details>
        <span className="research-tag">
          <span className="status-dot" /> Em desenvolvimento
        </span>
      </div>
      <EconomyCalculator />
    </ScrollSection>
  );
}

export function Principles() {
  return (
    <div className="principles container">
      <div>
        <span>
          01 <b>Adaptação óptica</b>
        </span>
        <span>
          02 <b>Acesso social</b>
        </span>
        <span>
          03 <b>Pesquisa brasileira</b>
        </span>
      </div>
    </div>
  );
}

export function FAQ() {
  const questions = [
    [
      "O RAYG já está à venda?",
      "Ainda não. É um projeto acadêmico. Modelos e valores são propostos; a compra é uma simulação.",
    ],
    [
      "O simulador mede meu grau?",
      "Não. É uma demonstração visual. Não fornece receita e não substitui um exame oftalmológico.",
    ],
    [
      "Quem pode acessar a Tarifa Cidadã?",
      "A proposta contempla estudantes da rede pública, pessoas inscritas no CadÚnico e famílias de baixa renda. Critérios ainda serão definidos.",
    ],
    [
      "Como funciona o subsídio?",
      "Parte do valor do Ultra AI ajudaria a custear o desconto de um Essencial. Não é a doação integral de outro óculos.",
    ],
    [
      "Preciso de acompanhamento médico?",
      "Sim. O projeto não dispensa consultas. Os recursos apresentados ainda precisam de desenvolvimento e validação.",
    ],
  ];
  return (
    <section className="faq-section section-pad">
      <div className="container faq-layout">
        <div>
          <h2>Dúvidas?</h2>
        </div>
        <div className="faq-list">
          {questions.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span>+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="final-cta container">
      <h2>Teste o RAYG.</h2>
      <a className="button" href="#simulador">
        Abrir simulador <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="container footer">
      <div>
        <a className="logo" href="#inicio" aria-label="RAYG AI, início">
          <BrandLogo />
        </a>
        <p>A inteligência por trás da sua visão.</p>
      </div>
      <div>
        <p>Projeto acadêmico · Hackathon</p>
        <a href="#projeto">Sobre o projeto ↗</a>
      </div>
    </footer>
  );
}
