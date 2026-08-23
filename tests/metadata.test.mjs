import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("public metadata makes no unconfirmed domain claim and Pages paths are repository-safe", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const pages = await readFile(new URL("../github-pages/index.html", import.meta.url), "utf8");
  assert.ok(layout.includes("NEXT_PUBLIC_SITE_URL"));
  for (const stale of ["chudzinovich.chatgpt.site", "CHUDO.info", "chudo.info"]) {
    assert.equal(layout.includes(stale), false, stale);
    assert.equal(pages.includes(stale), false, stale);
  }
  assert.match(pages, /PUBLIC DEMO \/ SIMULATED/);
  assert.match(pages, /BACKEND NOT CONNECTED/);
  assert.match(pages, /\/chudo-app-design\/og\.png/);
  assert.match(pages, /\/chudo-app-design\/chudo-icon\.png/);
});
