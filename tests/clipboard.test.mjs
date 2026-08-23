import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { clipboardNotice } from "../app/ui-contracts.ts";

test("copy success and failure messages are mutually truthful", () => {
  assert.equal(clipboardNotice(true), "Демонстрационный идентификатор скопирован");
  assert.equal(clipboardNotice(false), "Не удалось скопировать demo-идентификатор. Буфер обмена недоступен.");
  assert.equal(clipboardNotice(false).includes("скопирован"), false);
});

test("asset-context receive copy reports success only after clipboard write", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  const write = "await navigator.clipboard.writeText(asset.demoReceiveIdentifier)";
  const success = "Демонстрационный идентификатор скопирован";
  assert.ok(source.includes(write));
  assert.ok(source.indexOf(write) < source.indexOf(success));
  assert.ok(source.includes("Не удалось скопировать demo-идентификатор"));
});

test("receive flow only reports success after awaited clipboard writeText", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.ok(source.includes("await navigator.clipboard.writeText(DEMO_ADDRESS)"));
  assert.ok(source.includes("notify(clipboardNotice(true))"));
  assert.ok(source.includes("notify(clipboardNotice(false))"));
  assert.ok(source.indexOf("await navigator.clipboard.writeText(DEMO_ADDRESS)") < source.indexOf("notify(clipboardNotice(true))"));
});
