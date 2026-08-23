import assert from "node:assert/strict";
import test from "node:test";

import { replaceOwnedTimeout } from "../app/ui-contracts.ts";

test("replacing a toast owns one timer and an older timeout cannot clear the newer toast", () => {
  let nextId = 1;
  const callbacks = new Map();
  const cleared = [];
  const schedule = callback => {
    const id = nextId++;
    callbacks.set(id, callback);
    return id;
  };
  const clear = id => {
    cleared.push(id);
    callbacks.delete(id);
  };
  let visible = "first";
  let timer = replaceOwnedTimeout(null, clear, schedule, () => { visible = ""; }, 1000);
  const firstTimer = timer;
  visible = "second";
  timer = replaceOwnedTimeout(timer, clear, schedule, () => { visible = ""; }, 1000);
  assert.deepEqual(cleared, [firstTimer]);
  assert.equal(callbacks.has(firstTimer), false);
  callbacks.get(firstTimer)?.();
  assert.equal(visible, "second");
  callbacks.get(timer)?.();
  assert.equal(visible, "");
});
