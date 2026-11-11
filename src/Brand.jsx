import { useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import "./brand.css";

/** Typographic adaptation of the supplied raster reference. */
export function BrandLogo({ animated = false }) {
  const reduced = useReducedMotion();
  return (
    <span className="brand-logo" aria-hidden="true">
      <motion.span
        className="brand-word"
        initial={animated && !reduced ? { opacity: 0, x: -8 } : false}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        RAYG
      </motion.span>{" "}
      <motion.span
        className="brand-ai"
        initial={animated && !reduced ? { opacity: 0, scale: 0.8 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        AI
      </motion.span>
    </span>
  );
}

const films = [
  {
    id: "signature",
    label: "A assinatura",
    title: "RAYG AI.",
  },
  {
    id: "focus",
    label: "O foco",
    title: "Três camadas. Um foco.",
  },
  {
    id: "access",
    label: "A conexão",
    title: "Tecnologia com acesso.",
  },
];

const FILM_DURATION = 5200;

function GlassesDrawing({ reduced, mode }) {
  const draw = (delay) => ({
    initial: reduced ? false : { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { duration: 0.85, delay: reduced ? 0 : delay, ease: "easeOut" },
  });
  return (
    <>
      <motion.g
        initial={reduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65 }}
      >
        <motion.path
          d="M192 104Q245 88 299 105L293 144Q289 168 257 168L231 166Q204 163 200 140ZM341 105Q396 88 449 104L441 140Q436 164 410 166L383 168Q350 168 347 143Z"
          fill="var(--film-glass)"
          stroke="var(--text-primary)"
          strokeWidth="6"
          strokeLinejoin="round"
          {...draw(0.05)}
        />
        <motion.path
          d="M298 111Q320 101 342 111M189 105 201 106M441 106 452 105"
          fill="none"
          stroke="var(--text-primary)"
          strokeWidth="6"
          strokeLinecap="round"
          {...draw(0.35)}
        />
        {[0, 1, 2].map((i) => (
          <motion.ellipse
            key={i}
            cx={391}
            cy={130}
            rx={5}
            ry={17}
            fill="var(--accent-soft)"
            stroke="var(--accent-primary)"
            strokeWidth="1"
            initial={
              reduced ? false : { x: (i - 1) * 30, opacity: 0, scaleY: 0.6 }
            }
            animate={{ x: (i - 1) * 12, opacity: 0.8, scaleY: 1 }}
            transition={{
              duration: mode === "focus" ? 1.6 : 0.9,
              delay: reduced ? 0 : 0.65 + i * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}
        <motion.path
          d="M366 112v-6h7M410 106h7v7M417 147v7h-7M373 154h-7v-7"
          fill="none"
          stroke="var(--accent-primary)"
          strokeWidth="2"
          {...draw(1.15)}
        />
      </motion.g>
    </>
  );
}

function FilmArtwork({ mode, replay }) {
  const reduced = useReducedMotion();
  const titleId = useId();
  return (
    <svg
      key={`${mode}-${replay}`}
      className="film-artwork"
      viewBox="0 0 640 360"
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        Animação RAYG AI: {films.find((f) => f.id === mode).label}
      </title>
      <GlassesDrawing reduced={reduced} mode={mode} />
      <motion.g
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.7,
          delay: reduced ? 0 : 1.15,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <text
          x="182"
          y="241"
          fill="var(--text-primary)"
          fontFamily="Space Grotesk, sans-serif"
          fontWeight="700"
          fontStyle="italic"
          fontSize="76"
          letterSpacing="-6"
        >
          RAYG
        </text>
        <g transform="translate(391 191) skewX(-12)">
          <rect width="68" height="48" rx="6" fill="var(--accent-primary)" />
          <text
            x="15"
            y="35"
            fill="var(--film-badge-text)"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            fontStyle="italic"
            fontSize="33"
          >
            AI
          </text>
        </g>
      </motion.g>
      {mode !== "access" ? (
        <motion.g
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: reduced ? 0 : 2 }}
        >
          <path
            d="M138 273h28M474 273h28"
            stroke="var(--accent-primary)"
            strokeWidth="2"
          />
          <text
            x="320"
            y="278"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="14"
            fill="var(--text-secondary)"
          >
            A inteligência por trás da sua visão.
          </text>
        </motion.g>
      ) : (
        <>
          <motion.path
            d="M320 253v21M180 291v-17h280v17"
            fill="none"
            stroke="var(--accent-primary)"
            strokeWidth="1.5"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: reduced ? 0 : 1.8 }}
          />
          {[
            { x: 180, label: "ESSENCIAL" },
            { x: 320, label: "PRO" },
            { x: 460, label: "ULTRA AI" },
          ].map((node, i) => (
            <motion.g
              key={node.label}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: reduced ? 0 : 2.25 + i * 0.15,
              }}
            >
              <circle cx={node.x} cy="295" r="4" fill="var(--accent-primary)" />
              <text
                x={node.x}
                y="323"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="10"
                letterSpacing="1"
                fill="var(--text-secondary)"
              >
                {node.label}
              </text>
            </motion.g>
          ))}
        </>
      )}
    </svg>
  );
}

/** Arrow keys follow the WAI-ARIA tabs pattern, with automatic activation. */
export function activateTab(event, index, count, setIndex) {
  let next;
  if (event.key === "ArrowRight") next = (index + 1) % count;
  else if (event.key === "ArrowLeft") next = (index + count - 1) % count;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = count - 1;
  else return;
  event.preventDefault();
  setIndex(next);
  event.currentTarget.parentElement
    .querySelectorAll('[role="tab"]')
    [next].focus();
}

export function BrandFilm() {
  const playerRef = useRef(null);
  const inView = useInView(playerRef, { amount: 0.35 });
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [replay, setReplay] = useState(0);
  const film = films[index];
  useEffect(() => {
    if (!inView || reduced) return undefined;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current + 1) % films.length);
      setReplay((current) => current + 1);
    }, FILM_DURATION);
    return () => window.clearTimeout(timer);
  }, [inView, reduced, index, replay]);
  function chooseFilm(next) {
    setIndex(next);
    setReplay((current) => current + 1);
  }
  return (
    <section
      id="marca"
      className="brand-section container"
      aria-labelledby="brand-title"
    >
      <div className="brand-intro">
        <h2 id="brand-title">Marca em movimento.</h2>
      </div>
      <div className="brand-player" ref={playerRef}>
        <div className="film-topline">
          <span>A INTELIGÊNCIA POR TRÁS DA SUA VISÃO</span>
          <span className="film-count">0{index + 1} / 03</span>
        </div>
        <div
          role="tablist"
          aria-label="Animações da marca"
          className="film-tabs"
        >
          {films.map((item, i) => (
            <button
              key={item.id}
              id={`film-tab-${item.id}`}
              role="tab"
              aria-selected={i === index}
              aria-controls="film-panel"
              tabIndex={i === index ? 0 : -1}
              onClick={() => chooseFilm(i)}
              onKeyDown={(e) =>
                activateTab(e, i, films.length, chooseFilm)
              }
            >
              {item.label}
              {i === index && inView && !reduced && (
                <motion.span
                  key={`${index}-${replay}`}
                  className="film-tab-progress"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: FILM_DURATION / 1000, ease: "linear" }}
                  aria-hidden="true"
                />
              )}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id="film-panel"
          aria-labelledby={`film-tab-${film.id}`}
          tabIndex="0"
        >
          {inView ? (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                className="film-stage"
                key={`${film.id}-${replay}`}
                initial={reduced ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -18 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              >
                <FilmArtwork mode={film.id} replay={replay} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="film-stage-placeholder" aria-hidden="true" />
          )}
          <div className="film-caption">
            <div>
              <h3>{film.title}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
