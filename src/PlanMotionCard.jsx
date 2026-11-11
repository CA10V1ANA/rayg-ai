import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import "./plan-motion.css";

/** Pointer motion stays outside React state and never captures touch scrolling. */
export default function PlanMotionCard({
  children,
  className,
  id,
  scrollIndex = 0,
}) {
  const reduced = useReducedMotion();
  const bounds = useRef(null);
  const x = useMotionValue(0),
    y = useMotionValue(0),
    lift = useMotionValue(0);
  const spring = { stiffness: 260, damping: 30, mass: 0.65 };
  const smoothX = useSpring(x, spring),
    smoothY = useSpring(y, spring),
    smoothLift = useSpring(lift, spring);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["2deg", "-2deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-2deg", "2deg"]);
  const imageX = useTransform(smoothX, (v) => `${v * 12}px`),
    imageY = useTransform(smoothY, (v) => `${v * 8}px`);
  const glowX = useTransform(x, (v) => `${(v + 0.5) * 100}%`),
    glowY = useTransform(y, (v) => `${(v + 0.5) * 100}%`);
  function reset() {
    x.set(0);
    y.set(0);
    lift.set(0);
    bounds.current = null;
  }
  useEffect(() => {
    if (reduced) {
      x.jump(0);
      y.jump(0);
      lift.jump(0);
    }
  }, [reduced, x, y, lift]);
  function canAnimate(e) {
    return (
      !reduced &&
      e.pointerType === "mouse" &&
      matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }
  function enter(e) {
    if (!canAnimate(e)) return;
    bounds.current = e.currentTarget.getBoundingClientRect();
    lift.set(-4);
  }
  function move(e) {
    if (!canAnimate(e)) return;
    const rect = bounds.current ?? e.currentTarget.getBoundingClientRect();
    x.set(
      Math.max(-0.5, Math.min(0.5, (e.clientX - rect.left) / rect.width - 0.5)),
    );
    y.set(
      Math.max(-0.5, Math.min(0.5, (e.clientY - rect.top) / rect.height - 0.5)),
    );
  }
  return (
    <motion.article
      id={id}
      className={`plan-motion-card ${className}`}
      onPointerEnter={enter}
      onPointerMove={move}
      onPointerLeave={reset}
      onPointerCancel={reset}
      initial={reduced ? false : { opacity: 0, scale: 0.985 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{
        opacity: { duration: 0.5, delay: scrollIndex * 0.08 },
        scale: {
          duration: 0.62,
          delay: scrollIndex * 0.08,
          ease: [0.16, 1, 0.3, 1],
        },
      }}
      style={{
        y: reduced ? 0 : smoothLift,
        "--product-x": reduced ? "0px" : imageX,
        "--product-y": reduced ? "0px" : imageY,
        "--product-rx": reduced ? "0deg" : rotateX,
        "--product-ry": reduced ? "0deg" : rotateY,
        "--glow-x": glowX,
        "--glow-y": glowY,
      }}
    >
      {children}
    </motion.article>
  );
}
