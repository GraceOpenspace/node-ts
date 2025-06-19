# Node Proxy Server

This project is a simple Express-based proxy server structured according to the Feature‑Sliced Design approach.

## Configuration

The server is configured via environment variables:

- `PORT` – listening port (defaults to `3003`)
- `DESTINATION_SERVERS` – comma separated list of hostnames that require special cookie handling

## Scripts

- `pnpm dev` – start the server using ts-node
- `pnpm build` – compile TypeScript to `dist`
- `pnpm start` – run the compiled server

Requests must include a `target` query parameter with the full destination URL. If the target host is one of the configured destination servers, the proxy will manage cookies using `tough-cookie`.
