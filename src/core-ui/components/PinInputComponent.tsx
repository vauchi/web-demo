// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";

interface Props {
  id: string;
  label: string;
  length: number;
  masked: boolean;
  validation_error: string | null;
  onAction: (actionJson: string) => void;
}

export function PinInputComponent(props: Props) {
  const onChange = (value: string) => {
    props.onAction(JSON.stringify({ TextChanged: { component_id: props.id, value } }));
  };

  return (
    <div class="pin-input">
      <label for={props.id}>{props.label}</label>
      <input
        id={props.id}
        type={props.masked ? "password" : "text"}
        maxLength={props.length}
        inputMode="numeric"
        onInput={(e) => onChange(e.currentTarget.value)}
      />
      <Show when={props.validation_error}>
        <span class="error">{props.validation_error}</span>
      </Show>
    </div>
  );
}
