// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSignal, For, Show } from "solid-js";
import type { A11y, FieldDisplay, GroupCardView } from "../../types/core";

interface Props {
  name: string;
  fields: FieldDisplay[];
  group_views: GroupCardView[];
  selected_group: string | null;
  /**
   * G1 (ADR-021/043): pre-filtered list emitted by core's
   * `build_visible_fields` helper. Frontends should render this
   * directly rather than reproducing the filter / fallback in TS.
   * Optional for backwards compat with pre-G1 ScreenModel JSON;
   * falls back to `fields` when absent.
   */
  visible_fields?: FieldDisplay[];
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

export function CardPreviewComponent(props: Props) {
  const selectGroup = (groupName: string | null) => {
    props.onAction(JSON.stringify({
      GroupViewSelected: { group_name: groupName }
    }));
  };

  const activeFields = () => props.visible_fields ?? props.fields;

  return (
    <div class="component card-preview" aria-label={props.a11y?.label ?? `Card preview: ${props.name}`} title={props.a11y?.hint}>
      <Show when={props.group_views.length > 0}>
        <div class="card-group-tabs">
          <button
            class={`card-tab ${props.selected_group === null ? "card-tab-active" : ""}`}
            onClick={() => selectGroup(null)}
          >
            All
          </button>
          <For each={props.group_views}>
            {(view) => (
              <button
                class={`card-tab ${props.selected_group === view.group_name ? "card-tab-active" : ""}`}
                onClick={() => selectGroup(view.group_name)}
              >
                {view.display_name}
              </button>
            )}
          </For>
        </div>
      </Show>
      <div class="card-header">
        <div class="card-avatar">{props.name.charAt(0).toUpperCase()}</div>
        <h3 class="card-name">{props.name}</h3>
      </div>
      <div class="card-fields">
        <For each={activeFields()}>
          {(field) => (
            <div class="card-field-row">
              <span class="card-field-label">{field.label}</span>
              <span class="card-field-value">{field.value}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
