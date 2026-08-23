import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Chats and Calls expose an obvious local switch and launch actions", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.ok(source.includes('className="chat-call-switch"'));
  assert.ok(source.includes('aria-label="Раздел связи"'));
  assert.ok(source.includes("Аудиозвонок"));
  assert.ok(source.includes("Видеозвонок"));
  assert.ok(source.includes('aria-label="Аудиозвонок"'));
  assert.ok(source.includes('aria-label="Видеозвонок"'));
});

test("every canonical call state is wired to the full call overlay", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const state of ["incoming", "outgoing", "ringing", "connecting", "connected", "reconnecting", "failed", "ended", "minimized"]) {
    assert.ok(source.includes(state), state);
  }
  assert.ok(source.includes("incoming-answer"));
  assert.ok(source.includes("Ответить"));
  assert.ok(source.includes("Отклонить"));
  assert.ok(source.includes("data-screen-id={call.screenId}"));
  assert.equal(source.includes("getUserMedia"), false);
  assert.equal(source.includes("mediaDevices"), false);
});

test("mobile call actions remain full-size at the 390px layout", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.conversation-head > button \{ width:44px; height:44px; \}/);
  assert.match(css, /\.chat-call-switch button \{ min-width:0; \}/);
  assert.match(css, /\.call-row > div button \{ width:44px; height:44px; \}/);
});
