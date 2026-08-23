import assert from "node:assert/strict";
import test from "node:test";

import { formatMinorUnits, multiplyMinorUnits, parseMinorUnits } from "../app/money.ts";

test("parseMinorUnits accepts exact decimal input without floating point", () => {
  assert.equal(parseMinorUnits("0.1"), 10n);
  assert.equal(parseMinorUnits("1,25"), 125n);
  assert.equal(parseMinorUnits("1.00000000", 8), 100000000n);
});

test("parseMinorUnits rejects unsafe and over-precise input", () => {
  for (const value of ["1.234", "", ".", ",", "-1", "1e3", "1.2.3", "1,2,3", "1.2,3", "1.,2"]) {
    assert.equal(parseMinorUnits(value), null, value);
  }
});

test("parseMinorUnits preserves very large exact values", () => {
  assert.equal(
    parseMinorUnits("999999999999999999999999999999.99"),
    99999999999999999999999999999999n,
  );
});

test("formatMinorUnits formats negative values", () => {
  assert.equal(formatMinorUnits(-123456n), "−1 234,56");
});

test("250.00 CHUDO multiplied by 0.000011 BTC stays exact", () => {
  const amount = parseMinorUnits("250.00", 2);
  const price = parseMinorUnits("0.000011", 6);
  assert.notEqual(amount, null);
  assert.notEqual(price, null);
  const total = multiplyMinorUnits(amount, price, 2);
  assert.equal(total, 2750n);
  assert.equal(formatMinorUnits(total, 6), "0,002750");
});
