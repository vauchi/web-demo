// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type { InfoItem } from "../../types/core";

interface Props {
  id: string;
  icon: string | null;
  title: string;
  items: InfoItem[];
}

export function InfoPanelComponent(props: Props) {
  return (
    <div class="info-panel">
      <Show when={props.icon}><span class="icon">{props.icon}</span></Show>
      <h4>{props.title}</h4>
      <For each={props.items}>
        {(item) => (
          <div class="info-item">
            <span class="info-label">{item.label}</span>
            <span class="info-value">{item.value}</span>
          </div>
        )}
      </For>
    </div>
  );
}
