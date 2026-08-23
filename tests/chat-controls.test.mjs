import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { demoData } from "../app/demo-data.ts";
import { filterDemoChats } from "../app/ui-contracts.ts";

test("chat search and filters operate locally against fixed demoData", () => {
  assert.deepEqual(filterDemoChats(demoData.chats, "юрий", "all").map(chat => chat.id), ["yuri"]);
  assert.ok(filterDemoChats(demoData.chats, "", "unread").every(chat => chat.unread > 0));
  assert.ok(filterDemoChats(demoData.chats, "", "contacts").every(chat => chat.id !== "community"));
  assert.deepEqual(filterDemoChats(demoData.chats, "несуществующий", "all"), []);
});

test("chat controls expose selected state and attachment navigation", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.ok(source.includes("chats.map"));
  assert.ok(source.includes("aria-pressed={filter === item.id}"));
  assert.ok(source.includes('navigateRoute("/chats/yuri/attachments")'));
  assert.ok(source.includes("chat-empty"));
});
