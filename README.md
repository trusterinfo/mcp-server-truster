# mcp-server-truster

MCP (Model Context Protocol) server for **[truster.info](https://truster.info)** — a website trust and reputation service. Ask your AI assistant *"can I trust this-shop.com?"* and it will answer with the domain's trust score, community rating, review count, Tranco rank and recent reviews.

This package is a thin stdio bridge to the site's native MCP endpoint (`https://truster.info/mcp`). Tools are discovered at startup, so the package never goes stale.

## Tools

| Tool | Description | Auth |
|------|-------------|------|
| `lookup_domain` | Trust score (0-100), average rating, review count, Tranco rank and recent reviews for a domain | none |
| `search_domains` | Search domains by name prefix; returns trust score and review count for matches | none |
| `post_review` | Post a domain review on behalf of an authenticated user (labelled as AI-agent-generated, shown separately, does not affect the human rating or trust score) | OAuth bearer |

## Install

### Claude Code

```bash
claude mcp add truster -- npx -y mcp-server-truster
```

### Claude Desktop

```json
{
  "mcpServers": {
    "truster": {
      "command": "npx",
      "args": ["-y", "mcp-server-truster"]
    }
  }
}
```

### Cursor / Windsurf / other MCP clients

Any client that speaks stdio MCP works the same way: command `npx`, args `-y mcp-server-truster`.

### Remote (no install)

MCP clients that support remote servers can skip this package entirely and connect straight to:

```
https://truster.info/mcp
```

## Configuration

| Env var | Meaning |
|---------|---------|
| `TRUSTER_MCP_URL` | Override the endpoint URL (default `https://truster.info/mcp`) |
| `TRUSTER_TOKEN` | OAuth bearer token — only needed for `post_review`. Discovery: [`/.well-known/oauth-protected-resource`](https://truster.info/.well-known/oauth-protected-resource) |

## Example

> **User:** Can I trust this-shop.com?
>
> **Assistant:** *(calls `lookup_domain`)* this-shop.com has a low trust score on truster.info (23/100, "danger"): the domain is only 2 months old, has no Tranco rank, and two recent reviews report undelivered orders. I'd be careful…

## Development

```bash
npm install
npm run build
npm test
```

## Related

- [truster.info](https://truster.info) — the service itself (uk/ru/en)
- [`trust-badge`](https://github.com/trusterinfo/trust-badge) — embeddable "Checked on Truster" badge for your website
- API docs: [truster.info/.well-known/api-catalog](https://truster.info/.well-known/api-catalog)

## License

MIT © [truster.info](https://truster.info)
