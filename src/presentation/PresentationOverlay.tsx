// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, onMount, Show } from "solid-js";
import type {
  OverlaySpec,
  PresentationEvent,
} from "../types/presentation";
import { actionActivated } from "./events";

interface Props {
  surfaceId: string;
  overlay: OverlaySpec;
  reducedMotion: boolean;
  onAction: (event: PresentationEvent) => void;
  onDismiss: () => void;
}

export function PresentationOverlay(props: Props) {
  let panel: HTMLElement | undefined;

  onMount(() => {
    panel?.querySelector<HTMLElement>("button:not(:disabled)")?.focus();
  });

  return (
    <div
      class={`presentation-overlay-backdrop overlay-${props.overlay.kind}${props.reducedMotion ? " reduced-motion" : ""}`}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) props.onDismiss();
      }}
    >
      <section
        ref={panel}
        class="presentation-overlay-panel"
        role="dialog"
        aria-modal="true"
        aria-label={props.overlay.title ?? (
          props.overlay.kind === "navigation" ? "Navigation" : "Actions"
        )}
      >
        <header>
          <Show when={props.overlay.title}>
            {(title) => <h2>{title()}</h2>}
          </Show>
          <button
            type="button"
            class="presentation-overlay-close"
            aria-label="Close"
            onClick={props.onDismiss}
          >
            ×
          </button>
        </header>
        <div class="presentation-overlay-items">
          <For each={props.overlay.items}>
            {(action) => (
              <button
                type="button"
                class={action.tone === "destructive" ? "is-destructive" : ""}
                disabled={!action.enabled}
                data-presentation-id={action.interaction_id}
                aria-label={action.accessibility_label}
                onClick={() => props.onAction(actionActivated(
                  props.surfaceId,
                  action.interaction_id,
                ))}
              >
                {action.label}
              </button>
            )}
          </For>
        </div>
      </section>
    </div>
  );
}
