// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";
import type { A11y } from "../../types/core";

interface Props {
  id: string;
  label: string;
  value: string;
  edit_text: string;
  save_text: string;
  cancel_text: string;
  edit_action_id: string;
  save_action_id: string;
  cancel_action_id: string;
  editing: boolean;
  validation_error: string | null;
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

export function EditableTextComponent(props: Props) {
  const handleInput = (e: InputEvent) => {
    const value = (e.target as HTMLInputElement).value;
    props.onAction(JSON.stringify({
      TextChanged: { component_id: props.id, value }
    }));
  };

  const press = (actionId: string) => {
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: actionId }
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
            <button class="btn-edit" onClick={() => press(props.edit_action_id)}>
              {props.edit_text}
            </button>
          </div>
        }
      >
        <div class="editable-text-editor">
          <input
            id={props.id}
            type="text"
            value={props.value}
            aria-label={props.a11y?.label ?? props.label}
            title={props.a11y?.hint}
            aria-invalid={props.validation_error ? true : undefined}
            aria-describedby={props.validation_error ? `${props.id}-error` : undefined}
            onInput={handleInput}
          />
          <div class="editable-text-actions">
            <button class="btn-cancel" onClick={() => press(props.cancel_action_id)}>
              {props.cancel_text}
            </button>
            <button class="btn-confirm" onClick={() => press(props.save_action_id)}>
              {props.save_text}
            </button>
          </div>
        </div>
        <Show when={props.validation_error}>
          <span class="validation-error" id={`${props.id}-error`}>{props.validation_error}</span>
        </Show>
      </Show>
    </div>
  );
}
