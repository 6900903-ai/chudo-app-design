import assert from "node:assert/strict";
import test from "node:test";

import { createCallStateMachine } from "../app/demo-data.ts";

function createFakeScheduler() {
  let now = 0;
  let nextId = 1;
  const pending = new Map();

  return {
    scheduler: {
      setTimeout(callback, delay) {
        const id = nextId++;
        pending.set(id, { callback, at: now + delay });
        return id;
      },
      clearTimeout(id) {
        pending.delete(id);
      },
    },
    tick(milliseconds) {
      const target = now + milliseconds;
      while (true) {
        const next = [...pending.entries()]
          .filter(([, task]) => task.at <= target)
          .sort((left, right) => left[1].at - right[1].at || left[0] - right[0])[0];
        if (!next) break;
        const [id, task] = next;
        pending.delete(id);
        now = task.at;
        task.callback();
      }
      now = target;
    },
    pendingCount() {
      return pending.size;
    },
  };
}

test("early hangup is terminal and clears every phase timer", () => {
  const fake = createFakeScheduler();
  const states = [];
  const machine = createCallStateMachine(state => states.push(state), fake.scheduler);
  machine.start();
  fake.tick(200);
  machine.hangup();
  fake.tick(5000);
  assert.deepEqual(states, ["calling", "ended"]);
  assert.equal(machine.getState(), "ended");
  assert.equal(fake.pendingCount(), 0);
});

test("reconnect followed by failure cannot be revived by a stale timer", () => {
  const fake = createFakeScheduler();
  const states = [];
  const machine = createCallStateMachine(state => states.push(state), fake.scheduler);
  machine.start();
  fake.tick(2400);
  machine.reconnect();
  fake.tick(400);
  machine.fail();
  fake.tick(5000);
  assert.equal(states.at(-1), "failed");
  assert.equal(machine.getState(), "failed");
  assert.equal(fake.pendingCount(), 0);
});

test("close during connect clears timers and emits no later state", () => {
  const fake = createFakeScheduler();
  const states = [];
  const machine = createCallStateMachine(state => states.push(state), fake.scheduler);
  machine.start();
  fake.tick(1600);
  machine.close();
  const stateAtClose = states.at(-1);
  fake.tick(5000);
  assert.equal(states.at(-1), stateAtClose);
  assert.equal(fake.pendingCount(), 0);
});

test("retry owns one lifecycle and hangup keeps ENDED terminal", () => {
  const fake = createFakeScheduler();
  const states = [];
  const machine = createCallStateMachine(state => states.push(state), fake.scheduler);
  machine.start();
  fake.tick(2400);
  machine.reconnect();
  machine.fail();
  machine.retry();
  fake.tick(1200);
  assert.equal(machine.getState(), "connected");
  machine.reconnect();
  machine.fail();
  machine.retry();
  fake.tick(300);
  machine.hangup();
  fake.tick(5000);
  assert.equal(states.at(-1), "ended");
  assert.equal(machine.getState(), "ended");
  assert.equal(fake.pendingCount(), 0);
});

test("ended remains terminal after more than 3.5 seconds", () => {
  const fake = createFakeScheduler();
  const states = [];
  const machine = createCallStateMachine(state => states.push(state), fake.scheduler);
  machine.start();
  fake.tick(2400);
  machine.hangup();
  fake.tick(3501);
  machine.retry();
  machine.reconnect();
  fake.tick(5000);
  assert.equal(machine.getState(), "ended");
  assert.equal(states.at(-1), "ended");
  assert.equal(states.filter(state => state === "ended").length, 1);
  assert.equal(fake.pendingCount(), 0);
});

test("direct ended runtime state is terminal before any timer is scheduled", () => {
  const fake = createFakeScheduler();
  const states = [];
  const machine = createCallStateMachine(state => states.push(state), fake.scheduler);
  machine.setInitialState("ended");
  machine.start();
  machine.retry();
  machine.reconnect();
  fake.tick(5000);
  assert.deepEqual(states, ["ended"]);
  assert.equal(machine.getState(), "ended");
  assert.equal(fake.pendingCount(), 0);
});

test("incoming answer owns one connecting lifecycle", () => {
  const fake = createFakeScheduler();
  const states = [];
  const machine = createCallStateMachine(state => states.push(state), fake.scheduler);
  machine.setInitialState("ringing");
  machine.answer();
  assert.equal(fake.pendingCount(), 1);
  fake.tick(900);
  assert.deepEqual(states, ["ringing", "connecting", "connected"]);
  assert.equal(machine.getState(), "connected");
  assert.equal(fake.pendingCount(), 0);
});
