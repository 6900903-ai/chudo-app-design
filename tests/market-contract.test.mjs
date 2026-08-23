import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { demoData } from "../app/demo-data.ts";
import { multiplyMinorUnits, parseMinorUnits } from "../app/money.ts";

test("every market pair owns internally consistent detail fixtures", () => {
  assert.deepEqual(demoData.marketPairs.map(pair => pair.id), ["chudo-eur", "chudo-btc", "chudo-usdt"]);
  for (const pair of demoData.marketPairs) {
    assert.equal(Object.keys(pair.detail.chartPaths).sort().join(","), "1d,1h,1m,1w");
    assert.ok(pair.detail.orderBook.asks.length > 0);
    assert.ok(pair.detail.orderBook.bids.length > 0);
    assert.ok(pair.detail.recentTrades.length > 0);
    assert.ok(pair.detail.openOrders.every(order => order.id.startsWith(pair.quote.toLowerCase())));
    for (const order of pair.detail.openOrders) {
      assert.equal(multiplyMinorUnits(BigInt(order.amountMinor), BigInt(order.priceMinor), 2).toString(), order.totalMinor, `${pair.id}:${order.id}`);
    }
  }
});

test("CHUDO/BTC remains BTC-scale and exact for 250.00 by 0.000011", () => {
  const btc = demoData.marketPairs.find(pair => pair.id === "chudo-btc");
  assert.equal(btc.quote, "BTC");
  assert.equal(btc.quoteDecimals, 6);
  assert.equal(parseMinorUnits("0.000011", 6), BigInt(btc.priceMinor));
  assert.equal(multiplyMinorUnits(25000n, BigInt(btc.priceMinor), 2), 2750n);
  assert.ok(btc.detail.orderBook.asks.every(level => BigInt(level.priceMinor) < 100n));
  assert.ok(btc.detail.orderBook.bids.every(level => BigInt(level.priceMinor) < 100n));
  assert.ok(btc.detail.openOrders.every(order => !order.id.includes("eur")));
});

test("market search, filters, chart periods and pair routes are visibly interactive", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const required of ['type MarketFilter = "all" | "eur" | "crypto"', "setFilter(item.id)", "setPeriod(item.id)", "aria-pressed={period === item.id}", "navigateRoute(`/market/${pair.id}`)"]) {
    assert.ok(source.includes(required), required);
  }
});
