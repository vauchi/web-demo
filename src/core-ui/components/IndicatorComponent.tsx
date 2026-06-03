// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Show } from "solid-js";
import type { A11y, IndicatorKind } from "../../types/core";

interface Props {
  id: string;
  label: string;
  kind: IndicatorKind;
  action_id?: string | null;
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

// Component::Indicator: a chrome-positioned status chip carrying a terse
// label and a semantic color kind. When action_id is set, tapping emits
// ActionPressed { action_id } (per core docs).
export function IndicatorComponent(props: Props) {
  const kindClass = () => `indicator-${props.kind.toLowerCase()}`;

  const onTap = () => {
    if (props.action_id) {
      props.onAction(JSON.stringify({
        ActionPressed: { action_id: props.action_id }
      }));
    }
  };

  return (
    <Show
      when={props.action_id}
      fallback={
        <span
          class={`component indicator ${kindClass()}`}
          aria-label={props.a11y?.label ?? props.label}
        >
          {props.label}
        </span>
      }
    >
      <button
        class={`component indicator indicator-tappable ${kindClass()}`}
        aria-label={props.a11y?.label ?? props.label}
        onClick={onTap}
      >
        {props.label}
      </button>
    </Show>
  );
}
