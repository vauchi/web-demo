// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm(), solidPlugin()],
  build: {
    target: "esnext",
  },
  test: {
    environment: "node",
    exclude: ["tests/playwright/**", "node_modules/**"],
  },
});
