#!/usr/bin/env node
/**
 * MCP server for truster.info.
 *
 * A thin stdio bridge to the site's native MCP endpoint (https://truster.info/mcp).
 * Tools are discovered from the remote endpoint at startup, so this package never
 * goes out of date when the site adds tools.
 *
 * Env:
 *   TRUSTER_MCP_URL — override the endpoint (default https://truster.info/mcp)
 *   TRUSTER_TOKEN   — optional OAuth bearer token (needed only for write tools
 *                     such as post_review; discovery:
 *                     https://truster.info/.well-known/oauth-protected-resource)
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const ENDPOINT = process.env.TRUSTER_MCP_URL ?? "https://truster.info/mcp";
const TOKEN = process.env.TRUSTER_TOKEN;

let rpcId = 0;

export async function rpc(
  method: string,
  params: unknown,
  fetchImpl: typeof fetch = fetch,
): Promise<unknown> {
  const res = await fetchImpl(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
  });
  if (!res.ok) {
    throw new Error(`truster.info MCP endpoint returned HTTP ${res.status}`);
  }
  const body = (await res.json()) as {
    result?: unknown;
    error?: { code: number; message: string };
  };
  if (body.error) {
    throw new Error(`${body.error.message} (code ${body.error.code})`);
  }
  return body.result;
}

export function createServer(fetchImpl: typeof fetch = fetch): Server {
  const server = new Server(
    { name: "truster", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return (await rpc("tools/list", {}, fetchImpl)) as never;
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    return (await rpc("tools/call", req.params, fetchImpl)) as never;
  });

  return server;
}

const isMain =
  process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop()!);
if (isMain) {
  const server = createServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((err: unknown) => {
    console.error("fatal:", err);
    process.exit(1);
  });
}
