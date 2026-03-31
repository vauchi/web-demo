// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";

interface Props {
  id: string;
  label: string;
  value: string;
  editing: boolean;
  validation_error: string | null;
  onAction: (actionJson: string) => void;
}

export function EditableTextComponent(props: Props) {
  const handleInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value;
    props.onAction(JSON.stringify({
      TextChanged: { component_id: props.id, value }
    }));
  };

  const handleEdit = () => {
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: `${props.id}_edit` }
    }));
  };

  return (
    <div class="component editable-text">
      <label for={props.id}>{props.label}</label>
      <Show
        when={props.editing}
        fallback={
          <div class="editable-text-display">
            <span class="editable-text-value">{props.value}</span>
            <button class="btn-edit" onClick={handleEdit}>Edit</button>
          </div>
        }
      >
        <input
          id={props.id}
          type="text"
          value={props.value}
          aria-invalid={props.validation_error ? true : undefined}
          aria-describedby={props.validation_error ? `${props.id}-error` : undefined}
          onInput={handleInput}
        />
        <Show when={props.validation_error}>
          <span class="validation-error" id={`${props.id}-error`}>{props.validation_error}</span>
        </Show>
      </Show>
    </div>
  );
}
