// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";
import type { QrMode } from "../../types/core";

interface Props {
  id: string;
  data: string;
  mode: QrMode;
  label: string | null;
}

export function QrCodeComponent(props: Props) {
  return (
    <div class="qr-code">
      <Show when={props.label}>
        <span class="qr-label">{props.label}</span>
      </Show>
      <div class="qr-placeholder">
        {props.mode === "Display" ? `[QR: ${props.data.substring(0, 20)}...]` : "[Camera for QR scan]"}
      </div>
    </div>
  );
}
