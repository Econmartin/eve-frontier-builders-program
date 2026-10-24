import { test } from "node:test";
import assert from "node:assert/strict";
import { validateU64 } from "./u64.mjs";
import {
  constantNames,
  initialConnections,
  valueConnection,
  executionConnection,
  connectValue,
  connectionError,
  disconnectValue,
  traceExecutionFlow,
} from "./connections.mjs";
import { formatSource, correspondingLines } from "./source.mjs";

const values = { CONSTANT_A: "10", CONSTANT_B: "40" };

const defaultExecEdges = [
  executionConnection("start", "require"),
  executionConnection("require", "transfer"),
  executionConnection("transfer", "complete"),
];

test("u64 boundaries and exact precision", () => {
  for (const text of ["0", "1", "9007199254740993", "18446744073709551615"]) {
    assert.deepEqual(validateU64(text), { literal: text, error: null });
  }
  assert.ok(validateU64("18446744073709551616").error);
  assert.ok(validateU64("9".repeat(1000)).error);
});

test("normalise surrounding whitespace and leading zeros, never mutate text", () => {
  const text = " 00042 ";
  assert.equal(validateU64(text).literal, "42");
  assert.equal(text, " 00042 ");
  assert.equal(validateU64("000").literal, "0");
  assert.equal(validateU64("0".repeat(1000) + "42").literal, "42");
  for (const invalid of ["", "   ", "-1", "+42", "1.2", "1e3", "0xff", "1_000", "４２", "1 2", "abc"]) {
    assert.ok(validateU64(invalid).error, JSON.stringify(invalid));
  }
});

test("start with complete execution chain and independent fixed-name constants", () => {
  const initial = initialConnections();
  assert.deepEqual(
    initial.filter(edge => edge.targetHandle === "quantity").map(edge => edge.source),
    constantNames
  );
  assert.deepEqual(traceExecutionFlow(initial), {
    steps: ["start", "require", "transfer", "complete"],
    error: null,
  });
});

test("u64 fan-out retains one shared source and rejects duplicate/occupied inputs", () => {
  const first = connectValue(defaultExecEdges, valueConnection("CONSTANT_A", "require"));
  const shared = connectValue(first.edges, valueConnection("CONSTANT_A", "transfer"));
  assert.equal(shared.error, null);
  assert.equal(shared.edges.filter(edge => edge.targetHandle === "quantity").length, 2);
  assert.ok(connectionError(valueConnection("CONSTANT_A", "require"), shared.edges)?.includes("already exists"));
  const occupied = connectValue(shared.edges, valueConnection("CONSTANT_B", "require"));
  assert.match(occupied.error ?? "", /Disconnect/);
  assert.equal(occupied.edges, shared.edges);
});

test("reject invalid directions, execution/value type mismatches, branching Request, and cycles", () => {
  const edges = initialConnections();
  for (const connection of [
    valueConnection("require", "CONSTANT_A"),
    valueConnection("CONSTANT_A", "CONSTANT_B"),
    valueConnection("UNKNOWN", "require"),
    valueConnection("CONSTANT_A", "start"),
    { ...valueConnection("CONSTANT_A", "require"), sourceHandle: "exec-out" },
    { ...valueConnection("CONSTANT_A", "require"), targetHandle: "exec-in" },
    { ...executionConnection("start", "require"), targetHandle: "quantity" },
    { ...ValueOrExec("CONSTANT_A", "require", "bool", "quantity") },
    { ...ValueOrExec("CONSTANT_A", "require", "value", null) },
    executionConnection("require", "require"),
  ]) {
    assert.ok(connectionError(connection, []), JSON.stringify(connection));
    assert.equal(connectValue(edges, connection).edges, edges);
  }

  // Linear Request cannot branch from one exec-out to two targets, nor form a cycle
  const partialExec = [executionConnection("start", "require")];
  assert.match(connectionError(executionConnection("start", "transfer"), partialExec) ?? "", /Linear Request cannot branch/);
  assert.match(connectionError(executionConnection("require", "start"), partialExec) ?? "", /choose a valid input|cycle/i);
  const twoStepExec = [executionConnection("start", "require"), executionConnection("require", "transfer")];
  assert.match(connectionError(executionConnection("transfer", "require"), twoStepExec) ?? "", /cycle/i);
});

function ValueOrExec(source, target, sourceHandle, targetHandle) {
  return { source, target, sourceHandle, targetHandle };
}

