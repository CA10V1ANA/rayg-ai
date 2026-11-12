import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AquilaSymbol, AquilaLettering } from "./AquilaBrand.jsx";
import SpaceBackground from "./components/ui/SpaceBackground.jsx";
import "./site-intro.css";

const FLIGHT_MS = 1400;
const smooth = (t) => t * t * (3 - 2 * t);
const bezier = (t, a, b, c) =>
  3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3 * c;
const transform = (x, y, scale, rotation = 0) =>
  `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale}) rotate(${rotation}deg)`;

export default function SiteIntro({
  reducedMotion,
  onComplete,
  onFlightStart,
}) {
  const [phase, setPhase] = useState("drawing");
  const [revealed, setRevealed] = useState(false);
  const root = useRef(null),
    signature = useRef(null),
    skip = useRef(null);
  const timers = useRef(new Set());
  const animations = useRef([]);
  const finishing = useRef(false),
    manualRequest = useRef(false),
    flying = useRef(false);
  const preference = useRef(reducedMotion),
    complete = useRef(onComplete),
    reveal = useRef(onFlightStart);
  preference.current = reducedMotion;
  complete.current = onComplete;
  reveal.current = onFlightStart;
  const later = useCallback((callback, delay) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      callback();
    }, delay);
    timers.current.add(id);
    return id;
  }, []);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    animations.current.forEach((animation) => animation.cancel());
    animations.current = [];
  }, []);
  const finish = useCallback(
    (manual = false) => {
      manualRequest.current ||= manual;
      if (finishing.current) return;
      finishing.current = true;
      // Freeze a flight at its current pose before cancelling its compositor animation.
      const pose =
        signature.current && getComputedStyle(signature.current).transform;
      if (signature.current && pose && pose !== "none")
        signature.current.style.transform = pose;
      clear();
      setPhase("closing");
      later(
        () => complete.current(manualRequest.current),
        preference.current ? 0 : 150,
      );
    },
    [clear, later],
  );
  const configure = useCallback(() => {
    const destination = document.querySelector(".scroll-brand");
    const mark = destination?.querySelector(".brandmark");
    const letters = destination?.querySelector(".wordmark");
    const byline = destination?.querySelector(".byline");
    if (!destination || !mark || !letters || !signature.current) return false;
    const css = getComputedStyle(destination);
    const style = root.current.style;
    style.setProperty("--intro-symbol-size", getComputedStyle(mark).width);
    style.setProperty("--intro-font-size", getComputedStyle(letters).fontSize);
    style.setProperty("--intro-gap", css.columnGap);
    style.setProperty("--intro-byline-size", getComputedStyle(byline).fontSize);
    style.setProperty(
      "--intro-byline-line",
      getComputedStyle(byline).lineHeight,
    );
    const logo = signature.current;
    const scale = Math.min(1.85, (innerWidth - 64) / logo.offsetWidth);
    style.setProperty("--intro-scale", String(scale));
    const symbol = logo.querySelector(".brandmark");
    // The SVG's CSS width is untransformed, unlike getBoundingClientRect during a flap.
    style.setProperty(
      "--intro-symbol-shift",
      `${(logo.offsetWidth - parseFloat(getComputedStyle(symbol).width)) / 2}px`,
    );
    return true;
  }, []);
  const startFlight = useCallback(() => {
    if (finishing.current || preference.current) {
      finish();
      return;
    }
    if (!configure()) {
      finish();
      return;
    }
    const node = signature.current;
    if (typeof node.animate !== "function") {
      finish();
      return;
    }
    const target = document.querySelector(".scroll-brand .brandmark");
    const targetBrand = document.querySelector(".scroll-brand");
    const symbol = node.querySelector(".brandmark");
    const initialScale = parseFloat(
      root.current.style.getPropertyValue("--intro-scale"),
    );
    const bounds = node.getBoundingClientRect(),
      markBounds = symbol.getBoundingClientRect(),
      destination = target.getBoundingClientRect();
    const localX =
      (markBounds.x + markBounds.width / 2 - bounds.x - bounds.width / 2) /
      initialScale;
    const localY =
      (markBounds.y + markBounds.height / 2 - bounds.y - bounds.height / 2) /
      initialScale;
    const finalScale =
      destination.width / parseFloat(getComputedStyle(symbol).width);
    const dx =
      destination.x +
      destination.width / 2 -
      innerWidth / 2 -
      localX * finalScale;
    const dy =
      destination.y +
      destination.height / 2 -
      innerHeight / 2 -
      localY * finalScale;
    const targetLetters = targetBrand.querySelector(".brand-tail");
    root.current.style.setProperty(
      "--land-letter-opacity",
      getComputedStyle(targetLetters).opacity,
    );
    root.current.style.setProperty(
      "--land-byline-opacity",
      getComputedStyle(targetBrand.querySelector(".byline")).opacity,
    );
    root.current.dataset.targetX = destination.x.toFixed(2);
    root.current.dataset.targetY = destination.y.toFixed(2);
    flying.current = true;
    setPhase("flight");
    setRevealed(true);
    reveal.current?.();
    const frames = Array.from({ length: 25 }, (_, i) => {
      const t = i / 24;
      return {
        offset: t,
        transform: transform(
          bezier(t, dx * 0.16, dx * 0.72, dx),
          bezier(t, dy * 0.4 - 90, dy - 40, dy),
          initialScale + (finalScale - initialScale) * smooth(t),
          -18 * Math.sin(Math.PI * t),
        ),
      };
    });
    const flight = node.animate(frames, {
      duration: FLIGHT_MS,
      easing: "cubic-bezier(0.25, 0.65, 0.3, 1)",
      fill: "forwards",
    });
    animations.current.push(flight);
    for (const [part, color] of [
      [
        node.querySelector(".wordmark"),
        getComputedStyle(targetBrand.querySelector(".wordmark")).color,
      ],
      [symbol, getComputedStyle(target).color],
    ]) {
      animations.current.push(
        part.animate([{ color: getComputedStyle(part).color }, { color }], {
          duration: 400,
          delay: FLIGHT_MS - 400,
          fill: "forwards",
        }),
      );
    }
    later(() => setPhase("landing"), FLIGHT_MS * 0.66);
    flight.finished
      .then(() => {
        if (finishing.current) return;
        setPhase("landed");
        later(() => {
          if (!finishing.current) {
            finishing.current = true;
            complete.current(false);
          }
        }, 120);
      })
      .catch(() => {});
  }, [configure, finish, later]);
  useLayoutEffect(() => {
    finishing.current = false;
    manualRequest.current = false;
    flying.current = false;
    skip.current?.focus({ preventScroll: true });
    configure();
    if (preference.current) later(() => finish(), 0);
    else {
      later(() => setPhase("letters"), 1000);
      later(() => setPhase("gather"), 1950);
      later(startFlight, 2250);
      later(() => finish(), 5500); // Never leave the page blocked if animation support fails.
    }
    const keyboard = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(true);
      }
      if (event.key === "Tab") {
        event.preventDefault();
        skip.current?.focus();
      }
    };
    const resize = () => {
      if (flying.current) finish();
      else configure();
    };
    window.addEventListener("keydown", keyboard);
    window.addEventListener("resize", resize);
    return () => {
      clear();
      window.removeEventListener("keydown", keyboard);
      window.removeEventListener("resize", resize);
    };
  }, [clear, configure, finish, later, startFlight]);
  useEffect(() => {
    if (reducedMotion) finish();
  }, [reducedMotion, finish]);
  return (
    <div
      ref={root}
      className="site-intro"
      data-phase={phase}
      data-revealed={revealed}
      role="dialog"
      aria-modal="true"
      aria-label="Abertura AQUILA"
    >
      <div className="intro-veil" aria-hidden="true" />
      <SpaceBackground
        reducedMotion={reducedMotion || revealed}
        particleColor="#e6a8a8"
      />
      <div ref={signature} className="intro-signature" aria-hidden="true">
        <div className="intro-logo brand">
          <AquilaSymbol trace flying />
          <span className="brand-type intro-brand-type">
            <AquilaLettering />
            <span className="byline">por Rayane Serrão</span>
          </span>
        </div>
      </div>
      <button
        ref={skip}
        className="intro-skip button"
        onClick={() => finish(true)}
      >
        Pular abertura <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
