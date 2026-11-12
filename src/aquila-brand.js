// Shared vector artwork for DOM signatures and 3D packaging textures.
export const AQUILA_SYMBOL_PATH =
  "M4 52Q24 40 29 5Q34 36 56 52M14 44Q30 22 46 44M22 49Q30 36 38 49M29 5L33 12";
export const AQUILA_WINGS = {
  left: "M4 52Q24 40 29 5",
  right: "M29 5Q34 36 56 52",
  feathers: "M14 44Q30 22 46 44M22 49Q30 36 38 49M29 5L33 12",
};
export const AQUILA_LETTERS = {
  q: "M31 8C25 1 7 2 4 16C0 33 16 40 27 33C37 26 38 14 31 8Z",
  qTail: "M21 26Q29 39 42 38",
  u: "M52 5V25Q52 36 64 36Q76 36 76 25V5",
  i: "M94 5V36",
  l: "M113 5V36H141",
  a: "M2 36L17 5L32 36M8 25H26",
};

export function drawAquilaWordmark(context, ink, width, height) {
  const scale = Math.min(width / 272, height / 72);
  context.save();
  context.translate((width - 256 * scale) / 2, (height - 60 * scale) / 2);
  context.scale(scale, scale);
  context.strokeStyle = ink;
  context.fillStyle = ink;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 1.25;
  context.stroke(new Path2D(AQUILA_SYMBOL_PATH));
  context.beginPath();
  context.arc(29, 21, 1.7, 0, Math.PI * 2);
  context.fill();
  context.translate(76, 4);
  context.lineWidth = 1.35;
  for (const letter of ["q", "qTail", "u", "i", "l"])
    context.stroke(new Path2D(AQUILA_LETTERS[letter]));
  context.translate(146, 0);
  context.stroke(new Path2D(AQUILA_LETTERS.a));
  context.restore();
}
