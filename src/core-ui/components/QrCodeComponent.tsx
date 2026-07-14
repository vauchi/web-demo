// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createSignal, createEffect, Match, Show, Switch } from "solid-js";
import type { A11y, QrMode } from "../../types/core";
import QRCode from "qrcode";

interface Props {
  id: string;
  data: string;
  mode: QrMode;
  label: string | null;
  a11y?: A11y;
}

export function QrCodeComponent(props: Props) {
  const [dataUrl, setDataUrl] = createSignal<string | null>(null);
  const [error, setError] = createSignal(false);

  createEffect(() => {
    if (props.mode === "Display" && props.data) {
      QRCode.toDataURL(props.data, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      })
        .then((url: string) => {
          setDataUrl(url);
          setError(false);
        })
        .catch(() => {
          setError(true);
          setDataUrl(null);
        });
    }
  });

  return (
    <div
      class="component qr-display"
      aria-label={props.a11y?.label ?? props.label ?? undefined}
      title={props.a11y?.hint}
    >
      <Show when={props.label}>
        <div class="qr-label">{props.label}</div>
      </Show>
      <Switch>
        <Match when={props.mode === "Display"}>
          <Show
            when={dataUrl()}
            fallback={
              <Show
                when={error()}
                fallback={
                  <div class="qr-placeholder">
                    <div class="qr-placeholder-content">
                      <div class="spinner" aria-hidden="true" />
                    </div>
                  </div>
                }
              >
                <div
                  class="qr-error"
                  role="alert"
                  aria-label={props.a11y?.label ?? props.label ?? undefined}
                >
                  &#9888;
                </div>
              </Show>
            }
          >
            {(url) => (
              <img
                class="qr-image"
                src={url()}
                alt={props.a11y?.label ?? props.label ?? ""}
                width={200}
                height={200}
              />
            )}
          </Show>
        </Match>
        <Match when={props.mode === "Scan"}>
          <div class="qr-placeholder qr-scan">
            <div class="qr-placeholder-content">
              <span class="qr-icon" aria-hidden="true">&#128247;</span>
            </div>
          </div>
        </Match>
      </Switch>
    </div>
  );
}
