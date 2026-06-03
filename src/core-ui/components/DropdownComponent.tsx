// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For } from "solid-js";
import type { A11y, DropdownOption } from "../../types/core";

interface Props {
  id: string;
  label: string;
  selected: string | null;
  options: DropdownOption[];
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

// Component::Dropdown: an inline selection control. Reuses
// ListItemSelected — the chosen option id rides item_id (per core docs).
export function DropdownComponent(props: Props) {
  const onSelect = (optionId: string) => {
    props.onAction(JSON.stringify({
      ListItemSelected: { component_id: props.id, item_id: optionId }
    }));
  };

  return (
    <div class="component dropdown">
      <label class="dropdown-label" for={props.id}>{props.label}</label>
      <select
        id={props.id}
        class="dropdown-select"
        aria-label={props.a11y?.label ?? props.label}
        value={props.selected ?? ""}
        onChange={(e) => onSelect(e.currentTarget.value)}
      >
        <For each={props.options}>
          {(option) => (
            <option value={option.id} selected={option.id === props.selected}>
              {option.label}
            </option>
          )}
        </For>
      </select>
    </div>
  );
}
