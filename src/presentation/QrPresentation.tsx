// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createEffect, createSignal, Show } from "solid-js";
import QRCode from "qrcode";
import type {
  PresentationEvent,
  PresentationNode,
} from "../types/presentation";
import { valueChanged } from "./events";

type QrNode = Extract<PresentationNode, { Qr: unknown }>["Qr"];

interface Props {
  node: QrNode;
  surfaceId: string;
  onEvent: (event: PresentationEvent) => void;
}

export function QrPresentation(props: Props) {
  const [dataUrl, setDataUrl] = createSignal<string | null>(null);
  const [failed, setFailed] = createSignal(false);

  createEffect(() => {
    const payload = props.node.payloads[0];
    if (props.node.purpose !== "display" || !payload) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(payload, {
      width: 240,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then((url) => {
      setDataUrl(url);
      setFailed(false);
    }).catch(() => {
      setDataUrl(null);
      setFailed(true);
    });
  });

  return (
    <section
      class="presentation-qr"
      aria-label={props.node.accessibility.label}
      aria-description={props.node.accessibility.description ?? undefined}
    >
      <Show when={props.node.label}>
        {(label) => <h3>{label()}</h3>}
      </Show>
      <Show
        when={props.node.purpose === "display"}
        fallback={
          <label class="presentation-input">
            <span>{props.node.accessibility.label}</span>
            <input
              type="text"
              data-presentation-id={props.node.id}
              onChange={(event) => props.onEvent(
                valueChanged(
                  props.surfaceId,
                  props.node.id,
                  { Text: event.currentTarget.value },
                ),
              )}
            />
          </label>
        }
      >
        <Show
          when={dataUrl()}
          fallback={
            <div class="presentation-qr-placeholder" role="status">
              {failed() ? "QR unavailable" : "Preparing QR…"}
            </div>
          }
        >
          {(url) => (
            <img
              src={url()}
              width="240"
              height="240"
              alt={props.node.accessibility.label}
            />
          )}
        </Show>
      </Show>
    </section>
  );
}
