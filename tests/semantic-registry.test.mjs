import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { screenCatalog } from "../app/screen-catalog.ts";
import { screenImplementationRegistry } from "../app/screen-implementation-registry.ts";

test("explicit implementation registry has exactly one complete descriptor per canonical target", () => {
  assert.equal(screenImplementationRegistry.length, 126);
  assert.equal(new Set(screenImplementationRegistry.map(item => item.screenId)).size, 126);
  assert.equal(new Set(screenImplementationRegistry.map(item => item.route)).size, 126);
  assert.equal(new Set(screenImplementationRegistry.map(item => item.semanticKey)).size, 126);
  const byId = new Map(screenImplementationRegistry.map(item => [item.screenId, item]));
  for (const target of screenCatalog) {
    const descriptor = byId.get(target.screenId);
    assert.ok(descriptor, target.screenId);
    assert.equal(descriptor.route, target.route, target.screenId);
    for (const field of ["implementationKind", "componentKey", "semanticKey", "interactionKey", "publicReady", "status"]) {
      assert.equal(target[field], descriptor[field], `${target.screenId}:${field}`);
    }
  }
});

test("classification is explicit and contains no catalog defaulting mechanism", async () => {
  const catalog = await readFile(new URL("../app/screen-catalog.ts", import.meta.url), "utf8");
  for (const forbidden of ["implementationFor", "dedicatedIds", "runtimeStateIds", "componentByFamily"]) {
    assert.equal(catalog.includes(forbidden), false, forbidden);
  }
  assert.deepEqual(Object.fromEntries(["DEDICATED_SCREEN", "SHARED_SEMANTIC_SCREEN", "RUNTIME_STATE", "COVERAGE_PLACEHOLDER"].map(kind => [kind, screenImplementationRegistry.filter(item => item.implementationKind === kind).length])), {
    DEDICATED_SCREEN: 24,
    SHARED_SEMANTIC_SCREEN: 91,
    RUNTIME_STATE: 11,
    COVERAGE_PLACEHOLDER: 0,
  });
  assert.ok(screenImplementationRegistry.every(item => item.publicReady && item.status === "IMPLEMENTED"));
});

test("registry component keys are consumed by actual runtime dispatchers", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const product = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  const semanticComponents = new Set(["HomeSemantic", "ChatSemantic", "MarketSemantic", "PortfolioSemantic", "MiningSemantic", "SecuritySemantic", "DocumentSemantic", "SettingsSemantic"]);
  for (const componentKey of new Set(screenImplementationRegistry.map(item => item.componentKey))) {
    const source = semanticComponents.has(componentKey) ? product : page;
    assert.ok(source.includes(`\"${componentKey}\"`) || source.includes(`${componentKey}(`) || source.includes(`<${componentKey}`), componentKey);
  }
  assert.ok(page.includes("isSemanticComponentKey(componentKey)"));
  assert.ok(page.includes('data-component-key={target?.componentKey}'));
  assert.ok(page.includes('data-semantic-key={target?.semanticKey}'));
  assert.ok(product.includes('data-semantic-key={target.semanticKey}'));
});

test("runtime call states alone use CallOverlay and preserve exact semantic identity", () => {
  const calls = screenImplementationRegistry.filter(item => item.componentKey === "CallOverlay");
  assert.equal(calls.length, 11);
  assert.ok(calls.every(item => item.implementationKind === "RUNTIME_STATE"));
  assert.deepEqual(calls.map(item => item.semanticKey), ["calls-audio", "calls-video", "calls-incoming", "calls-outgoing", "calls-ringing", "calls-connecting", "calls-connected", "calls-reconnecting", "calls-failed", "calls-ended", "calls-minimized"]);
});
