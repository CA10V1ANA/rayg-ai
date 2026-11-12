import { useEffect, useRef, useState } from "react";
import AquilaModelFlow from "./AquilaModelFlow.jsx";
import useScrollReveal from "./useScrollReveal.js";
import HeroEyewear from "./HeroEyewear.jsx";

const models = [
  {
    name: "Essencial",
    tier: "A",
    price: 250,
    line: "Uma expressão de simplicidade.",
    description: "Uma direção que valoriza simplicidade e proximidade.",
  },
  {
    name: "Signature",
    tier: "B",
    price: 400,
    line: "Presença em cada detalhe.",
    description: "Uma direção que destaca elegância e presença cotidiana.",
  },
  {
    name: "Prestige",
    tier: "C",
    price: 750,
    line: "Um olhar de personalidade.",
    description:
      "Uma direção de apresentação com personalidade e atenção aos detalhes.",
  },
];
const questions = [
  [
    "Como funciona o ajuste automático?",
    "A explicação do mecanismo e as condições de funcionamento aguardam informações da criadora. A demonstração de nitidez nesta página é apenas ilustrativa.",
  ],
  [
    "Qual é a diferença entre os modelos?",
    "Essencial, Signature e Prestige são nomes de apresentação provisórios. Os dados e as diferenças oficiais serão incluídos após confirmação.",
  ],
  [
    "Os óculos da imagem são o produto real?",
    "Não. A imagem foi criada para explorar a direção visual da marca. Ela será substituída por fotografias aprovadas do produto.",
  ],
  [
    "Já posso fazer um pedido?",
    "Esta é uma proposta visual para avaliação. O canal de atendimento e as condições de compra serão incluídos quando estiverem definidos.",
  ],
];

function Arrow({ down = false }) {
  return (
    <span className="arrow" aria-hidden="true">
      {down ? "↓" : "↗"}
    </span>
  );
}
function Brand({ symbolOnly = false }) {
  return (
    <>
      <img
        className="brandmark"
        src="/assets/aquila/brandmark.svg"
        alt={symbolOnly ? "Símbolo da proposta AQUILA" : ""}
        width="60"
        height="60"
      />
      {!symbolOnly && (
        <span className="brand-type">
          <span className="wordmark">AQUILA</span>
          <span className="byline">por Rayane Serrão</span>
        </span>
      )}
    </>
  );
}

