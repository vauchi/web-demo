// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For } from "solid-js";
import type { ToggleItem } from "../../types/core";

interface Props {
  id: string;
  label: string;
  items: ToggleItem[];
  onAction: (actionJson: string) => void;
}

export function ToggleListComponent(props: Props) {
  const onToggle = (itemId: string) => {
    props.onAction(JSON.stringify({
      ItemToggled: { component_id: props.id, item_id: itemId }
    }));
  };

  return (
    <div class="component toggle-list">
      <div class="toggle-list-label">{props.label}</div>
      <ul class="toggle-items">
        <For each={props.items}>
          {(item) => (
            <li class="toggle-item">
              <label class="toggle-item-label">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={() => onToggle(item.id)}
                />
                <span>{item.label}</span>
              </label>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
