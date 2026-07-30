// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";
import type {
  ActionSpec,
  ContextBar,
  PresentationEvent,
} from "../types/presentation";
import { actionActivated } from "./events";

interface Props {
  surfaceId: string;
  bar: ContextBar | null;
  onEvent: (event: PresentationEvent) => void;
}

export function ContextCommandBar(props: Props) {
  const activate = (action: ActionSpec) => {
    if (action.enabled) {
      props.onEvent(actionActivated(props.surfaceId, action.interaction_id));
    }
  };

  return (
    <nav class="context-command-bar" aria-label="Contextual commands">
      <div class="context-command-slot">
        <Show when={props.bar?.back}>
          {(action) => (
            <button
              type="button"
              class="context-command context-command-back"
              disabled={!action().enabled}
              data-presentation-id={action().interaction_id}
              aria-label={action().accessibility_label}
              onClick={() => activate(action())}
            >
              <span aria-hidden="true">←</span>
              <span>{action().label}</span>
            </button>
          )}
        </Show>
      </div>
      <div class="context-command-slot">
        <Show when={props.bar?.navigation}>
          {(action) => (
            <button
              type="button"
              class="context-command context-command-navigation"
              disabled={!action().enabled}
              data-presentation-id={action().interaction_id}
              aria-label={action().accessibility_label}
              onClick={() => activate(action())}
            >
              <span aria-hidden="true">☰</span>
              <span>{action().label}</span>
            </button>
          )}
        </Show>
      </div>
      <div class="context-command-slot context-command-primary-slot">
        <Show when={props.bar?.primary}>
          {(action) => (
            <button
              type="button"
              class={`context-command context-command-primary${action().shortcut === "undo" ? " is-undo" : ""}`}
              disabled={!action().enabled}
              data-presentation-id={action().interaction_id}
              aria-label={action().accessibility_label}
              onClick={() => activate(action())}
            >
              {action().label}
            </button>
          )}
        </Show>
      </div>
      <div class="context-command-slot">
        <Show when={props.bar?.secondary}>
          {(action) => (
            <button
              type="button"
              class="context-command context-command-secondary"
              disabled={!action().enabled}
              data-presentation-id={action().interaction_id}
              aria-label={action().accessibility_label}
              onClick={() => activate(action())}
            >
              <span aria-hidden="true">•••</span>
              <span>{action().label}</span>
            </button>
          )}
        </Show>
      </div>
    </nav>
  );
}
