<!-- SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me> -->
<!-- SPDX-License-Identifier: GPL-3.0-or-later -->

> **Mirror:** This repo is a read-only mirror of [gitlab.com/vauchi/web-demo](https://gitlab.com/vauchi/web-demo). Please open issues and merge requests there.

[![Pipeline](https://img.shields.io/endpoint?url=https://vauchi.gitlab.io/web-demo/badges/pipeline.json&label=pipeline)](https://gitlab.com/vauchi/web-demo/-/pipelines)
[![REUSE](https://api.reuse.software/badge/gitlab.com/vauchi/web-demo)](https://api.reuse.software/info/gitlab.com/vauchi/web-demo)

> [!NOTE]
> **You're early — and that's the point.** Vauchi is pre-alpha and
> under heavy development: not yet ready for production, and APIs may
> change without notice. If you're here now, you can help shape it —
> try it, break it, and tell us what's missing.

# Vauchi Web Demo

Browser-based demo of Vauchi — living contact cards, exchanged in person.

Built with SolidJS + WASM. Core compiled to
`wasm32-unknown-unknown` with hybrid WebCrypto + RustCrypto
crypto backend.

## Prerequisites

- Node.js 18+
- Rust 1.78+ with `wasm32-unknown-unknown` target
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)

## Build

```bash
npm ci
npm run build:wasm
npm run build
```

## Development

```bash
npm run dev
```

## Architecture

This app implements the core-driven UI contract:

- Core reduces presentation events into ordered command batches.
- A generic SolidJS renderer maps prepared presentation nodes to the DOM.
- A contextual command bar exposes Back, navigation, primary, and secondary
  roles without interpreting domain identifiers.
- Core selects compact, medium, and expanded surface composition from raw
  window facts.
- The WASM bridge exposes only initial commands, event dispatch, and
  lifecycle functions.

Crypto uses hybrid WebCrypto (browser-native for
7/9 primitives) + RustCrypto (ChaCha20-Poly1305, Argon2
compiled to WASM).

## Relay

Connects to `demo.relay.vauchi.app` (1h TTL, 100 user cap, nightly wipe).

## License

GPL-3.0-or-later
