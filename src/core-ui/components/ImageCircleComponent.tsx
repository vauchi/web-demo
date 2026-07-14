// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";
import type { A11y } from "../../types/core";

interface Props {
  id: string;
  image_data?: number[] | null;
  initials: string;
  bg_color?: [number, number, number] | null;
  brightness?: number;
  editable?: boolean;
  edit_action_id?: string | null;
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

// Component::ImageCircle: circular image with an initials fallback.
export function ImageCircleComponent(props: Props) {
  const onEdit = () => {
    const actionId = props.edit_action_id;
    if (!actionId) return;
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: actionId }
    }));
  };

  // TODO(HUMBLE): T — frontend decodes WebP bytes into a data URL; core should emit a ready-to-render image_url (see _private/docs/problems/2026-07-06-desktop-tui-web-domain-shell-violations)
  // Raw bytes -> data URL for the demo showcase. Core ships WebP (ADR-042).
  const imageSrc = () => {
    const bytes = props.image_data;
    if (!bytes || bytes.length === 0) return null;
    const binary = bytes.map((b) => String.fromCharCode(b)).join("");
    return `data:image/webp;base64,${btoa(binary)}`;
  };

  const bgStyle = () => {
    const rgb = props.bg_color;
    const filter = props.brightness ? `brightness(${1 + props.brightness})` : undefined;
    return {
      "background-color": rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : undefined,
      filter,
    };
  };

  const inner = (
    <Show
      when={imageSrc()}
      fallback={<span class="avatar-initials">{props.initials}</span>}
    >
      {(src) => <img class="avatar-image" src={src()} alt={props.a11y?.label ?? props.initials} />}
    </Show>
  );

  return (
    <div class="component avatar-preview">
      <Show
        when={props.editable && props.edit_action_id}
        fallback={
          <div class="avatar-circle" style={bgStyle()} aria-label={props.a11y?.label ?? props.initials}>
            {inner}
          </div>
        }
      >
        <button
          class="avatar-circle avatar-editable"
          style={bgStyle()}
          aria-label={props.a11y?.label ?? props.initials}
          onClick={onEdit}
        >
          {inner}
        </button>
      </Show>
    </div>
  );
}
