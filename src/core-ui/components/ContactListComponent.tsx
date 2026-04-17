// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSignal, For, Show } from "solid-js";
import type { ContactItem } from "../../types/core";

interface Props {
  id: string;
  contacts: ContactItem[];
  searchable: boolean;
  onAction: (actionJson: string) => void;
}

export function ContactListComponent(props: Props) {
  // Local signal is for the input's controlled value only; filtering happens
  // in core's ContactListEngine via SearchChanged → UpdateScreen. props.contacts
  // always arrives pre-filtered — a second client-side filter would violate
  // ADR-021 (single source of truth) and double-filter after the rerender.
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

  const onKeyDown = (itemId: string, e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(itemId);
    }
  };

  return (
    <div class="component contact-list">
      <Show when={props.searchable}>
        <input
          class="search"
          type="text"
          placeholder="Search contacts..."
          aria-label="Search contacts"
          value={query()}
          onInput={(e) => onSearch(e.currentTarget.value)}
        />
      </Show>
      <div class="contact-items" role="listbox" aria-label="Contacts">
        <For each={props.contacts}>
          {(contact) => (
            <div
              class="contact-item"
              role="option"
              tabIndex={0}
              onClick={() => onSelect(contact.id)}
              onKeyDown={(e) => onKeyDown(contact.id, e)}
            >
              <div class="avatar">{contact.avatar_initials}</div>
              <div class="contact-info">
                <span class="contact-name">{contact.name}</span>
                <Show when={contact.subtitle}>
                  <span class="contact-subtitle">{contact.subtitle}</span>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
