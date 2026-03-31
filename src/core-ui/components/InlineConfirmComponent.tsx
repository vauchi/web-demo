// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

interface Props {
  id: string;
  warning: string;
  confirm_text: string;
  cancel_text: string;
  destructive: boolean;
  onAction: (actionJson: string) => void;
}

export function InlineConfirmComponent(props: Props) {
  const onConfirm = () => {
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: `${props.id}_confirm` }
    }));
  };

  const onCancel = () => {
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: `${props.id}_cancel` }
    }));
  };

  return (
    <div
      class="component inline-confirm"
      role="alertdialog"
      aria-label={props.warning}
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
