import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { screenImplementationRegistry } from "../app/screen-implementation-registry.ts";

const walletRoutes = [
  "/wallet", "/wallet/balance", "/wallet/assets", "/wallet/chudo", "/wallet/chudo/chart",
  "/wallet/transactions", "/wallet/transaction/tx-received-128", "/wallet/send",
  "/wallet/send/validation", "/wallet/send/review", "/wallet/send/confirmation",
  "/wallet/send/receipt", "/wallet/receive", "/wallet/receive/qr", "/wallet/scan",
  "/wallet/send/recipient",
];

test("chat list, search, filters and conversation keep exact route semantics", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.ok(source.includes('const mobileDetail = route === "/chats/yuri"'));
  assert.equal(source.includes('const mobileDetail = route !== "/chats"'), false);
  assert.ok(source.includes('data-chat-list-visible="true"'));
  assert.ok(source.includes('autoFocus={searchMode}'));
  for (const [route, key] of [["/chats", "chats"], ["/chats/search", "chats-search"], ["/chats/filters", "chats-filters"], ["/chats/yuri", "chats-yuri"]]) {
    const item = screenImplementationRegistry.find(entry => entry.route === route);
    assert.equal(item?.semanticKey, key, route);
  }
});

test("attachment action sheet, preview and payment are three separate states", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  for (const evidence of [
    'target.semanticKey === "chats-yuri-attachments"', 'data-chat-state="attachment-sheet"',
    ">Фото<", ">Файл<", ">Demo payment<", "Закрыть и вернуться",
    'target.semanticKey === "chats-yuri-attachment-preview"', 'data-chat-state="attachment-preview"',
    "Предпросмотр демонстрационного файла", 'target.semanticKey === "chats-yuri-payment"',
    'data-chat-state="payment"',
  ]) assert.ok(source.includes(evidence), evidence);
});

test("all 16 wallet targets have canonical identities and exact dispatcher branches", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  for (const route of walletRoutes) assert.ok(screenImplementationRegistry.some(entry => entry.route === route), route);
  for (const route of walletRoutes.slice(1)) assert.ok(source.includes(`case "${route}"`), route);
  const dispatcher = source.slice(source.indexOf("switch (route)"), source.indexOf('return <div className="page v3-wallet-route"'));
  assert.ok(dispatcher.indexOf('case "/wallet/send/recipient"') < dispatcher.indexOf("default:"));
  assert.ok(source.includes('qrPrimary/>'));
  assert.ok(source.includes('data-wallet-state="transaction-detail"'));
  assert.ok(source.includes('data-wallet-state="send-validation"'));
});

test("market routes expose distinct discovery, chart, trade and record states", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  for (const state of ["search", "filters", "pair-detail", "chart", "periods", "review", "confirmation", "receipt", "order-detail", "order-cancel", "history", "history-detail"]) {
    assert.ok(source.includes(`\"${state}\"`) || source.includes(`${state}`), state);
  }
  assert.ok(source.includes('target.semanticKey === "market-chudo-eur-buy"'));
  assert.ok(source.includes('target.semanticKey === "market-chudo-eur-sell"'));
  assert.ok(source.includes("setPeriod(item)"));
  assert.ok(source.includes("setFilter(id)"));
  assert.ok(source.includes("tradeAmountMinor * BigInt(pair.priceMinor) / 100000000n"));
  assert.equal(source.includes("parseFloat"), false);
});

test("reward, session and trusted-contact detail screens render one record", async () => {
  const source = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  for (const evidence of ['data-mining-state="reward-detail"', 'data-security-state="session-detail"', 'data-security-state="trusted-contact-detail"', "SINGLE RECORD", "SINGLE LOCAL RECORD", "SINGLE LOCAL CONTACT"]) {
    assert.ok(source.includes(evidence), evidence);
  }
});

test("mobile conversation owns its viewport and keeps composer outside message scrolling", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.chats-page \{ height:100%; min-height:0; display:flex; flex-direction:column; overflow:hidden;/);
  assert.match(css, /\.chats-page \.messages \{ min-height:0; overflow-y:auto;/);
  assert.match(css, /\.chats-page \.composer \{ position:relative; z-index:2;/);
});
