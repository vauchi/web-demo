// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type { ScreenModel } from "../types/core";
import { ComponentRenderer } from "./ComponentRenderer";

interface Props {
  screen: ScreenModel;
  onAction: (actionJson: string) => void;
}

export function ScreenRenderer(props: Props) {
  const pressAction = (actionId: string) => {
    props.onAction(JSON.stringify({ ActionPressed: { action_id: actionId } }));
  };

  return (
    <div class="screen">
      <h2>{props.screen.title}</h2>
      <Show when={props.screen.subtitle}>
        <p class="subtitle">{props.screen.subtitle}</p>
      </Show>
      <Show when={props.screen.progress}>
        {(p) => (
          <div class="progress-bar">
            <div class="progress-fill" style={{ width: `${(p().current_step / p().total_steps) * 100}%` }} />
            <Show when={p().label}><span>{p().label}</span></Show>
          </div>
        )}
      </Show>
      <div class="components">
        <For each={props.screen.components}>
          {(component) => <ComponentRenderer component={component} onAction={props.onAction} />}
        </For>
      </div>
      <div class="actions">
        <For each={props.screen.actions}>
          {(action) => (
            <button
              class={`action-btn action-${action.style.toLowerCase()}`}
              disabled={!action.enabled}
              onClick={() => pressAction(action.id)}
            >
              {action.label}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
