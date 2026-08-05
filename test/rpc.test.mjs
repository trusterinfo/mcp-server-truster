import { test } from "node:test";
import assert from "node:assert/strict";
import { rpc } from "../dist/index.js";

function mockFetch(payload, status = 200) {
  return async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
}

test("rpc unwraps result", async () => {
  const out = await rpc("tools/list", {}, mockFetch({ jsonrpc: "2.0", id: 1, result: { tools: [] } }));
  assert.deepEqual(out, { tools: [] });
});

test("rpc throws on JSON-RPC error", async () => {
  await assert.rejects(
    () => rpc("tools/call", {}, mockFetch({ jsonrpc: "2.0", id: 1, error: { code: -32000, message: "boom" } })),
    /boom/,
  );
});

test("rpc throws on HTTP error", async () => {
  await assert.rejects(() => rpc("tools/list", {}, mockFetch({}, 502)), /HTTP 502/);
});
