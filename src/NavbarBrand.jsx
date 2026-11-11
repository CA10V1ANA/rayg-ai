import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import "./navbar.css";

/** One scroll timeline preserves the R, first A and final I of RAYG AI. */
export default function NavbarBrand() {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  const staticProgress = useMotionValue(0);
  const scrollProgress = useTransform(scrollY, [24, 280], [0, 1]);
  const progress = reduced ? staticProgress : scrollProgress;
  const scale = useTransform(progress, [0, 1], [1, 0.7]);
  const center = useTransform(progress, [0, 1], [0, 96]);
  const disappear = useTransform(progress, [0, 0.62], [1, 0]);
  const drift = useTransform(progress, [0, 1], [0, -12]);
  const lastI = useTransform(progress, [0.15, 1], [317, 122]);
  const ink = useTransform(
    progress,
    [0, 0.55, 1],
    ["#ffffff", "#087f8c", "#087f8c"],
  );
  return (
    <a
      className="scroll-brand"
      href="#inicio"
      aria-label="RAYG AI / RAI, início"
    >
      <motion.svg
        className="scroll-brand-art"
        viewBox="0 0 360 96"
        aria-hidden="true"
        style={{ scale }}
      >
        <motion.g
          style={{ x: center }}
          fontFamily="Space Grotesk, sans-serif"
          fontSize="76"
          fontWeight="700"
          fontStyle="italic"
          fill="var(--text-primary)"
        >
          <text x="0" y="76">
            R
          </text>
          <text x="61" y="76">
            A
          </text>
          <motion.g style={{ opacity: disappear, x: drift }}>
            <text x="122" y="76">
              Y
            </text>
            <text x="183" y="76">
              G{" "}
            </text>
          </motion.g>
          <motion.g style={{ opacity: disappear }}>
            <path d="M269 16H357L344 82H256Z" fill="var(--accent-primary)" />
            <text x="269" y="76" fill="var(--surface)">
              A
            </text>
          </motion.g>
          <motion.text x={lastI} y="76" style={{ fill: ink }}>
            I
          </motion.text>
        </motion.g>
      </motion.svg>
    </a>
  );
}
