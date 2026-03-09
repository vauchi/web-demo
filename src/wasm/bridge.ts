// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

/// Bridge between SolidJS frontend and vauchi-core WASM module.
///
/// Replaces Tauri IPC calls from the desktop app with direct WASM function calls.

import type { ScreenModel } from "../types/core";

// These will be populated after WASM init
let wasmModule: any = null;

export async function initWasm(): Promise<void> {
  // TODO: Import from wasm-pack generated package
  // const wasm = await import("../../wasm/pkg/vauchi_wasm");
  // await wasm.default();
  // wasmModule = wasm;
  console.log("WASM init placeholder — build with: npm run build:wasm");
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
