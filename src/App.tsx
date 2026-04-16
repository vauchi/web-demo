// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSignal, onCleanup, onMount, Show, For } from "solid-js";
import { initWasm, createWorkflow, getCurrentScreen, handleAction, destroyWorkflow } from "./wasm/bridge";
import { ScreenRenderer } from "./core-ui/ScreenRenderer";
import type { ScreenModel } from "./types/core";

interface Toast {
  title: string;
  message: string;
}

const WORKFLOWS = [
  { id: "onboarding", label: "Onboarding" },
  { id: "emergency_shred", label: "Emergency Shred" },
  { id: "lock_screen", label: "Lock Screen" },
] as const;

export default function App() {
  const [screen, setScreen] = createSignal<ScreenModel | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [toast, setToast] = createSignal<Toast | null>(null);
  const [activeWorkflow, setActiveWorkflow] = createSignal("onboarding");
  const [wasmReady, setWasmReady] = createSignal(false);
  let workflowHandle: number | null = null;
  let toastTimer: ReturnType<typeof setTimeout> | undefined;

  const startWorkflow = (workflowType: string) => {
    if (workflowHandle !== null) {
      destroyWorkflow(workflowHandle);
    }
    workflowHandle = createWorkflow(workflowType);
    setActiveWorkflow(workflowType);
    setScreen(getCurrentScreen(workflowHandle));
  };

  onMount(async () => {
    try {
      await initWasm();
      setWasmReady(true);
      startWorkflow("onboarding");
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
    clearTimeout(toastTimer);
  });

  const showToast = (t: Toast) => {
    clearTimeout(toastTimer);
    setToast(t);
    toastTimer = setTimeout(() => setToast(null), 4000);
  };

  const onAction = (actionJson: string) => {
    if (workflowHandle === null) return;
    const resultJson = handleAction(workflowHandle, actionJson);
    try {
      const result = JSON.parse(resultJson);
      if (result.error) {
        console.warn("Action error:", result.error);
        return;
      }
      // Handle ActionResult variants
      if (result.ShowAlert) {
        showToast({ title: result.ShowAlert.title, message: result.ShowAlert.message });
      }
      if (result.Complete || result === "Complete") {
        showToast({ title: "Done", message: "Workflow completed." });
      }
      if (result.WipeComplete || result === "WipeComplete") {
        showToast({ title: "Wiped", message: "All data has been erased." });
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
          The web demo is a limited preview — native apps offer the full
          experience including offline support, background sync, hardware
          exchange, and device linking.
        </p>
        <nav class="store-links" aria-label="Download native apps">
          <a href="https://vauchi.app/#ios" target="_blank" rel="noopener noreferrer">iOS</a>
          <a href="https://vauchi.app/#android" target="_blank" rel="noopener noreferrer">Android</a>
          <a href="https://vauchi.app/#desktop" target="_blank" rel="noopener noreferrer">Desktop</a>
        </nav>
        <Show when={wasmReady()}>
          <nav class="workflow-tabs" role="tablist" aria-label="Demo workflows">
            <For each={WORKFLOWS}>
              {(w) => (
                <button
                  role="tab"
                  aria-selected={activeWorkflow() === w.id}
                  class={`workflow-tab ${activeWorkflow() === w.id ? "workflow-tab-active" : ""}`}
                  onClick={() => startWorkflow(w.id)}
                >
                  {w.label}
                </button>
              )}
            </For>
          </nav>
        </Show>
      </header>
      <main>
        <Show when={!loading()} fallback={<div class="loading-container"><div class="spinner" /><span>Loading WASM module...</span></div>}>
          <Show when={!error()} fallback={<p class="error" role="alert">{error()}</p>}>
            <Show when={screen()}>
              {(s) => <ScreenRenderer screen={s()} onAction={onAction} />}
            </Show>
          </Show>
        </Show>
      </main>
      <div class="toast-region" aria-live="polite" aria-atomic="true">
        <Show when={toast()}>
          {(t) => (
            <div class="toast">
              <strong>{t().title}</strong>
              <span>{t().message}</span>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}
