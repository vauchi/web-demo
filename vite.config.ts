// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { resolve } from "node:path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm(), solidPlugin()],
  build: {
    target: "esnext",
    rollupOptions: {
      // catalog.html is the wasm-free screen-catalog render entry used by
      // tests/playwright/catalog.spec.ts; it shares nothing with index
      // beyond the presentation components.
      input: {
        main: resolve(__dirname, "index.html"),
        catalog: resolve(__dirname, "catalog.html"),
      },
    },
  },
  test: {
    environment: "node",
    exclude: ["tests/playwright/**", "node_modules/**"],
  },
});
