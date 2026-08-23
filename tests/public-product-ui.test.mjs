import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("default public render path contains no generic or route-directory component", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.equal(page.includes("FeatureScreen"), false);
  assert.equal(page.includes("FamilyRouteShelf"), false);
  assert.equal(page.includes("FamilyRouteGrid"), false);
  assert.equal(page.includes("ATOMIC SCREEN MAP"), false);
  assert.equal(page.includes("HASH ROUTE"), false);
  assert.equal(page.includes("SCREEN ID"), false);
});

test("internal implementation map is environment-gated and default-false", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.ok(page.includes('const PUBLIC_DEBUG_UI = process.env.NEXT_PUBLIC_DEMO_MAP === "true"'));
  assert.ok(page.includes('route === "/internal/screen-map" && PUBLIC_DEBUG_UI'));
});

test("V3 typography layer raises public body, secondary, caption and button text", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.ok(css.includes("html,body { color:var(--ink); background:var(--canvas); font-size:15px"));
  assert.ok(css.includes(".app-frame :where(small,time) { font-size:12px!important"));
  assert.ok(css.includes(".onboarding-stage :where(small,time,em) { font-size:12px!important"));
  assert.ok(css.includes(".app-frame :where(button,input,select,textarea) { font-size:14px"));
  assert.ok(css.includes(".v3-product-heading h1 {"));
});
