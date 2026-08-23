import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("market swap is a dedicated product screen, not a generic fallback", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const product = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  assert.ok(page.includes('componentKey === "SwapScreen" && <SwapScreen'));
  assert.equal(page.includes("FeatureScreen"), false);
  for (const required of [
    "Актив FROM",
    "Актив TO",
    "Сумма обмена",
    "Поменять активы местами",
    "Детали demo quote",
    "Комиссия протокола",
    "Network fee",
    "Estimated receive",
    "Проверить обмен",
    "Проверка обмена",
    "SIMULATED",
    "NO SETTLEMENT",
    "NO BROADCAST",
    "NO REAL FUNDS MOVED",
  ]) assert.ok(product.includes(required), required);
});

test("changing or reversing From/To updates exact local state", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  for (const required of [
    "setFromId(next)",
    "setToId(next)",
    "setFromId(toId)",
    "setToId(fromId)",
    "convertDemoAssetMinor(amountMinor, from, to)",
    "parseMinorUnits(amount, from.decimals)",
  ]) assert.ok(source.includes(required), required);
  assert.equal(/Number\(|parseFloat\(/.test(source), false);
});

test("exchange is visible from Wallet and Market entry points", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const product = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  assert.ok(page.includes('className="market-primary-actions"'));
  assert.ok(page.includes("Обменять"));
  assert.ok(product.includes("WalletActions"));
  assert.ok(product.includes('navigateRoute("/market/swap")'));
});
