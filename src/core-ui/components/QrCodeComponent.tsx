// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Match, Show, Switch } from "solid-js";
import type { QrMode } from "../../types/core";

interface Props {
  id: string;
  data: string;
  mode: QrMode;
  label: string | null;
}

export function QrCodeComponent(props: Props) {
  return (
    <div class="component qr-display">
      <Show when={props.label}>
        <div class="qr-label">{props.label}</div>
      </Show>
      <Switch>
        <Match when={props.mode === "Display"}>
          <div class="qr-placeholder">
            <div class="qr-placeholder-content">
              <span class="qr-icon">&#9641;&#9641;&#9641;</span>
              <span class="qr-data-hint">QR: {props.data.substring(0, 24)}{props.data.length > 24 ? "..." : ""}</span>
            </div>
          </div>
        </Match>
        <Match when={props.mode === "Scan"}>
          <div class="qr-placeholder qr-scan">
            <div class="qr-placeholder-content">
              <span class="qr-icon">&#128247;</span>
              <span>Point camera at QR code</span>
            </div>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
