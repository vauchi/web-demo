// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";
import type { A11y } from "../../types/core";

interface Props {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  min_icon?: string | null;
  max_icon?: string | null;
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

// Component::Slider: continuous-value input. Emits SliderChanged with
// value_milli (value scaled by 1000 so core's action enum stays Eq).
export function SliderComponent(props: Props) {
  const onChange = (value: number) => {
    props.onAction(JSON.stringify({
      SliderChanged: { component_id: props.id, value_milli: Math.round(value * 1000) }
    }));
  };

  return (
    <div class="component slider">
      <label class="slider-label" for={props.id}>{props.label}</label>
      <div class="slider-track-row">
        <Show when={props.min_icon}>
          <span class="slider-icon" aria-hidden="true">{props.min_icon}</span>
        </Show>
        <input
          id={props.id}
          class="slider-input"
          type="range"
          min={props.min}
          max={props.max}
          step={props.step && props.step > 0 ? props.step : "any"}
          value={props.value}
          aria-label={props.a11y?.label ?? props.label}
          onInput={(e) => onChange(Number(e.currentTarget.value))}
        />
        <Show when={props.max_icon}>
          <span class="slider-icon" aria-hidden="true">{props.max_icon}</span>
        </Show>
      </div>
    </div>
  );
}
