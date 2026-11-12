import { build } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("../", import.meta.url));
const destination = path.join(root, "entregas", "AQUILA-site-completo.html");
const result = await build({
  configFile: false,
  root,
  plugins: [react()],
  publicDir: false,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    write: false,
    minify: true,
    cssCodeSplit: false,
    sourcemap: false,
    lib: {
      entry: path.join(root, "src/main.jsx"),
      name: "AquilaSite",
      formats: ["iife"],
    },
  },
});
const output = (Array.isArray(result) ? result : [result]).flatMap(
  (item) => item.output,
);
let javascript = output
  .filter((item) => item.type === "chunk")
  .map((item) => item.code)
  .join("\n");
let css = output
  .filter((item) => item.type === "asset" && item.fileName.endsWith(".css"))
  .map((item) => String(item.source))
  .join("\n");
let html = await fs.readFile(path.join(root, "index.html"), "utf8");
const mime = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
};
const embedded = {};
async function embedAssets(directory) {
  for (const item of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) {
      await embedAssets(file);
      continue;
    }
    const url =
      "/" +
      path.relative(path.join(root, "public"), file).replaceAll("\\", "/");
    if (!javascript.includes(url) && !css.includes(url) && !html.includes(url))
      continue;
    const data =
      "data:" +
      (mime[path.extname(file)] || "application/octet-stream") +
      ";base64," +
      (await fs.readFile(file)).toString("base64");
    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const lookup = `__AQUILA_ASSETS__[${JSON.stringify(url)}]`;
    javascript = javascript.replace(
      new RegExp('(["\x27`])' + escaped + "\\1", "g"),
      () => lookup,
    );
    if (javascript.includes(lookup)) embedded[url] = data;
    css = css.replaceAll(url, data);
    html = html.replaceAll(url, data);
  }
}
await embedAssets(path.join(root, "public"));
javascript =
  "const __AQUILA_ASSETS__=" + JSON.stringify(embedded) + ";\n" + javascript;
new vm.Script(javascript, { filename: "AQUILA-site-completo.js" });
html = html.replace(
  /\s*<script\b[^>]*src="\/src\/main\.jsx"[^>]*><\/script>/,
  "",
);
// Callback replacements preserve literal dollar sequences in the compiled JS.
html = html.replace(
  "</head>",
  () =>
    "<style>" + css.replace(/<\/style/gi, "<\\/style") + "</style>\n</head>",
);
html = html.replace(
  "</body>",
  () =>
    "<script>" +
    javascript.replace(/<\/script/gi, "<\\/script") +
    "</script>\n</body>",
);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, html, "utf8");
console.log(
  `HTML completo: ${destination} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB)`,
);
