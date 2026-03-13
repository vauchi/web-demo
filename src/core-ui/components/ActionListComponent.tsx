// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type { ActionListItem } from "../../types/core";

interface Props {
  id: string;
  items: ActionListItem[];
  onAction: (actionJson: string) => void;
}

export function ActionListComponent(props: Props) {
  const onSelect = (itemId: string) => {
    props.onAction(JSON.stringify({
      ListItemSelected: { component_id: props.id, item_id: itemId }
    }));
  };

  return (
    <div class="component action-list">
      <For each={props.items}>
        {(item) => (
          <div
            class="action-item"
            onClick={() => onSelect(item.id)}
          >
            <Show when={item.icon}>
              <span class="action-icon">{item.icon}</span>
            </Show>
            <span class="action-label">{item.label}</span>
            <Show when={item.detail}>
              <span class="action-detail">{item.detail}</span>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
