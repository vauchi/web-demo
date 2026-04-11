// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";
import type { A11y, InputType } from "../../types/core";

interface Props {
  id: string;
  label: string;
  value: string;
  placeholder: string | null;
  max_length: number | null;
  validation_error: string | null;
  input_type: InputType;
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

export function TextInputComponent(props: Props) {
  const htmlType = () => {
    switch (props.input_type) {
      case "Email": return "email";
      case "Phone": return "tel";
      case "Password": return "password";
      default: return "text";
    }
  };

  const handleInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value;
    props.onAction(JSON.stringify({
      TextChanged: { component_id: props.id, value }
    }));
  };

  return (
    <div class="component text-input">
      <label for={props.id}>{props.label}</label>
      <input
        id={props.id}
        type={htmlType()}
        value={props.value}
        placeholder={props.placeholder ?? ""}
        maxLength={props.max_length ?? undefined}
        aria-label={props.a11y?.label}
        title={props.a11y?.hint}
        aria-invalid={props.validation_error ? true : undefined}
        aria-describedby={props.validation_error ? `${props.id}-error` : undefined}
        onInput={handleInput}
      />
      <Show when={props.validation_error}>
        <span class="validation-error" id={`${props.id}-error`}>{props.validation_error}</span>
      </Show>
    </div>
  );
}
