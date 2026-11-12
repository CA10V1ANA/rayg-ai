import { AQUILA_LETTERS, AQUILA_SYMBOL_PATH } from "./aquila-brand.js";

export function AquilaSymbol() {
  return (
    <svg className="brandmark" viewBox="0 0 60 60" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      >
        <path d={AQUILA_SYMBOL_PATH} />
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
