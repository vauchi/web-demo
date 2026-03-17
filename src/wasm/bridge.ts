// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

/// Bridge between SolidJS frontend and vauchi-core WASM module.
///
/// Replaces Tauri IPC calls from the desktop app with direct WASM function calls.

import type { ScreenModel } from "../types/core";

/// Default relay URL — matches all other Vauchi frontends.
const DEFAULT_RELAY_URL = "wss://relay.vauchi.app";

// These will be populated after WASM init
let wasmModule: any = null;

export async function initWasm(relayUrl?: string): Promise<void> {
  const relay = relayUrl ?? DEFAULT_RELAY_URL;
  try {
    const wasm = await import("../../wasm/pkg/vauchi_wasm");
    await wasm.default();
    wasmModule = wasm;
    console.log(`WASM initialized (relay: ${relay})`);
  } catch (e) {
    // Fallback for development without WASM built
    console.warn(`WASM not available — build with: npm run build:wasm`, e);
    wasmModule = null;
  }
}

export function createWorkflow(workflowType: string): number {
  if (!wasmModule) {
    // Return placeholder for development without WASM
    return 0;
  }
  return wasmModule.workflow_create(workflowType);
}

export function getCurrentScreen(handle: number): ScreenModel {
  if (!wasmModule) {
    // Placeholder screen for development
    return {
      screen_id: "placeholder",
      title: "WASM Not Loaded",
      subtitle: "Build WASM module with: npm run build:wasm",
      components: [],
      actions: [],
      progress: null,
    };
  }
  const json = wasmModule.workflow_current_screen(handle);
  return JSON.parse(json);
}

export function handleAction(handle: number, actionJson: string): string {
  if (!wasmModule) return '{"error":"wasm not loaded"}';
  return wasmModule.workflow_handle_action(handle, actionJson);
}

export function destroyWorkflow(handle: number): void {
  if (wasmModule) {
    wasmModule.workflow_destroy(handle);
  }
}
