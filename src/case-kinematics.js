const clamp = (value) => Math.max(0, Math.min(1, value));
const phase = (value, start, end) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

export const caseViewProgress = (amount) => phase(clamp(amount), 0.15, 1);

// Separate mechanisms, all reversible through the same normalized control.
export function casePose(variant, amount) {
  const value = clamp(amount);
  if (variant === "essencial")
    return {
      mechanism: "lift-off",
      lidAngle: phase(value, 0.35, 1) * 18,
      lidLift: phase(value, 0, 0.4) * 1.7,
      lidSlide: phase(value, 0.35, 1) * 4.8,
      drawerOffset: 0,
    };
  if (variant === "ultra")
    return {
      mechanism: "staged-drawer",
      lidAngle: phase(value, 0, 0.55) * 112,
      lidLift: 0,
      lidSlide: 0,
      drawerOffset: phase(value, 0.6, 1) * 1.8,
    };
  return {
    mechanism: "hinged",
    lidAngle: value * 106,
    lidLift: 0,
    lidSlide: 0,
    drawerOffset: 0,
  };
}
