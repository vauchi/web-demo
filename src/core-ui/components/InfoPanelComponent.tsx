// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type { A11y, InfoItem } from "../../types/core";

interface Props {
  id: string;
  icon: string | null;
  title: string;
  items: InfoItem[];
  a11y?: A11y;
}

export function InfoPanelComponent(props: Props) {
  return (
    <div class="component info-panel" aria-label={props.a11y?.label ?? props.title} title={props.a11y?.hint}>
      <div class="info-panel-header">
        <Show when={props.icon}>
          <span class="info-panel-icon">{props.icon}</span>
        </Show>
        <h4 class="info-panel-title" role="heading">{props.title}</h4>
      </div>
      <div class="info-panel-items">
        <For each={props.items}>
          {(item) => (
            <div class="info-item">
              <Show when={item.icon}>
                <span class="info-item-icon">{item.icon}</span>
              </Show>
              <span class="info-label">{item.title}</span>
              <span class="info-value">{item.detail}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
