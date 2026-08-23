import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { fallbackRouteForUnknown, isKnownScreenRoute, normalizeHash, rootRouteByView, routeToView, toHashRoute } from "../app/hash-routing.ts";
import { getScreenCoverageSummary, screenCatalog, screenFamilies } from "../app/screen-catalog.ts";
import { centralChudoActions, mobileNavigationContract, secondaryMobileDestinations } from "../app/ui-contracts.ts";

test("approved mobile and desktop navigation contracts expose every root family", async () => {
  assert.deepEqual(mobileNavigationContract.map(item => item.label), ["Главная", "Чаты", "CHUDO", "Кошелёк", "Защита"]);
  assert.deepEqual(centralChudoActions.map(item => item.label), ["Написать", "Сканировать", "Отправить", "Получить"]);
  assert.deepEqual(secondaryMobileDestinations.map(item => item.view), ["market", "calls", "portfolio", "mining", "documents", "settings"]);
  const reachable = new Set([...mobileNavigationContract.flatMap(item => item.view ? [item.view] : []), ...secondaryMobileDestinations.map(item => item.view)]);
  assert.deepEqual([...reachable].sort(), ["calls", "chats", "documents", "home", "market", "mining", "portfolio", "security", "settings", "wallet"]);
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const label of ["Главная", "Чаты", "Звонки", "Кошелёк", "Рынок", "Портфель", "Майнинг", "Защита", "Документы", "Настройки / Помощь"]) {
    assert.ok(source.includes(`label: "${label}"`), label);
  }
  assert.ok(source.includes('aria-label="Действия CHUDO"'));
});

test("canonical catalog accounts for exactly 126 unique atomic targets in 10 families", () => {
  assert.equal(screenFamilies.length, 10);
  assert.equal(screenCatalog.length, 126);
  assert.equal(new Set(screenCatalog.map(target => target.screenId)).size, 126);
  assert.equal(new Set(screenCatalog.map(target => target.route)).size, 126);
  assert.deepEqual(getScreenCoverageSummary(), {
    accounted: 126,
    implemented: 126,
    adapted: 0,
    deferred: 0,
    ownerApprovalRequired: 0,
    dedicated: 24,
    sharedSemantic: 91,
    runtimeState: 11,
    coveragePlaceholder: 0,
    publicReady: 126,
  });
  assert.ok(screenCatalog.every(target => target.publicReady));
  assert.ok(screenCatalog.every(target => target.implementationKind !== "COVERAGE_PLACEHOLDER"));
  assert.deepEqual(screenFamilies.map(family => family.targetCount), [7, 6, 19, 16, 22, 8, 11, 14, 11, 12]);
});

test("every canonical screen has a GitHub-Pages-safe hash route and matching view", () => {
  for (const target of screenCatalog) {
    assert.match(target.route, /^\/[a-z0-9][a-z0-9/-]*$/i, target.screenId);
    assert.equal(normalizeHash(toHashRoute(target.route)), target.route, target.screenId);
    assert.equal(routeToView(target.route), target.view, target.screenId);
  }
  for (const route of Object.values(rootRouteByView)) assert.equal(normalizeHash(toHashRoute(route)), route);
});

test("known-route guard safely replaces unknown family routes", () => {
  for (const target of screenCatalog) assert.equal(isKnownScreenRoute(target.route), true, target.screenId);
  assert.equal(isKnownScreenRoute("/unknown"), false);
  assert.equal(isKnownScreenRoute("/market/unknown"), false);
  assert.equal(isKnownScreenRoute("/security/unknown"), false);
  assert.equal(fallbackRouteForUnknown("/unknown"), "/home");
  assert.equal(fallbackRouteForUnknown("/market/unknown"), "/market");
  assert.equal(fallbackRouteForUnknown("/security/unknown"), "/security");
  assert.equal(isKnownScreenRoute("/internal/screen-map"), false);
  assert.equal(isKnownScreenRoute("/internal/screen-map", true), true);
});

test("append-only inventory has one complete row for every atomic target", async () => {
  const inventory = await readFile(new URL("../docs/CHUDO_DEMO_V2_SCREEN_INVENTORY.md", import.meta.url), "utf8");
  assert.match(inventory, /REFERENCE_BINARY_NOT_AVAILABLE_TO_AGENT=true/);
  assert.match(inventory, /FAMILY_ID \| SCREEN_ID \| REFERENCE_NAME \| CHUDO_NAME \| IMPLEMENTATION_FILE \| COMPONENT_OR_STATE \| ENTRY_PATH \| HASH_ROUTE \| MOBILE_REACHABLE \| TABLET_REACHABLE \| DESKTOP_REACHABLE \| INTERACTION_TESTED \| STATUS \| NOTES/);
  for (const target of screenCatalog) {
    const token = `| ${target.familyId} | ${target.screenId} |`;
    assert.equal(inventory.split(token).length - 1, 1, target.screenId);
    assert.ok(inventory.includes(`| #${target.route} | YES | YES | YES |`), target.screenId);
  }
  assert.match(inventory, /SCREEN_FAMILIES=10\/10/);
  assert.match(inventory, /ATOMIC_TARGETS=126/);
  assert.match(inventory, /ACCOUNTED=126/);
  assert.match(inventory, /OMITTED=0/);
});

test("route controls and history hooks are wired into the app shell", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const required of ["window.history.pushState", "window.history.replaceState", "window.history.back()", 'window.addEventListener("popstate"', 'window.addEventListener("hashchange"', "toHashRoute(normalized)", "isKnownScreenRoute", "fallbackRouteForUnknown", "SemanticRouteScreen"]) {
    assert.ok(source.includes(required), required);
  }
  assert.equal(source.includes("FamilyRouteGrid"), false);
  assert.equal(source.includes("FeatureScreen"), false);
});
