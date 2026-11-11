import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });
const url = process.env.AQUILA_URL || "http://127.0.0.1:5175";
const results = [];
await fs.mkdir("audit-output/aquila", { recursive: true });
try {
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const active = () => page.locator(".collection-preview p").innerText();
    const first = await active();
    await page.waitForTimeout(5200);
    assert.notEqual(
      await active(),
      first,
      "collection automatically changes the highlighted concept",
    );
    await page.locator("#modelos").hover();
    const hovered = await active();
    await page.waitForTimeout(5200);
    assert.equal(
      await active(),
      hovered,
      "automatic change stops during interaction",
    );
    assert.equal(
      await page
        .locator("#modelos")
        .getByRole("button", { name: /pausar/i })
        .count(),
      0,
    );
    results.push({
      automaticCollection: "passed",
      hoverStopsAutomaticChange: true,
      pauseButton: false,
    });
    await context.close();
  }

  for (const width of [1440, 390]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();
    const errors = [],
      writes = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (request.method() !== "GET") writes.push(request.url());
    });
    await page.goto(url, { waitUntil: "networkidle" });
    for (const name of ["Essencial", "Signature", "Prestige"]) {
      const opener = page.getByRole("button", {
        name: `Explorar conceito ${name}`,
      });
      await opener.click();
      const dialog = page.getByRole("dialog");
      assert.equal(
        await dialog.getByRole("heading", { level: 2 }).innerText(),
        `AQUILA ${name}`,
      );
      assert.match(await dialog.innerText(), /Em definição/);
      assert.doesNotMatch(await dialog.innerText(), /RAYG|R\$|sem juros/);
      await dialog
        .getByRole("button", { name: /Ver caixa e conteúdo/ })
        .click();
      await dialog.locator(".case-viewer").waitFor();
      await page.waitForFunction(
        () => {
          const button = document.querySelector(".case-toggle");
          return (
            button &&
            (!button.disabled || document.querySelector(".case-fallback"))
          );
        },
        { timeout: 20000 },
      );
      const box = dialog.getByRole("button", { name: "Abrir caixa" });
      const available = await box.isEnabled();
      if (available) {
        await box.click();
        assert.equal(await dialog.locator("#case-opening").inputValue(), "100");
        await dialog.getByRole("button", { name: "Fechar caixa" }).click();
        assert.equal(await dialog.locator("#case-opening").inputValue(), "0");
        await dialog.locator("#case-opening").fill("50");
        assert.equal(await dialog.locator("#case-opening").inputValue(), "50");
      }
      await dialog.screenshot({
        path: `audit-output/aquila/${width}-${name}-box.png`,
      });
      const axe = await new AxeBuilder({ page })
        .include("dialog")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        axe.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
        [],
      );
      await dialog.getByRole("button", { name: /Preencher dados/ }).click();
      await dialog.getByRole("button", { name: /Ir para pagamento/ }).click();
      assert.equal(
        await dialog
          .locator("#demo-name")
          .evaluate((el) => el.validity.valueMissing),
        true,
      );
      await dialog.getByLabel("Nome de demonstração").fill("Pessoa Exemplo");
      await dialog
        .getByLabel("E-mail de demonstração")
        .fill("pessoa@example.com");
      await dialog.getByLabel("Cidade de demonstração").fill("Cidade Exemplo");
      await dialog.getByRole("button", { name: /Ir para pagamento/ }).click();
      assert.match(await dialog.innerText(), /Valor a definir/);
      await dialog.getByLabel("Cartão", { exact: true }).check();
      await dialog.getByRole("button", { name: /Voltar/ }).click();
      assert.equal(
        await dialog.getByLabel("Nome de demonstração").inputValue(),
        "Pessoa Exemplo",
      );
      await dialog.getByRole("button", { name: /Ir para pagamento/ }).click();
      await dialog.screenshot({
        path: `audit-output/aquila/${width}-${name}-payment.png`,
      });
      await dialog
        .getByRole("button", { name: /Concluir demonstração/ })
        .click();
      assert.match(
        await dialog.getByRole("status").innerText(),
        /Nenhum pedido foi criado/,
      );
      await dialog.getByRole("button", { name: /Voltar à coleção/ }).click();
      await page.locator("dialog").waitFor({ state: "hidden" });
      assert.equal(
        await opener.evaluate((el) => el === document.activeElement),
        true,
      );
      results.push({
        width,
        model: name,
        box3D: available,
        steps: "passed",
        axeViolations: 0,
      });
    }
    assert.deepEqual(writes, [], "No data or payments are sent");
    assert.deepEqual(errors, []);
    await context.close();
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const initial = await page.locator(".collection-preview p").innerText();
  await page.waitForTimeout(5200);
  assert.equal(
    await page.locator(".collection-preview p").innerText(),
    initial,
  );
  results.push({ reducedMotionDisablesAutomaticCollection: "passed" });
  await fs.writeFile(
    "audit-output/aquila/flow-results.json",
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
