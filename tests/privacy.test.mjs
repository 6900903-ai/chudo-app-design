import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { demoData } from "../app/demo-data.ts";
import { formatMinorUnits } from "../app/money.ts";
import { PRIVACY_AMOUNT_MASK, protectUserAmount } from "../app/ui-contracts.ts";

const protectedValues = [
  demoData.portfolio.balanceMinor,
  demoData.portfolio.referenceMinor,
  demoData.portfolio.availableMinor,
  demoData.portfolio.reservedMinor,
  ...demoData.transactions.map(item => item.amountMinor),
  demoData.mining.pendingRewardMinor,
  demoData.mining.paidRewardMinor,
  demoData.mining.currentRewardMinor,
  ...demoData.mining.rewards.map(item => item.amountMinor),
].map(value => formatMinorUnits(value));

test("privacy helper masks every representative personal monetary fixture", () => {
  for (const value of protectedValues) {
    const rendered = protectUserAmount(true, `${value} CHUDO`);
    assert.equal(rendered, PRIVACY_AMOUNT_MASK);
    assert.equal(rendered.includes(value), false, value);
  }
  assert.equal(protectUserAmount(true, "40,00 CHUDO"), PRIVACY_AMOUNT_MASK);
  assert.equal(protectUserAmount(true, "0,002750 BTC"), PRIVACY_AMOUNT_MASK);
});

test("privacy does not alter public market prices unless explicitly requested", () => {
  const publicPrice = formatMinorUnits(demoData.marketPairs[1].priceMinor, demoData.marketPairs[1].quoteDecimals, true);
  assert.notEqual(publicPrice, PRIVACY_AMOUNT_MASK);
  assert.match(publicPrice, /0,0000/);
});

test("all protected UI surfaces use the shared hidden state", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const product = await readFile(new URL("../app/product-screens.tsx", import.meta.url), "utf8");
  const source = `${page}\n${product}`;
  for (const required of [
    "<SendFlow hidden={hiddenBalance}",
    "hidden={hiddenBalance} activeChat={activeChat}",
    "<MiningScreen hidden={hiddenBalance}",
    "<MarketDetails pair={selectedPair} hidden={hidden}",
    "<ProductHomeScreen selectedAssetId={selectedAssetId} hidden={hiddenBalance}",
    "<ProductWalletScreen selectedAssetId={selectedAssetId} hidden={hiddenBalance}",
    "<SwapScreen hidden={hiddenBalance}",
    "<PortfolioSemantic target={target} hidden={hidden}",
    "<ChatSemantic target={target} hidden={hidden}",
    "<MarketSemantic target={target} hidden={hidden}",
    "protectUserAmount(hidden, metric.value)",
    "protectUserAmount(hidden, metric.change)",
    'protectUserAmount(hidden, "128,00 CHUDO")',
    'protectUserAmount(hidden, "250,00 CHUDO")',
    'protectUserAmount(hidden, "295,00 EUR")',
    "const protectedAmount = protectUserAmount(hidden",
    "data-private-amount",
  ]) assert.match(source, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), required);
});
