<!-- SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me> -->
<!-- SPDX-License-Identifier: GPL-3.0-or-later -->

> **Mirror:** This repo is a read-only mirror of [gitlab.com/vauchi/web-demo](https://gitlab.com/vauchi/web-demo). Please open issues and merge requests there.

[![Pipeline](https://vauchi.gitlab.io/web-demo/badges/pipeline.svg)](https://gitlab.com/vauchi/web-demo/-/pipelines)
[![REUSE](https://api.reuse.software/badge/gitlab.com/vauchi/web-demo)](https://api.reuse.software/info/gitlab.com/vauchi/web-demo)

> [!WARNING]
> **Pre-Alpha Software** - This project is under heavy development and not ready for production use.
> APIs may change without notice. Use at your own risk.

# Vauchi Web Demo

Browser-based demo of Vauchi — privacy-focused contact card exchange.

Built with SolidJS + WASM. Core compiled to `wasm32-unknown-unknown` with hybrid WebCrypto + RustCrypto crypto backend.

## Prerequisites

- Node.js 18+
- Rust 1.78+ with `wasm32-unknown-unknown` target
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)

## Build

```bash
# Build WASM module
cd wasm && wasm-pack build --target web && cd ..

# Build web app
npm install
npm run build
```

## Development

```bash
npm run dev
```

## Architecture

This app implements the core-driven UI contract:

- **ScreenRenderer** renders `ScreenModel` from core (JSON via WASM bridge)
- **14 SolidJS components** map to core's `Component` enum variants
- **ActionHandler** maps user input to `UserAction` JSON
- **WASM bridge** replaces Tauri IPC with direct `wasm-bindgen` calls

Crypto uses hybrid WebCrypto (browser-native for 7/9 primitives) + RustCrypto (ChaCha20-Poly1305, Argon2 compiled to WASM).

## Relay

Connects to `demo.relay.vauchi.app` (1h TTL, 100 user cap, nightly wipe).

## License

GPL-3.0-or-later