test("disconnect removes only chosen input and never substitutes a default", () => {
  const initial = initialConnections();
  const remaining = disconnectValue(initial, "require", "quantity");
  assert.equal(remaining.length, initial.length - 1);
  assert.deepEqual(formatSource(values, remaining).lines, []);
  assert.match(formatSource(values, remaining).errors.join(" "), /require quantity/);
});

test("disconnecting execution flow withholds source until Request reaches Complete Request", () => {
  const initial = initialConnections();
  const brokenExec = disconnectValue(initial, "complete", "exec-in");
  const source = formatSource(values, brokenExec);
  assert.deepEqual(source.lines, []);
  assert.match(source.errors.join(" "), /Execution flow incomplete/);
});

test("rewiring execution flow reorders emitted Move statements", () => {
  const swapped = [
    executionConnection("start", "transfer"),
    executionConnection("transfer", "require"),
    executionConnection("require", "complete"),
    valueConnection("CONSTANT_A", "require"),
    valueConnection("CONSTANT_B", "transfer"),
  ];
  const source = formatSource(values, swapped);
  assert.equal(source.errors.length, 0);
  const text = source.lines.map(line => line.text).join("\n");
  const transferIndex = text.indexOf("inventory::transfer_item(&mut req, EU_40, CONSTANT_B);");
  const requireIndex = text.indexOf("inventory::require_item(&mut req, FERAL_DATA, CONSTANT_A);");
  assert.ok(transferIndex > 0 && requireIndex > transferIndex);
});

test("invalid text preserves wiring and cannot prevent otherwise valid new wiring", () => {
  const invalid = { ...values, CONSTANT_A: "-1" };
  const existing = [...defaultExecEdges, valueConnection("CONSTANT_A", "require")];
  const result = connectValue(existing, valueConnection("CONSTANT_A", "transfer"));
  assert.equal(result.error, null);
  assert.equal(result.edges.length, existing.length + 1);
  assert.equal(formatSource(invalid, result.edges).lines.length, 0);
  assert.match(formatSource(invalid, result.edges).errors.join(" "), /CONSTANT_A/);
});

test("one declaration, multiple uses, and source correspondence for all Move/SDK primitives", () => {
  const shared = [
    ...defaultExecEdges,
    valueConnection("CONSTANT_A", "require"),
    valueConnection("CONSTANT_A", "transfer"),
  ];
  const source = formatSource(values, shared);
  const text = source.lines.map(line => line.text).join("\n");
  assert.equal(source.errors.length, 0);
  assert.equal((text.match(/const CONSTANT_A:/g) ?? []).length, 1);
  assert.match(text, /const CONSTANT_B: u64 = 40;/);
  assert.match(text, /inventory::require_item\(&mut req, FERAL_DATA, CONSTANT_A\);/);
  assert.match(text, /inventory::transfer_item\(&mut req, EU_40, CONSTANT_A\);/);
  assert.deepEqual(correspondingLines(source.lines, "CONSTANT_A"), [2, 7, 8]);
  assert.deepEqual(correspondingLines(source.lines, "CONSTANT_B"), [3]);
  assert.deepEqual(correspondingLines(source.lines, "start"), [6]);
  assert.deepEqual(correspondingLines(source.lines, "require"), [7]);
  assert.deepEqual(correspondingLines(source.lines, "transfer"), [8]);
  assert.deepEqual(correspondingLines(source.lines, "complete"), [9]);
});

test("unused invalid constant blocks source, valid edits update declaration only", () => {
  const shared = [
    ...defaultExecEdges,
    valueConnection("CONSTANT_A", "require"),
    valueConnection("CONSTANT_A", "transfer"),
  ];
  const blocked = formatSource({ ...values, CONSTANT_B: "not a number" }, shared);
  assert.deepEqual(blocked.lines, []);
  assert.match(blocked.errors.join(" "), /CONSTANT_B/);
  const before = formatSource(values, shared).lines;
  const after = formatSource({ ...values, CONSTANT_A: " 00042 " }, shared).lines;
  assert.equal(after[1].text, "    const CONSTANT_A: u64 = 42;");
  assert.deepEqual(before.filter((_, i) => i !== 1), after.filter((_, i) => i !== 1));
});

test("layout metadata cannot change source", () => {
  const before = initialConnections();
  const moved = before.map(edge => ({ ...edge, position: { x: 999, y: -50 } }));
  assert.deepEqual(formatSource(values, before), formatSource(values, moved));
});

test("invalid and incomplete preview reports every blocker and no stale snippet", () => {
  const source = formatSource({ CONSTANT_A: "", CONSTANT_B: "-1" }, []);
  assert.equal(source.errors.length, 5);
  assert.deepEqual(source.lines, []);
});
