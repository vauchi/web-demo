// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

/// Thin bridge between SolidJS and Core's generic presentation reducer.

import type {
  PlatformCommand,
  PresentationEvent,
  SurfaceSpec,
} from "../types/presentation";

interface WasmPresentationModule {
  default: () => Promise<unknown>;
  workflow_create: (workflowType: string) => number;
  workflow_initial_commands: (handle: number) => string;
  workflow_dispatch: (handle: number, eventJson: string) => string;
  workflow_destroy: (handle: number) => void;
}

let wasmModule: WasmPresentationModule | null = null;

export async function initWasm(): Promise<boolean> {
  try {
    const wasm = await import(
      "../../wasm/pkg/vauchi_wasm.js"
    ) as WasmPresentationModule;
    await wasm.default();
    wasmModule = wasm;
    return true;
  } catch (error) {
    console.warn(
      "WASM not available — build with: npm run build:wasm",
      error,
    );
    wasmModule = null;
    return false;
  }
}

export function createWorkflow(workflowType: string): number {
  if (!wasmModule) return 0;
  const handle = wasmModule.workflow_create(workflowType);
  if (handle < 0) throw new Error("Core rejected the requested workflow");
  return handle;
}

export function initialCommands(handle: number): PlatformCommand[] {
  if (!wasmModule) return placeholderCommands();
  return parseCommandBatch(wasmModule.workflow_initial_commands(handle));
}

export function dispatch(
  handle: number,
  event: PresentationEvent | Record<string, unknown>,
): PlatformCommand[] {
  if (!wasmModule) throw new Error("WASM is not loaded");
  return parseCommandBatch(
    wasmModule.workflow_dispatch(handle, JSON.stringify(event)),
  );
}

export function destroyWorkflow(handle: number): void {
  wasmModule?.workflow_destroy(handle);
}

function parseCommandBatch(json: string): PlatformCommand[] {
  const value: unknown = JSON.parse(json);
  if (
    typeof value === "object"
    && value !== null
    && "error" in value
  ) {
    throw new Error(String((value as { error: unknown }).error));
  }
  if (!Array.isArray(value)) {
    throw new Error("Core returned an invalid command batch");
  }
  return value as PlatformCommand[];
}

function placeholderCommands(): PlatformCommand[] {
  const surface: SurfaceSpec = {
    surface_id: "placeholder",
    revision: 1,
    title: "WASM Not Loaded",
    subtitle: "Build the module with: npm run build:wasm",
    accessibility_label: "WASM Not Loaded",
    layout: "scroll",
    tokens: {
      spacing_small: 4,
      spacing_medium: 8,
      spacing_large: 16,
      corner_radius: 8,
      minimum_target_size: 44,
    },
    nodes: [],
  };
  return [
    { ReplaceSurface: { surface } },
    {
      SetContextBar: {
        surface_id: surface.surface_id,
        revision: surface.revision,
        bar: {
          back: null,
          navigation: null,
          primary: null,
          secondary: null,
        },
      },
    },
    {
      SetPresentationProfile: {
        profile: {
          window_class: "compact",
          pane_layout: "single",
          primary_surface: surface.surface_id,
          detail_surface: null,
          active_surface: surface.surface_id,
        },
      },
    },
  ];
}
