import {
  AQUILA_LETTERS,
  AQUILA_SYMBOL_PATH,
  AQUILA_WINGS,
} from "./aquila-brand.js";

export function AquilaSymbol({ trace = false, flying = false }) {
  return (
    <svg className="brandmark" viewBox="0 0 60 60" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      >
        {flying ? (
          <>
            <g className="aquila-wing aquila-wing-left">
              <path d={AQUILA_WINGS.left} pathLength={trace ? 1 : undefined} />
            </g>
            <g className="aquila-wing aquila-wing-right">
              <path d={AQUILA_WINGS.right} pathLength={trace ? 1 : undefined} />
            </g>
            <path
              d={AQUILA_WINGS.feathers}
              pathLength={trace ? 1 : undefined}
            />
          </>
        ) : (
          <path d={AQUILA_SYMBOL_PATH} pathLength={trace ? 1 : undefined} />
        )}
      </g>
      <circle cx="29" cy="21" r="1.7" fill="currentColor" />
    </svg>
  );
}

export function AquilaLettering() {
  return (
    <span className="wordmark aquila-lettering" role="img" aria-label="AQUILA">
      <svg className="brand-tail" viewBox="0 0 146 42" aria-hidden="true">
        <g className="brand-letter brand-letter-q">
          <path d={AQUILA_LETTERS.q} />
          <path className="brand-q-tail" d={AQUILA_LETTERS.qTail} />
        </g>
        {["u", "i", "l"].map((letter) => (
          <path
            key={letter}
            className={`brand-letter brand-letter-${letter}`}
            d={AQUILA_LETTERS[letter]}
          />
        ))}
      </svg>
      <span className="brand-terminal">
        <svg className="brand-last-a" viewBox="0 0 34 42" aria-hidden="true">
          <path d={AQUILA_LETTERS.a} />
        </svg>
        <svg className="brand-diagonal" viewBox="0 0 24 30" aria-hidden="true">
          <path d="M6 4L19 26" />
        </svg>
      </span>
    </span>
  );
}
