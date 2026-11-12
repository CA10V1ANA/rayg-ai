import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { validCPF, formatCPF, formatPhone } from "../src/checkout-utils.js";
assert.equal(validCPF("111.111.111-11"), false);
assert.equal(validCPF("529.982.247-25"), true);
assert.equal(validCPF("529.982.247-24"), false);
assert.equal(formatCPF("52998224725"), "529.982.247-25");
assert.equal(formatPhone("85999999999"), "(85) 99999-9999");
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

  for (const width of [1440, 1024, 768, 390, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: width === 320 ? "reduce" : "no-preference",
    });
    const page = await context.newPage();
    const errors = [],
      writes = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (request.method() !== "GET") writes.push(request.url());
    });
    await page.goto(url, { waitUntil: "networkidle" });
    for (const [name, price] of [
      ["Essencial", "250,00"],
      ["Signature", "400,00"],
      ["Prestige", "750,00"],
    ]) {
      const opener = page.getByRole("button", {
        name: `Explorar conceito ${name}`,
      });
      await opener.click();
      const dialog = page.getByRole("dialog");
      assert.match(
        await dialog.locator(".flow-price").innerText(),
        new RegExp(price),
      );
      assert.doesNotMatch(
        await dialog.innerText(),
        /demonstração|dados fictícios/i,
      );
      await dialog.getByRole("button", { name: /Ver caixa/ }).click();
      await dialog.locator(".case-viewer").waitFor();
      await dialog.getByRole("button", { name: /Preencher dados/ }).click();
      await dialog.getByLabel("Nome completo").fill("Pessoa Exemplo");
      await dialog
        .getByLabel("E-mail", { exact: true })
        .fill("pessoa@example.com");
      await dialog.getByLabel("CPF", { exact: true }).fill("11111111111");
      await dialog.getByLabel("Celular com DDD").fill("85999999999");
      await dialog.getByRole("button", { name: /Ir para pagamento/ }).click();
      await dialog.getByText("Confira o CPF informado.").waitFor();
      await dialog.getByLabel("CPF", { exact: true }).fill("52998224725");
      await dialog.getByRole("button", { name: /Ir para pagamento/ }).click();
      await dialog.getByRole("heading", { name: "Dados do pagador" }).waitFor();
      assert.match(
        await dialog.locator(".flow-payer").innerText(),
        /529.982.247-25/,
      );
      assert.equal(
        await dialog.getByRole("button", { name: "Gerar Pix" }).isDisabled(),
        true,
      );
      await dialog.getByRole("radio", { name: /Cartão/ }).check();
      await dialog.getByLabel("Parcelamento").selectOption("10");
      assert.equal(
        await dialog.getByLabel("Parcelamento").locator("option").count(),
        10,
      );
      assert.equal(
        await dialog.getByLabel("Número do cartão").isDisabled(),
        true,
      );
      await dialog.getByRole("button", { name: "Revisar dados" }).click();
      await dialog
        .getByRole("status")
        .filter({ hasText: "Dados revisados" })
        .waitFor();
      assert.doesNotMatch(
        await dialog.innerText(),
        /pagamento aprovado|pagamento confirmado/i,
      );
      await page.waitForTimeout(650);
      const axe = await new AxeBuilder({ page })
        .include("dialog")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        axe.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
        [],
      );
      await dialog.screenshot({
        path: `audit-output/aquila/${width}-${name}-checkout.png`,
      });
      assert.equal(
        await dialog.evaluate((el) => el.scrollWidth > el.clientWidth),
        false,
        "No horizontal dialog overflow",
      );
      await dialog.getByRole("radio", { name: /Boleto/ }).check();
      await dialog.getByLabel("CEP", { exact: true }).waitFor();
      await dialog.getByRole("button", { name: "Revisar dados" }).click();
      assert.equal(
        await dialog
          .getByRole("status")
          .filter({ hasText: "Dados revisados" })
          .count(),
        0,
      );
      for (const [label, value] of [
        ["CEP", "60000000"],
        ["Endereço", "Rua Exemplo"],
        ["Número", "100"],
        ["Bairro", "Centro"],
        ["Cidade", "Fortaleza"],
      ])
        await dialog.getByLabel(label, { exact: true }).fill(value);
      await dialog.getByLabel("Estado", { exact: true }).selectOption("CE");
      await dialog.getByRole("button", { name: "Revisar dados" }).click();
      await dialog
        .getByRole("status")
        .filter({ hasText: "Dados revisados" })
        .waitFor();
      await page.waitForTimeout(650);
      const boletoAxe = await new AxeBuilder({ page })
        .include("dialog")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      assert.deepEqual(
        boletoAxe.violations.map((v) => ({
          id: v.id,
          targets: v.nodes.map((n) => n.target),
        })),
        [],
      );
      await dialog.getByRole("button", { name: /Editar dados/ }).click();
      assert.equal(
        await dialog.getByLabel("Nome completo").inputValue(),
        "Pessoa Exemplo",
      );
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      assert.equal(
        await opener.evaluate((el) => el === document.activeElement),
        true,
      );
      await opener.click();
      await dialog.getByRole("button", { name: /Ver caixa/ }).click();
      await dialog.getByRole("button", { name: /Preencher dados/ }).click();
      assert.equal(await dialog.getByLabel("Nome completo").inputValue(), "");
      await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
      results.push({
        width,
        name,
        checkout: "passed",
        accessibility: "passed",
        reducedMotion: width === 320,
      });
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(
      writes,
      [],
      "No personal or card data submitted without a provider",
    );
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
