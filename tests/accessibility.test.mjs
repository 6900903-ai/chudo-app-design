import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getContainedFocusIndex } from "../app/ui-contracts.ts";

test("Tab and Shift+Tab containment wraps at dialog boundaries", () => {
  assert.equal(getContainedFocusIndex(3, 4, false), 0);
  assert.equal(getContainedFocusIndex(0, 4, true), 3);
  assert.equal(getContainedFocusIndex(-1, 4, false), 0);
  assert.equal(getContainedFocusIndex(-1, 4, true), 3);
  assert.equal(getContainedFocusIndex(1, 4, false), null);
  assert.equal(getContainedFocusIndex(2, 4, true), null);
  assert.equal(getContainedFocusIndex(0, 0, false), null);
});

test("ModalShell and full call overlay expose required keyboard/focus semantics", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const required of [
    "containTabFocus(event, dialogRef.current)",
    'event.key === "Escape"',
    'role="dialog" aria-modal="true"',
    "previousFocusRef.current?.isConnected",
    "data-autofocus",
    "data-mini-focus",
    "inert={backgroundBlocked}",
    "aria-hidden={backgroundBlocked || undefined}",
    "onMinimizedChange(minimized)",
  ]) assert.ok(source.includes(required), required);
});

test("privacy switch has an accessible name and switch state", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /role="switch"/);
  assert.match(source, /aria-label="Скрывать суммы в демо-интерфейсе"/);
  assert.match(source, /aria-checked=/);
});
