// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSignal, onCleanup, onMount, Show } from "solid-js";
import { initWasm, createWorkflow, getCurrentScreen, handleAction, destroyWorkflow } from "./wasm/bridge";
import { ScreenRenderer } from "./core-ui/ScreenRenderer";
import type { ScreenModel } from "./types/core";

export default function App() {
  const [screen, setScreen] = createSignal<ScreenModel | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  let workflowHandle: number | null = null;

  onMount(async () => {
    try {
      await initWasm();
      workflowHandle = createWorkflow("onboarding");
      const screenData = getCurrentScreen(workflowHandle);
      setScreen(screenData);
    } catch (e) {
      setError(`Failed to initialize: ${e}`);
    } finally {
      setLoading(false);
    }
  });

  onCleanup(() => {
    if (workflowHandle !== null) {
      destroyWorkflow(workflowHandle);
      workflowHandle = null;
    }
  });

  const onAction = (actionJson: string) => {
    if (workflowHandle === null) return;
    const resultJson = handleAction(workflowHandle, actionJson);
    try {
      const result = JSON.parse(resultJson);
      if (result.error) {
        console.warn("Action error:", result.error);
      }
    } catch {
      // Non-JSON response — ignore
    }
    const updated = getCurrentScreen(workflowHandle);
    setScreen(updated);
  };

  return (
    <div class="app">
      <header class="app-header">
        <h1>Vauchi Demo</h1>
        <p class="demo-notice">
          This is a sandboxed demo. Data is wiped every hour.
        </p>
      </header>
      <main>
        <Show when={!loading()} fallback={<div class="loading-container"><div class="spinner" /><span>Loading WASM module...</span></div>}>
          <Show when={!error()} fallback={<p class="error">{error()}</p>}>
            <Show when={screen()}>
              {(s) => <ScreenRenderer screen={s()} onAction={onAction} />}
            </Show>
          </Show>
        </Show>
      </main>
    </div>
  );
}
