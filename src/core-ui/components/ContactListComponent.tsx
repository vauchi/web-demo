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
  const [query, setQuery] = createSignal("");

  const filteredContacts = () => {
    const q = query().toLowerCase();
    if (!q) return props.contacts;
    return props.contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(q))
    );
  };

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

  return (
    <div class="component contact-list">
      <Show when={props.searchable}>
        <input
          class="search"
          type="text"
          placeholder="Search contacts..."
          value={query()}
          onInput={(e) => onSearch(e.currentTarget.value)}
        />
      </Show>
      <div class="contact-items">
        <For each={filteredContacts()}>
          {(contact) => (
            <div class="contact-item" onClick={() => onSelect(contact.id)}>
              <div class="avatar">{contact.name.charAt(0).toUpperCase()}</div>
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