function HeaderBrand() {
  const brand = useRef(null);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = null;
    let progress = 0;
    let lastTime = null;
    const target = () => {
      const hero = document.getElementById("inicio");
      const distance = Math.max(420, (hero?.offsetHeight || innerHeight) * 0.7);
      return preference.matches
        ? 0
        : Math.min(1, Math.max(0, (scrollY - 48) / distance));
    };
    const update = (time) => {
      const desired = target();
      const elapsed = lastTime === null ? 16 : Math.min(time - lastTime, 64);
      lastTime = time;
      progress += (desired - progress) * (1 - Math.exp(-elapsed / 110));
      if (preference.matches || Math.abs(desired - progress) < 0.001)
        progress = desired;
      brand.current?.style.setProperty("--brand-progress", String(progress));
      frame = progress === desired ? null : requestAnimationFrame(update);
      if (frame === null) lastTime = null;
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    progress = target();
    brand.current?.style.setProperty("--brand-progress", String(progress));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    preference.addEventListener("change", schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      preference.removeEventListener("change", schedule);
    };
  }, []);

  return (
    <a
      ref={brand}
      className="brand scroll-brand"
      href="#inicio"
      aria-label="AQUILA início"
    >
      <svg className="brandmark" viewBox="0 0 60 60" aria-hidden="true">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        >
          <path d="M4 52Q24 40 29 5Q34 36 56 52M14 44Q30 22 46 44M22 49Q30 36 38 49M29 5L33 12" />
        </g>
        <circle cx="29" cy="21" r="1.7" fill="currentColor" />
      </svg>
      <span className="brand-type" aria-hidden="true">
        <span className="wordmark">
          <svg className="brand-tail" viewBox="0 0 146 42" aria-hidden="true">
            <g className="brand-letter brand-letter-q">
              <path d="M31 8C25 1 7 2 4 16C0 33 16 40 27 33C37 26 38 14 31 8Z" />
              <path className="brand-q-tail" d="M21 26Q29 39 42 38" />
            </g>
            <path
              className="brand-letter brand-letter-u"
              d="M52 5V25Q52 36 64 36Q76 36 76 25V5"
            />
            <path className="brand-letter brand-letter-i" d="M94 5V36" />
            <path className="brand-letter brand-letter-l" d="M113 5V36H141" />
          </svg>
          <span className="brand-terminal">
            <svg
              className="brand-last-a"
              viewBox="0 0 34 42"
              aria-hidden="true"
            >
              <path d="M2 36L17 5L32 36M8 25H26" />
            </svg>
            <svg
              className="brand-diagonal"
              viewBox="0 0 24 30"
              aria-hidden="true"
            >
              <path d="M6 4L19 26" />
            </svg>
          </span>
        </span>
        <span className="byline">por Rayane Serrão</span>
      </span>
    </a>
  );
}
function Question({ question, answer, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="t-acc" data-open={open}>
      <h3>
        <button
          className="t-acc-head"
          id={`question-${index}`}
          aria-expanded={open}
          aria-controls={`answer-${index}`}
          onClick={() => setOpen(!open)}
        >
          {question}
          <svg className="t-acc-chevron" aria-hidden="true" viewBox="0 0 16 16">
            <path d="M4 6.5L8 10.5L12 6.5" />
          </svg>
        </button>
      </h3>
      <div
        className="t-acc-panel"
        id={`answer-${index}`}
        role="region"
        aria-labelledby={`question-${index}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className="t-acc-panel-inner">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function Aquila() {
  useScrollReveal();
  const [menu, setMenu] = useState(false);
  const [focus, setFocus] = useState(25);
  const [selected, setSelected] = useState(models[0]);
  const [modalState, setModalState] = useState("");
  const [productPaused, setProductPaused] = useState(false);
  const [activeModel, setActiveModel] = useState(0);
  const [collectionHovered, setCollectionHovered] = useState(false);
  const [collectionFocused, setCollectionFocused] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const dialog = useRef(null);
  const menuButton = useRef(null);
  const trigger = useRef(null);
  const animation = useRef(null);
  const closeTimer = useRef(null);
  const header = useRef(null);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (reduceMotion || flowOpen || collectionHovered || collectionFocused)
      return;
    const timer = setInterval(() => {
      if (!document.hidden)
        setActiveModel((previous) => (previous + 1) % models.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reduceMotion, flowOpen, collectionHovered, collectionFocused]);

  useEffect(() => {
    const sections = [...document.querySelectorAll("main > section, .closing")];
    let frame = null;
    const update = () => {
      frame = null;
      if (!header.current) return;
      const bounds = header.current.getBoundingClientRect();
      const sampleY = bounds.top + bounds.height / 2;
      const section = sections.find((el) => {
        const rect = el.getBoundingClientRect();
        return rect.top <= sampleY && rect.bottom > sampleY;
      });
      header.current.dataset.tone = section?.matches(".paper, .closing")
        ? "light"
        : "dark";
      header.current.querySelectorAll(".navigation a").forEach((link) => {
        if (section?.id && link.hash === `#${section.id}`) {
          link.setAttribute("aria-current", "location");
        } else link.removeAttribute("aria-current");
      });
    };
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  useEffect(() => {
    const escape = (event) => {
      if (event.key === "Escape") {
        setMenu(false);
        if (document.activeElement?.closest("#navigation"))
          menuButton.current?.focus();
      }
    };
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const stopMotion = () => cancelAnimationFrame(animation.current);
    preference.addEventListener("change", stopMotion);
    window.addEventListener("keydown", escape);
    return () => {
      stopMotion();
      clearTimeout(closeTimer.current);
      preference.removeEventListener("change", stopMotion);
      window.removeEventListener("keydown", escape);
    };
  }, []);

  const transformFocus = () => {
    cancelAnimationFrame(animation.current);
    if (focus === 100) {
      setFocus(25);
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFocus(100);
      return;
    }
    const start = performance.now();
    const duration = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--focus-duration",
      ),
    );
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setFocus(
        Math.round(focus + (100 - focus) * (1 - Math.pow(1 - progress, 3))),
      );
      if (progress < 1) animation.current = requestAnimationFrame(tick);
    };
    animation.current = requestAnimationFrame(tick);
  };
  const openModel = (model, event) => {
    clearTimeout(closeTimer.current);
    trigger.current = event.currentTarget;
    setSelected(model);
    setActiveModel(models.indexOf(model));
    setFlowOpen(true);
    setModalState("");
    dialog.current.showModal();
    // Commit the resting scale/backdrop before the entrance starts.
    void dialog.current.offsetWidth;
    requestAnimationFrame(() => setModalState("is-open"));
  };
  const closeModel = () => {
    if (modalState === "is-closing") return;
    setModalState("is-closing");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--modal-close-dur",
      ),
    );
    closeTimer.current = setTimeout(
      () => {
        dialog.current.close();
        setModalState("");
        setFlowOpen(false);
        trigger.current?.focus();
      },
      reduced ? 0 : duration,
    );
  };

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header ref={header} className="site-header" data-tone="dark">
        <div className="wrap nav">
          <HeaderBrand />
          <nav
            id="navigation"
            className={menu ? "navigation is-open" : "navigation"}
            aria-label="Principal"
          >
            <a href="#experiencia" onClick={() => setMenu(false)}>
              A experiência
            </a>
            <a href="#modelos" onClick={() => setMenu(false)}>
              Os modelos
            </a>
            <a href="#origem" onClick={() => setMenu(false)}>
              A origem
            </a>
          </nav>
          <a className="button nav-action" href="#experiencia">
            Explore a experiência <Arrow />
          </a>
          <button
            ref={menuButton}
            className="button menu-toggle"
            aria-expanded={menu}
            aria-controls="navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? "Fechar −" : "Menu +"}
          </button>
        </div>
      </header>
      <main id="conteudo" tabIndex="-1">
        <section className="hero" id="inicio">
          <div className="wrap hero-inner">
            <div className="hero-top">
              <div>
                <p className="eyebrow">Óculos AQUILA · Uma nova perspectiva</p>
                <h1 data-enter>
                  <span className="enter-line">Um novo olhar.</span>
                  <span className="enter-line rose">Inteiramente seu.</span>
                </h1>
              </div>
              <div className="hero-aside">
                <p>
                  Conheça AQUILA. Uma proposta de óculos com ajuste automático
                  de grau, apresentada a partir de uma nova perspectiva.
                </p>
                <a className="button primary" href="#experiencia">
                  Explore a experiência <Arrow down />
                </a>
              </div>
            </div>
            <div className="hero-art" data-motion-paused={productPaused}>
              <div className="lens-outline lens-left" aria-hidden="true" />
              <div className="lens-outline lens-right" aria-hidden="true" />
              <HeroEyewear
                paused={productPaused}
                reducedMotion={reduceMotion}
              />
              <button
                className="hero-motion-toggle button"
                aria-pressed={productPaused}
                onClick={() => setProductPaused(!productPaused)}
              >
                {productPaused ? "Retomar movimento" : "Pausar movimento"}
                <span aria-hidden="true">{productPaused ? "▶" : "Ⅱ"}</span>
              </button>
            </div>
            <div className="hero-bottom">
              <span>
                Design que começa <span className="rose">pelo olhar.</span>
              </span>
              <span>Imagem conceitual · Apresentação 2026</span>
              <a href="#experiencia">
                Deslize para descobrir <Arrow down />
              </a>
            </div>
          </div>
        </section>

        <section className="section paper" id="experiencia">
          <div className="wrap">
            <div className="section-head">
              <h2>
                O detalhe estava ali.
                <br />
                Agora, em foco.
              </h2>
              <p>
                Uma pequena interação para explorar a ideia por trás do AQUILA.
                Deslize e veja a nitidez aparecer.
              </p>
            </div>
            <div className="focus-layout">
              <div className="focus-controls">
                <h3>Mude sua perspectiva.</h3>
                <p>
                  Você controla a nitidez desta demonstração. Experimente o
                  movimento até o final.
                </p>
                <div className="range-head">
                  <label htmlFor="focusRange">Nitidez da imagem</label>
                  <output htmlFor="focusRange">{focus}%</output>
                </div>
                <input
                  id="focusRange"
                  type="range"
                  min="0"
                  max="100"
                  value={focus}
                  aria-describedby="focus-note"
                  aria-valuetext={`${focus}% de nitidez ilustrativa`}
                  onChange={(event) => {
                    cancelAnimationFrame(animation.current);
                    setFocus(Number(event.target.value));
                  }}
                />
                <div className="range-labels">
                  <span>Menos nitidez</span>
                  <span>Mais nitidez</span>
                </div>
                <button className="button" onClick={transformFocus}>
                  {focus === 100 ? "Recomeçar" : "Ver a transformação"}
                  <Arrow />
                </button>
                <p className="disclaimer" id="focus-note">
                  Esta interação é ilustrativa: não mede grau, não é um teste de
                  visão e não demonstra o desempenho real dos óculos.
                </p>
              </div>
              <div className="focus-scene">
                <div className="focus-rings" aria-hidden="true" />
                <div
                  className="scene-copy"
                  style={{ filter: `blur(${(100 - focus) * 0.085}px)` }}
                  aria-hidden="true"
                >
                  <strong>
                    Existe mais
                    <br />
                    para ver.
                  </strong>
                  <p>Nos encontros. Nos caminhos. Nos detalhes.</p>
                </div>
                <span className="sr-only">
                  Demonstração visual de nitidez. Existe mais para ver: nos
                  encontros, nos caminhos, nos detalhes.
                </span>
                <span className="scene-footer">
                  Experiência visual ilustrativa
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="section collection paper"
          id="modelos"
          onPointerEnter={() => setCollectionHovered(true)}
          onPointerLeave={() => setCollectionHovered(false)}
          onFocusCapture={() => setCollectionFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setCollectionFocused(false);
          }}
        >
          <div className="wrap">
            <div className="section-head">
              <h2>
                Uma identidade.
                <br />
                Diferentes expressões.
              </h2>
              <p>
                Explore três direções de apresentação para a coleção AQUILA. Os
                nomes e visuais desta prévia são conceituais.
              </p>
            </div>
            <div className="collection-layout">
              <div className="collection-art">
                <img
                  src="/assets/aquila/eyewear-cutout.png"
                  alt="Imagem conceitual compartilhada pelas propostas AQUILA"
                  width="1672"
                  height="941"
                  loading="lazy"
                />
                <div className="collection-preview">
                  <p>{models[activeModel].name}</p>
                  <button
                    className="button"
                    onClick={(event) => openModel(models[activeModel], event)}
                  >
                    Conhecer o modelo <Arrow />
                  </button>
                </div>
              </div>
              <div className="models-list">
                {models.map((model, i) => (
                  <article
                    className="model-row"
                    key={model.name}
                    data-active={activeModel === i}
                    onPointerEnter={() => setActiveModel(i)}
                  >
                    <span className="model-index">0{i + 1}</span>
                    <div>
                      <h3>{model.name}</h3>
                      <p>{model.line}</p>
                      <p className="model-price">
                        Classe {model.tier} ·{" "}
                        {model.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                    <button
                      className="round model-button"
                      aria-label={`Explorar conceito ${model.name}`}
                      onClick={(event) => openModel(model, event)}
                    >
                      <Arrow />
                    </button>
                  </article>
                ))}
                <p className="models-note">
                  Imagem ilustrativa compartilhada entre as propostas.
                  Características e diferenças técnicas aguardam confirmação da
                  criadora. Cartão em até 10x sem juros.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section story paper" id="origem">
          <div className="wrap story-grid">
            <div>
              <h2>
                A visão por trás
                <br />
                do AQUILA.
              </h2>
              <p>
                A proposta de Rayane Serrão parte de uma ideia: apresentar
                óculos com ajuste automático de grau e novas possibilidades para
                o cotidiano.
              </p>
              <p>
                Este é o início dessa apresentação. A história da criadora, as
                fotografias reais e os detalhes da tecnologia completarão esse
                olhar.
              </p>
              <p className="signature">Rayane Serrão</p>
            </div>
            <div className="brand-panel">
              <Brand symbolOnly />
              <span>Um novo olhar começa com uma ideia.</span>
            </div>
          </div>
        </section>
        <section className="section faq-section paper" id="duvidas">
          <div className="wrap faq-layout">
            <h2>
              Antes de
              <br />
              seguir o olhar.
            </h2>
            <div>
              {questions.map(([question, answer], index) => (
                <Question
                  key={question}
                  question={question}
                  answer={answer}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="closing">
        <div className="wrap">
          <div className="closing-top">
            <h2>
              Seu próximo olhar
              <br />
              começa aqui.
            </h2>
            <a className="button" href="#modelos">
              Rever os modelos <Arrow />
            </a>
          </div>
          <div className="footer-row">
            <span>Proposta visual · Caio Viana & equipe</span>
            <span>Imagens e demonstração conceituais · Novembro 2026</span>
          </div>
        </div>
      </footer>
      <dialog
        ref={dialog}
        className={`t-modal model-dialog ${modalState}`}
        aria-labelledby="model-title"
        aria-describedby="model-note"
        onCancel={(event) => {
          event.preventDefault();
          closeModel();
        }}
        onClick={(event) => {
          if (event.target === dialog.current) {
            const r = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < r.left ||
              event.clientX > r.right ||
              event.clientY < r.top ||
              event.clientY > r.bottom
            )
              closeModel();
          }
        }}
      >
        <button
          className="dialog-close round"
          aria-label="Fechar"
          onClick={closeModel}
        >
          ×
        </button>
        {flowOpen && (
          <AquilaModelFlow
            model={selected}
            onClose={closeModel}
            reducedMotion={reduceMotion}
          />
        )}
      </dialog>
    </>
  );
}
