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
    <div class="component info-panel">
      <div class="info-panel-header">
        <Show when={props.icon}>
          <span class="info-panel-icon">{props.icon}</span>
        </Show>
        <h4 class="info-panel-title">{props.title}</h4>
      </div>
      <div class="info-panel-items">
        <For each={props.items}>
          {(item) => (
            <div class="info-item">
              <span class="info-label">{item.label}</span>
              <span class="info-value">{item.value}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
