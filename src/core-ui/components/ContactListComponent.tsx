// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type { ContactItem } from "../../types/core";

interface Props {
  id: string;
  contacts: ContactItem[];
  searchable: boolean;
  onAction: (actionJson: string) => void;
}

export function ContactListComponent(props: Props) {
  const onSelect = (itemId: string) => {
    props.onAction(JSON.stringify({ ListItemSelected: { component_id: props.id, item_id: itemId } }));
  };

  return (
    <div class="contact-list">
      <For each={props.contacts}>
        {(contact) => (
          <div class="contact-item" onClick={() => onSelect(contact.id)}>
            <span class="contact-name">{contact.name}</span>
            <Show when={contact.subtitle}>
              <span class="contact-subtitle">{contact.subtitle}</span>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
