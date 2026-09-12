// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createUniqueId, For, Show } from "solid-js";
import type {
  PresentationEvent,
  PresentationNode,
} from "../types/presentation";
import { valueChanged } from "./events";

type ChoiceNode = Extract<PresentationNode, { Choice: unknown }>["Choice"];

interface Props {
  choice: ChoiceNode;
  surfaceId: string;
  onEvent: (event: PresentationEvent) => void;
}

// The design canvas draws two- and three-way choices (Perspective, group
// View Mode) as adjoining segments; anything longer (Theme has 15) stays a
// native select.
export const SEGMENTED_CHOICE_MAX_OPTIONS = 3;

export type ChoiceControlKind = "segmented" | "select";

export const choiceControlKind = (optionCount: number): ChoiceControlKind =>
  optionCount >= 2 && optionCount <= SEGMENTED_CHOICE_MAX_OPTIONS
    ? "segmented"
    : "select";

const ARROW_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

export function ChoiceControl(props: Props) {
  const labelId = createUniqueId();
  const emit = (optionId: string) => {
    if (optionId === props.choice.selected) return;
    props.onEvent(valueChanged(
      props.surfaceId,
      props.choice.binding_id,
      { choice: optionId },
    ));
  };

  const segmentedRovingIndex = () => {
    const index = props.choice.options
      .findIndex((option) => option.id === props.choice.selected);
    return index === -1 ? 0 : index;
  };

  const onSegmentKeyDown = (event: KeyboardEvent, index: number) => {
    const count = props.choice.options.length;
    let targetIndex: number | undefined;
    if (event.key in ARROW_STEPS) {
      targetIndex = (index + ARROW_STEPS[event.key] + count) % count;
    } else if (event.key === "Home") {
      targetIndex = 0;
    } else if (event.key === "End") {
      targetIndex = count - 1;
    }
    if (targetIndex === undefined) return;
    event.preventDefault();
    emit(props.choice.options[targetIndex].id);
    const segment = event.currentTarget as HTMLElement;
    (segment.parentElement?.children[targetIndex] as HTMLElement | undefined)?.focus();
  };

  return (
    <Show
      when={choiceControlKind(props.choice.options.length) === "segmented"}
      fallback={
        <label class="presentation-input">
          <span>{props.choice.label}</span>
          <select
            value={props.choice.selected ?? ""}
            disabled={!props.choice.enabled}
            data-presentation-id={props.choice.binding_id}
            aria-label={props.choice.accessibility.label}
            onChange={(event) => emit(event.currentTarget.value)}
          >
            <For each={props.choice.options}>
              {(option) => <option value={option.id}>{option.label}</option>}
            </For>
          </select>
        </label>
      }
    >
      <div class="presentation-input presentation-choice">
        <span id={labelId}>{props.choice.label}</span>
        <div
          role="radiogroup"
          class="presentation-choice-segments"
          aria-labelledby={labelId}
          aria-description={props.choice.accessibility.description ?? undefined}
          data-presentation-id={props.choice.binding_id}
        >
          <For each={props.choice.options}>
            {(option, index) => (
              <button
                type="button"
                role="radio"
                aria-checked={option.id === props.choice.selected}
                tabIndex={index() === segmentedRovingIndex() ? 0 : -1}
                disabled={!props.choice.enabled}
                onClick={() => emit(option.id)}
                onKeyDown={(event) => onSegmentKeyDown(event, index())}
              >
                {option.label}
              </button>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}
