// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import type { A11y } from "../../types/core";

interface Props {
  id: string;
  warning: string;
  confirm_text: string;
  cancel_text: string;
  destructive: boolean;
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

export function InlineConfirmComponent(props: Props) {
  const onConfirm = () => {
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: `confirm_${props.id}` }
    }));
  };

  const onCancel = () => {
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: `cancel_${props.id}` }
    }));
  };

  return (
    <div
      class="component inline-confirm"
      role="alert"
      aria-label={props.a11y?.label ?? props.warning}
      title={props.a11y?.hint}
    >
      <p class="inline-confirm-warning">{props.warning}</p>
      <div class="inline-confirm-actions">
        <button class="btn-cancel" onClick={onCancel}>
          {props.cancel_text}
        </button>
        <button
          class={props.destructive ? "btn-destructive" : "btn-confirm"}
          onClick={onConfirm}
        >
          {props.confirm_text}
        </button>
      </div>
    </div>
  );
}
