// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSignal, For, Show } from "solid-js";
import type { FieldDisplay, GroupCardView } from "../../types/core";

interface Props {
  name: string;
  fields: FieldDisplay[];
  group_views: GroupCardView[];
  selected_group: string | null;
  onAction: (actionJson: string) => void;
}

export function CardPreviewComponent(props: Props) {
  const selectGroup = (groupName: string | null) => {
    props.onAction(JSON.stringify({
      GroupViewSelected: { group_name: groupName }
    }));
  };

  const activeFields = () => {
    if (props.selected_group && props.group_views.length > 0) {
      const view = props.group_views.find(v => v.group_name === props.selected_group);
      return view ? view.fields : props.fields;
    }
    return props.fields;
  };

  return (
    <div class="component card-preview">
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
                {view.group_name}
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
