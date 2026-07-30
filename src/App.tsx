// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
import { ContextCommandBar } from "./presentation/ContextCommandBar";
import {
  actionActivated,
  backRequested,
  environmentChanged,
  overlayDismissed,
  surfaceActivated,
} from "./presentation/events";
import { PresentationOverlay } from "./presentation/PresentationOverlay";
import { visibleSurfaceIds } from "./presentation/selectors";
import {
  applyPresentationCommands,
  emptyPresentationState,
  type PresentationState,
} from "./presentation/state";
import { PresentationSurface } from "./presentation/PresentationSurface";
import type {
  ActionSpec,
  PlatformCommand,
  PresentationEvent,
} from "./types/presentation";
import {
  createWorkflow,
  destroyWorkflow,
  dispatch,
  initialCommands,
  initWasm,
} from "./wasm/bridge";

interface Toast {
  message: string;
}

const hasVariant = (
  command: PlatformCommand,
  variant: string,
): boolean => (
  typeof command === "object"
  && command !== null
  && variant in command
);

export default function App() {
  const [state, setState] = createSignal<PresentationState>(
    emptyPresentationState(),
  );
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [toast, setToast] = createSignal<Toast | null>(null);
  const [reducedMotion, setReducedMotion] = createSignal(false);
  let workflowHandle: number | null = null;
  let coreAvailable = false;
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  let environmentFrame: number | undefined;
  let motionQuery: MediaQueryList | undefined;
  let overlayReturnFocusId: string | null = null;

  const surfaceIds = createMemo(() => visibleSurfaceIds(
    state().profile,
    Object.keys(state().surfaces),
  ));
  const activeSurfaceId = createMemo(() => (
    state().profile?.active_surface ?? surfaceIds()[0] ?? null
  ));
  const activeBar = createMemo(() => {
    const surfaceId = activeSurfaceId();
    return surfaceId ? state().bars[surfaceId]?.bar ?? null : null;
  });

  const showToast = (message: string) => {
    clearTimeout(toastTimer);
    setToast({ message });
    toastTimer = setTimeout(() => setToast(null), 4000);
  };

  const applyCommands = (commands: PlatformCommand[]) => {
    const focusedId = document.activeElement
      ?.getAttribute("data-presentation-id");
    const result = applyPresentationCommands(state(), commands);
    if (!result.ok) {
      setError(`Core presentation transaction rejected: ${result.error}`);
      return;
    }
    if (!state().overlay && result.state.overlay) {
      overlayReturnFocusId = focusedId ?? null;
    }
    setState(result.state);
    for (const effect of result.effects) runEffect(effect);
    if (focusedId && !result.state.overlay) {
      queueMicrotask(() => {
        document.querySelector<HTMLElement>(
          `[data-presentation-id="${CSS.escape(focusedId)}"]`,
        )?.focus();
      });
    }
  };

  const send = (
    event: PresentationEvent | Record<string, unknown>,
  ) => {
    if (!coreAvailable || workflowHandle === null) return;
    try {
      applyCommands(dispatch(workflowHandle, event));
    } catch (caught) {
      setError(`Core event rejected: ${String(caught)}`);
    }
  };

  const surfaceForEvent = (
    event: PresentationEvent,
  ): string | null => {
    if ("SurfaceActivated" in event) return null;
    const value = Object.values(event)[0] as { surface_id?: string };
    return value.surface_id ?? null;
  };

  const sendInteractive = (event: PresentationEvent) => {
    const surfaceId = surfaceForEvent(event);
    if (surfaceId) send(surfaceActivated(surfaceId));
    send(event);
  };

  const restoreOverlayFocus = () => {
    const presentationId = overlayReturnFocusId;
    overlayReturnFocusId = null;
    if (!presentationId) return;
    queueMicrotask(() => document.querySelector<HTMLElement>(
      `[data-presentation-id="${CSS.escape(presentationId)}"]`,
    )?.focus());
  };

  const dismissOverlay = () => {
    const overlay = state().overlay;
    if (!overlay) return;
    setState({ ...state(), overlay: null });
    send(overlayDismissed(overlay.surface_id, overlay.overlay.kind));
    restoreOverlayFocus();
  };

  const selectOverlayAction = (event: PresentationEvent) => {
    setState({ ...state(), overlay: null });
    sendInteractive(event);
    restoreOverlayFocus();
  };

  const startDemo = () => {
    if (workflowHandle !== null) destroyWorkflow(workflowHandle);
    workflowHandle = createWorkflow("onboarding");
    applyCommands(initialCommands(workflowHandle));
  };

  const reportEnvironment = () => {
    if (!coreAvailable) return;
    cancelAnimationFrame(environmentFrame ?? 0);
    environmentFrame = requestAnimationFrame(() => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const fine = window.matchMedia("(pointer: fine)").matches;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      setReducedMotion(motion);
      send(environmentChanged(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
        [
          ...(coarse ? ["touch" as const] : []),
          ...(fine ? ["pointer" as const] : []),
          "keyboard",
        ],
        motion,
      ));
    });
  };

  const activateShortcut = (action: ActionSpec | null | undefined) => {
    const surfaceId = activeSurfaceId();
    if (!surfaceId || !action?.enabled) return;
    sendInteractive(actionActivated(surfaceId, action.interaction_id));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const bar = activeBar();
    if (event.key === "Escape") {
      event.preventDefault();
      if (state().overlay) {
        dismissOverlay();
      } else {
        const surfaceId = activeSurfaceId();
        if (surfaceId) sendInteractive(backRequested(surfaceId));
      }
      return;
    }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      activateShortcut(bar?.navigation);
    } else if (
      (event.metaKey || event.ctrlKey)
      && event.key === "Enter"
    ) {
      event.preventDefault();
      activateShortcut(bar?.primary);
    } else if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      activateShortcut(bar?.secondary);
    } else if (
      (event.metaKey || event.ctrlKey)
      && event.key.toLowerCase() === "z"
      && bar?.primary?.shortcut === "undo"
    ) {
      event.preventDefault();
      activateShortcut(bar.primary);
    }
  };

  const runEffect = (command: PlatformCommand) => {
    if (hasVariant(command, "ShowToast")) {
      const value = (command as {
        ShowToast: { toast: { message: string } };
      }).ShowToast;
      showToast(value.toast.message);
    } else if (hasVariant(command, "PresentAlert")) {
      const value = (command as {
        PresentAlert: { alert: { title: string; message: string } };
      }).PresentAlert.alert;
      window.alert(`${value.title}\n\n${value.message}`);
    } else if (hasVariant(command, "OpenExternalUrl")) {
      const { url } = (command as {
        OpenExternalUrl: { url: string };
      }).OpenExternalUrl;
      window.open(url, "_blank", "noopener,noreferrer");
    } else if (hasVariant(command, "ExportFile")) {
      exportFile((command as { ExportFile: { file: unknown } }).ExportFile.file);
    } else if (hasVariant(command, "QrRequestScan")) {
      send({
        HardwareUnavailable: { transport: "camera" },
      });
    } else if (command === "ResetApplication") {
      startDemo();
    } else if (hasVariant(command, "PostNotification")) {
      postNotification(
        (command as { PostNotification: { notification: unknown } })
          .PostNotification.notification,
      );
    }
  };

  onMount(async () => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", reportEnvironment);
    motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", reportEnvironment);
    try {
      coreAvailable = await initWasm();
      startDemo();
      reportEnvironment();
    } catch (caught) {
      setError(`Failed to initialize: ${String(caught)}`);
    } finally {
      setLoading(false);
    }
  });

  onCleanup(() => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", reportEnvironment);
    motionQuery?.removeEventListener("change", reportEnvironment);
    cancelAnimationFrame(environmentFrame ?? 0);
    if (workflowHandle !== null) destroyWorkflow(workflowHandle);
    clearTimeout(toastTimer);
  });

  return (
    <div
      class="app"
      data-window-class={state().profile?.window_class ?? "compact"}
      data-pane-layout={state().profile?.pane_layout ?? "single"}
      data-reduced-motion={reducedMotion()}
    >
      <header class="app-header">
        <h1>Vauchi Demo</h1>
        <p>Sandboxed preview; Core prepares every visible control.</p>
      </header>
      <main class="presentation-workspace">
        <Show
          when={!loading()}
          fallback={
            <div class="loading-container">
              <div class="spinner" />
              <span>Loading Core…</span>
            </div>
          }
        >
          <Show
            when={!error()}
            fallback={<p class="error" role="alert">{error()}</p>}
          >
            <For each={surfaceIds()}>
              {(surfaceId) => (
                <Show when={state().surfaces[surfaceId]}>
                  {(surface) => (
                    <PresentationSurface
                      surface={surface()}
                      active={activeSurfaceId() === surfaceId}
                      onEvent={sendInteractive}
                    />
                  )}
                </Show>
              )}
            </For>
          </Show>
        </Show>
      </main>
      <Show when={activeSurfaceId()}>
        {(surfaceId) => (
          <ContextCommandBar
            surfaceId={surfaceId()}
            bar={activeBar()}
            onEvent={sendInteractive}
          />
        )}
      </Show>
      <Show when={state().overlay}>
        {(overlay) => (
          <PresentationOverlay
            surfaceId={overlay().surface_id}
            overlay={overlay().overlay}
            reducedMotion={reducedMotion()}
            onAction={selectOverlayAction}
            onDismiss={dismissOverlay}
          />
        )}
      </Show>
      <div class="toast-region" aria-live="polite" aria-atomic="true">
        <Show when={toast()}>
          {(visibleToast) => (
            <div class="toast">
              <span>{visibleToast().message}</span>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}

function exportFile(value: unknown) {
  if (
    typeof value !== "object"
    || value === null
    || !("data" in value)
  ) return;
  const file = value as {
    suggested_name?: string;
    mime_type?: string;
    data: number[];
  };
  const url = URL.createObjectURL(new Blob(
    [new Uint8Array(file.data)],
    { type: file.mime_type ?? "application/octet-stream" },
  ));
  const link = document.createElement("a");
  link.href = url;
  link.download = file.suggested_name ?? "vauchi-export";
  link.click();
  URL.revokeObjectURL(url);
}

function postNotification(value: unknown) {
  if (
    Notification.permission !== "granted"
    || typeof value !== "object"
    || value === null
  ) return;
  const notification = value as { title?: string; body?: string };
  new Notification(notification.title ?? "Vauchi", {
    body: notification.body,
  });
}
