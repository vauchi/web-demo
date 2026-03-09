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
    <div class={`status-indicator status-${props.status.toLowerCase()}`}>
      <Show when={props.icon}><span class="icon">{props.icon}</span></Show>
      <span class="status-title">{props.title}</span>
      <Show when={props.detail}>
        <span class="status-detail">{props.detail}</span>
      </Show>
    </div>
  );
}
