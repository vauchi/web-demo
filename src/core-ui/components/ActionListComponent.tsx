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

  const onKeyDown = (itemId: string, e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(itemId);
    }
  };

  return (
    <div class="component action-list" role="list">
      <For each={props.items}>
        {(item) => (
          <div
            class="action-item"
            role="button"
            tabIndex={0}
            onClick={() => onSelect(item.id)}
            onKeyDown={(e) => onKeyDown(item.id, e)}
          >
            <Show when={item.icon}>
              <span class="action-icon" aria-hidden="true">{item.icon}</span>
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
