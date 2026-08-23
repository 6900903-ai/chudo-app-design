import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { screenImplementationRegistry } from "../app/screen-implementation-registry.ts";

const requiredTargets = {
  "/home/favorites-empty": ["HomeSemantic", "home-favorites-empty"],
  "/portfolio/watchlist": ["PortfolioSemantic", "portfolio-watchlist"],
  "/portfolio/watchlist-empty": ["PortfolioSemantic", "portfolio-watchlist-empty"],
  "/mining/no-miner": ["MiningSemantic", "mining-no-miner"],
  "/security/devices": ["SecuritySemantic", "security-devices"],
  "/security/log": ["SecuritySemantic", "security-log"],
  "/documents/privacy": ["DocumentSemantic", "documents-privacy"],
  "/support/faq": ["SettingsSemantic", "support-faq"],
  "/settings/version": ["SettingsSemantic", "settings-version"],
  "/market/chudo-eur/order-book": ["MarketSemantic", "market-chudo-eur-order-book"],
};

test("blocking target routes have exact renderer and semantic identities", () => {
  for (const [route, [componentKey, semanticKey]] of Object.entries(requiredTargets)) {
    const descriptor = screenImplementationRegistry.find(item => item.route === route);
    assert.ok(descriptor, route);
    assert.equal(descriptor.componentKey, componentKey, route);
    assert.equal(descriptor.semanticKey, semanticKey, route);
    assert.equal(descriptor.implementationKind, "SHARED_SEMANTIC_SCREEN", route);
  }
});

test("hard semantic routes render differentiated truthful states", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  const routeSpecificEvidence = [
    'case "home-favorites-empty"', "Здесь пока ничего нет",
    'target.semanticKey === "portfolio-watchlist"', "НЕ ЯВЛЯЕТСЯ ПОЗИЦИЕЙ",
    'target.semanticKey === "portfolio-watchlist-empty"', "Список наблюдения пуст",
    'target.semanticKey === "mining-no-miner"', "Здесь намеренно нет hashrate",
    'target.semanticKey === "security-devices"', "Device attestation",
    'target.semanticKey === "security-log"', "не security backend",
    '"documents-privacy"', "seed phrase, ключи, контакты, камеру или микрофон",
    'target.semanticKey === "support-faq"', "Можно ли отправить реальные средства?",
    'target.semanticKey === "settings-version"', "CHUDO Public Demo V3",
    'target.semanticKey === "market-chudo-eur-order-book"', "PAIR-SPECIFIC FIXTURE",
  ];
  for (const evidence of routeSpecificEvidence) assert.ok(source.includes(evidence), evidence);
});

test("semantic dispatcher selects registry componentKey and has no family fallback", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  assert.ok(source.includes('target.componentKey === "HomeSemantic"'));
  assert.ok(source.includes('target.componentKey === "SettingsSemantic"'));
  assert.ok(source.includes("No semantic renderer for"));
  assert.equal(source.includes('target.familyId === "03"'), false);
  assert.equal(source.includes("Вернуться на главную</button></section>"), false);
});
