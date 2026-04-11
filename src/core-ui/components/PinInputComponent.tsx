// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createEffect, createSignal, For, Show } from "solid-js";
import type { A11y } from "../../types/core";

interface Props {
  id: string;
  label: string;
  length: number;
  filled: number;
  masked: boolean;
  validation_error: string | null;
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

export function PinInputComponent(props: Props) {
  const [digits, setDigits] = createSignal<string[]>(
    Array.from({ length: props.length }, (_, i) => i < props.filled ? "\u2022" : "")
  );

  createEffect(() => {
    setDigits(Array.from({ length: props.length }, (_, i) => i < props.filled ? "\u2022" : ""));
  });

  const fireAction = (newDigits: string[]) => {
    const value = newDigits.join("");
    props.onAction(JSON.stringify({
      TextChanged: { component_id: props.id, value }
    }));
  };

  const handleInput = (index: number, e: InputEvent) => {
    const input = e.target as HTMLInputElement;
    const char = input.value.slice(-1);
    const newDigits = [...digits()];
    newDigits[index] = char;
    setDigits(newDigits);
    fireAction(newDigits);

    // Auto-advance to next input
    if (char && index < props.length - 1) {
      const next = input.parentElement?.querySelector<HTMLInputElement>(
        `input:nth-child(${index + 2})`
      );
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent) => {
    if (e.key === "Backspace" && !digits()[index] && index > 0) {
      const prev = (e.target as HTMLElement).parentElement?.querySelector<HTMLInputElement>(
        `input:nth-child(${index})`
      );
      prev?.focus();
    }
  };

  return (
    <div
      class="component pin-input-container"
      aria-label={props.a11y?.label}
      title={props.a11y?.hint}
    >
      <label>{props.label}</label>
      <div class="pin-input">
        <For each={Array.from({ length: props.length }, (_, i) => i)}>
          {(i) => (
            <input
              type={props.masked ? "password" : "text"}
              inputMode="numeric"
              maxLength={1}
              value={digits()[i] ?? ""}
              aria-label={`PIN digit ${i + 1}`}
              onInput={(e) => handleInput(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          )}
        </For>
      </div>
      <Show when={props.validation_error}>
        <span class="validation-error">{props.validation_error}</span>
      </Show>
    </div>
  );
}
