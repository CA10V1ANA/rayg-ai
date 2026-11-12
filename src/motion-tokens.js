// Bridge the CSS motion scale to the existing Motion components.
export function readMotionTokens() {
  const css = getComputedStyle(document.documentElement);
  const number = (name, fallback) =>
    parseFloat(css.getPropertyValue(name)) || fallback;
  const ease = css
    .getPropertyValue("--ease-smooth-out")
    .match(/[\d.]+/g)
    ?.map(Number);
  return {
    fast: number("--duration-fast", 250) / 1000,
    quick: number("--duration-quick", 150) / 1000,
    distance: number("--distance-base", 8),
    blur: number("--blur-medium", 3),
    ease: ease?.length === 4 ? ease : [0.22, 1, 0.36, 1],
  };
}
