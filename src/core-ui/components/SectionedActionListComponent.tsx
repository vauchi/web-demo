// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type { Section } from "../../types/core";

interface Props {
  id: string;
  sections: Section[];
  onAction: (actionJson: string) => void;
}

// Component::SectionedActionList: multiple labeled groups of tappable
// items. Emits ListItemSelected with the chosen item's id.
export function SectionedActionListComponent(props: Props) {
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
    <div class="component sectioned-action-list">
      <For each={props.sections}>
        {(section) => (
          <div class="sal-section" role="group" aria-label={section.label}>
            <h4 class="sal-section-header">{section.label}</h4>
            <div class="sal-section-items" role="list">
              <For each={section.items}>
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
          </div>
        )}
      </For>
    </div>
  );
}
