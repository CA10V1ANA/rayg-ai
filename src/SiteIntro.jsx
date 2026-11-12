import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AquilaSymbol, AquilaLettering } from "./AquilaBrand.jsx";
import "./site-intro.css";

const UP_MS = 750;
const LEFT_MS = 850;
const transform = (x, y, scale) =>
  `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;

export default function SiteIntro({
  reducedMotion,
  onComplete,
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
    complete = useRef(onComplete);
  preference.current = reducedMotion;
  complete.current = onComplete;
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
    if (!root.current.dataset.bodyReady) {
      const mark = symbol.getBoundingClientRect();
      const center = logo.getBoundingClientRect();
      // Each existing letter becomes part of the tapered body, rather than a caption.
      const poses = [
        [".brand-letter-q", 32, 0.52, 0],
        [".brand-letter-u", 43, 0.48, 0],
        [".brand-letter-i", 50, 0.3, 0],
        [".brand-letter-l", 58, 0.34, -15],
        [".brand-last-a", 66, 0.36, 180],
      ];
      for (const [selector, y, size, rotation] of poses) {
        const letter = logo.querySelector(selector);
        const box = letter.getBoundingClientRect();
        const units = letter.tagName.toLowerCase() === "svg"
          ? scale
          : Math.hypot(letter.getScreenCTM().a, letter.getScreenCTM().b);
        letter.style.setProperty("--body-x", `${(center.x + center.width / 2 - box.x - box.width / 2) / units}px`);
        letter.style.setProperty("--body-y", `${(mark.y + mark.height / 2 + y * scale - box.y - box.height / 2) / units}px`);
        letter.style.setProperty("--body-scale", size);
        letter.style.setProperty("--body-rotation", `${rotation}deg`);
      }
      root.current.dataset.bodyReady = "true";
    }
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
    const destination = target.getBoundingClientRect();
    const bounds = node.getBoundingClientRect();
    const markBounds = symbol.getBoundingClientRect();
    const shift = parseFloat(root.current.style.getPropertyValue("--intro-symbol-shift"));
    const localX = (markBounds.x + markBounds.width / 2 - bounds.x - bounds.width / 2) / initialScale - shift;
    const localY = (markBounds.y + markBounds.height / 2 - bounds.y - bounds.height / 2) / initialScale;
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
    setPhase("ascending");
    // First move vertically, keeping the symbol and stacked lettering centered.
    const upward = node.animate([
      { transform: transform(0, 0, initialScale) },
      { transform: transform(0, dy, finalScale) },
    ], { duration: UP_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" });
    animations.current.push(upward);
    upward.finished.then(() => {
      if (finishing.current) return;
      // The second leg is strictly horizontal. Lettering docks alongside the symbol.
      setPhase("left");
      later(() => setPhase("docking"), 150);
      const sideways = node.animate([
        { transform: transform(0, dy, finalScale) },
        { transform: transform(dx, dy, finalScale) },
      ], { duration: LEFT_MS, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" });
      animations.current.push(sideways);
      sideways.finished.then(() => {
        if (finishing.current) return;
        setPhase("landed");
        setRevealed(true);
        later(() => {
          if (!finishing.current) {
            finishing.current = true;
            complete.current(false);
          }
        }, 450);
      }).catch(() => {});
    }).catch(() => {});
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
          delay: UP_MS + LEFT_MS - 300,
          fill: "forwards",
        }),
      );
    }
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
      later(() => setPhase("body"), 1750);
      later(startFlight, 2500);
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
      <div ref={signature} className="intro-signature" aria-hidden="true">
        <div className="intro-logo brand">
          <AquilaSymbol trace />
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
