// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSignal, For, Show } from "solid-js";
import type { Item } from "../../types/core";

interface Props {
  id: string;
  items: Item[];
  searchable: boolean;
  onAction: (actionJson: string) => void;
}

// Wire Humble Component::List: a domain-agnostic list of Items with an
// optional search affordance and per-row actions. The renderer never reads
// what kind of thing an Item represents; it forwards ids back to core.
export function ListComponent(props: Props) {
  // Controlled value only; filtering happens in core (ADR-021). props.items
  // always arrives pre-filtered after a SearchChanged → UpdateScreen cycle.
  const [query, setQuery] = createSignal("");

  const onSearch = (value: string) => {
    setQuery(value);
    props.onAction(JSON.stringify({
      SearchChanged: { component_id: props.id, query: value }
    }));
  };

  const onSelect = (itemId: string) => {
    props.onAction(JSON.stringify({
      ListItemSelected: { component_id: props.id, item_id: itemId }
    }));
  };

  const onRowAction = (itemId: string, actionId: string) => {
    props.onAction(JSON.stringify({
      ListItemAction: { component_id: props.id, item_id: itemId, action_id: actionId }
    }));
  };

  const onKeyDown = (itemId: string, e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(itemId);
    }
  };

  return (
    <div class="component list">
      <Show when={props.searchable}>
        <input
          class="search"
          type="text"
          placeholder="Search..."
          aria-label="Search list"
          value={query()}
          onInput={(e) => onSearch(e.currentTarget.value)}
        />
      </Show>
      <div class="list-items" role="listbox" aria-label="Items">
        <For each={props.items}>
          {(item) => (
            <div class="list-item-wrap">
              <div
                class="list-item"
                role="option"
                tabIndex={0}
                onClick={() => onSelect(item.id)}
                onKeyDown={(e) => onKeyDown(item.id, e)}
              >
                <div class="avatar">{item.avatar_initials}</div>
                <div class="list-info">
                  <span class="list-name">{item.name}</span>
                  <Show when={item.subtitle}>
                    <span class="list-subtitle">{item.subtitle}</span>
                  </Show>
                </div>
                <Show when={item.status}>
                  <span class="list-status">{item.status}</span>
                </Show>
              </div>
              <Show when={item.actions && item.actions.length > 0}>
                <div class="list-item-actions" role="group" aria-label="Row actions">
                  <For each={item.actions}>
                    {(action) => (
                      <button
                        class={`list-row-action ${action.destructive ? "destructive" : ""}`}
                        onClick={() => onRowAction(item.id, action.id)}
                      >
                        {action.label}
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
