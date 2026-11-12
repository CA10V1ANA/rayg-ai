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

export default function SiteIntro({ reducedMotion, onComplete }) {
  const [leaving, setLeaving] = useState(false);
  const [manualExit, setManualExit] = useState(false);
  const skip = useRef(null);
  const timers = useRef({ auto: 0, exit: 0 });
  const finishing = useRef(false);
  const manualRequest = useRef(false);
  const preference = useRef(reducedMotion);
  const complete = useRef(onComplete);
  preference.current = reducedMotion;
  complete.current = onComplete;
  const finish = useCallback((manual = false) => {
    manualRequest.current ||= manual;
    if (finishing.current) return;
    finishing.current = true;
    clearTimeout(timers.current.auto);
    setManualExit(manual);
    setLeaving(true);
    timers.current.exit = setTimeout(
      () => complete.current(manualRequest.current),
      preference.current ? 0 : manual ? 150 : 350,
    );
  }, []);
  useLayoutEffect(() => {
    finishing.current = false;
    skip.current?.focus({ preventScroll: true });
    timers.current.auto = setTimeout(
      () => finish(),
      preference.current ? 120 : 2300,
    );
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
    window.addEventListener("keydown", keyboard);
    return () => {
      clearTimeout(timers.current.auto);
      clearTimeout(timers.current.exit);
      window.removeEventListener("keydown", keyboard);
    };
  }, [finish]);
  useEffect(() => {
    if (reducedMotion) finish();
  }, [reducedMotion, finish]);
  return (
    <div
      className={`site-intro${leaving ? " is-leaving" : ""}${manualExit ? " is-skipped" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Abertura AQUILA"
    >
      <SpaceBackground reducedMotion={reducedMotion} particleColor="#e6a8a8" />
      <div className="intro-signature" aria-hidden="true">
        <div className="intro-wordmark">
          <AquilaSymbol trace />
          <AquilaLettering />
        </div>
        <p>por Rayane Serrão</p>
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
