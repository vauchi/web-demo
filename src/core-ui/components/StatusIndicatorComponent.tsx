// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";
import type { Status } from "../../types/core";

interface Props {
  id: string;
  icon: string | null;
  title: string;
  detail: string | null;
  status: Status;
}

export function StatusIndicatorComponent(props: Props) {
  return (
    <div class="component status-indicator">
      <Show when={props.icon}>
        <span class="status-icon">{props.icon}</span>
      </Show>
      <div class="status-content">
        <span class="status-title">{props.title}</span>
        <Show when={props.detail}>
          <span class="status-detail">{props.detail}</span>
        </Show>
      </div>
      <span class={`status-badge status-${props.status}`}>{props.status}</span>
    </div>
  );
}
