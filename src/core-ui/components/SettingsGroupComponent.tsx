// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For } from "solid-js";
import type { SettingsItem } from "../../types/core";

interface Props {
  id: string;
  label: string;
  items: SettingsItem[];
  onAction: (actionJson: string) => void;
}

export function SettingsGroupComponent(props: Props) {
  const onToggle = (itemId: string) => {
    props.onAction(JSON.stringify({ SettingsToggled: { component_id: props.id, item_id: itemId } }));
  };

  return (
    <div class="settings-group">
      <h4>{props.label}</h4>
      <For each={props.items}>
        {(item) => (
          <div class="settings-item" onClick={() => onToggle(item.id)}>
            <span>{item.label}</span>
          </div>
        )}
      </For>
    </div>
  );
}
