// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createEffect, createMemo, createSignal, Show } from "solid-js";
import QRCode from "qrcode";
import type {
  PresentationEvent,
  PresentationNode,
} from "../types/presentation";
import { valueChanged } from "./events";
import { qrCorrectionLevel, qrFrameSpec } from "./qrFrame";

type QrNode = Extract<PresentationNode, { Qr: unknown }>["Qr"];

interface Props {
  node: QrNode;
  surfaceId: string;
  onEvent: (event: PresentationEvent) => void;
}

// The node's square, in logical pixels; a placement sizes and offsets the
// drawn code inside it (vauchi/private#450).
const SQUARE_SIDE = 240;

export function QrPresentation(props: Props) {
  const [dataUrl, setDataUrl] = createSignal<string | null>(null);
  const [failed, setFailed] = createSignal(false);
  const frame = createMemo(() => qrFrameSpec(props.node.placement, SQUARE_SIDE));

  createEffect(() => {
    const payload = props.node.payloads[0];
    if (props.node.purpose !== "display" || !payload) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(payload, {
      width: Math.max(1, Math.round(frame().side)),
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: qrCorrectionLevel(props.node.error_correction),
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
                  { text: event.currentTarget.value },
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
            <div
              class="presentation-qr-frame"
              style={{ width: `${SQUARE_SIDE}px`, height: `${SQUARE_SIDE}px` }}
            >
              <img
                class="presentation-qr-code"
                src={url()}
                style={{
                  width: `${frame().side}px`,
                  height: `${frame().side}px`,
                  left: `${frame().left}px`,
                  top: `${frame().top}px`,
                }}
                alt={props.node.accessibility.label}
              />
            </div>
          )}
        </Show>
      </Show>
    </section>
  );
}
