# Node Proxy Server

This project provides an Express-based proxy server written in TypeScript.

## Scripts

- `pnpm dev` – start the server using ts-node
- `pnpm build` – compile TypeScript to `dist`
- `pnpm start` – run the compiled server

The default port is `3003`.

Requests must include a `target` query parameter with the destination URL. All requests are queued using BullMQ and processed sequentially with at least a one-second delay between jobs.
Cookies are persisted across requests using `tough-cookie`.
