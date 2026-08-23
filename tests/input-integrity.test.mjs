import assert from "node:assert/strict";
import test from "node:test";

import {
  DEMO_DECIMAL_SCALES,
  parseMinorUnits,
  PRODUCTION_DECIMAL_SCALE_NOTE,
  sanitizeDecimalInput,
} from "../app/money.ts";

function uiParse(value, decimals = 2) {
  const sanitized = sanitizeDecimalInput(value, decimals);
  return { sanitized, parsed: parseMinorUnits(sanitized, decimals) };
}

test("sanitize plus parse rejects malformed pasted input without reinterpretation", () => {
  for (const value of ["1.2.3", "1e3", "12abc34", "1,2,3", "1.2,3", " 12abc34 "]) {
    const result = uiParse(value);
    assert.equal(result.sanitized, value, value);
    assert.equal(result.parsed, null, value);
  }
});

test("leading decimal separator is explicitly canonicalized", () => {
  assert.deepEqual(uiParse(".5"), { sanitized: "0.5", parsed: 50n });
  assert.deepEqual(uiParse(",5"), { sanitized: "0.5", parsed: 50n });
});

test("valid comma/dot input and exact precision remain BigInt", () => {
  assert.deepEqual(uiParse("0.1"), { sanitized: "0.1", parsed: 10n });
  assert.deepEqual(uiParse("1,25"), { sanitized: "1.25", parsed: 125n });
  assert.deepEqual(uiParse("1.00000000", 8), { sanitized: "1.00000000", parsed: 100000000n });
  assert.deepEqual(uiParse("999999999999999999999999999999.99"), {
    sanitized: "999999999999999999999999999999.99",
    parsed: 99999999999999999999999999999999n,
  });
});

test("excess precision is retained as invalid rather than truncated", () => {
  assert.deepEqual(uiParse("1.234"), { sanitized: "1.234", parsed: null });
});

test("demo and production decimal-scale policy is explicit", () => {
  assert.deepEqual(DEMO_DECIMAL_SCALES, { CHUDO: 2, BTC: 6, EUR: 2, USDT: 2 });
  assert.equal(PRODUCTION_DECIMAL_SCALE_NOTE, "Production note: CHUDO=8, BTC=8, EUR=2, USDT=asset/network-defined.");
});
