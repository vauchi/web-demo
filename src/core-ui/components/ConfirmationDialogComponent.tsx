// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

interface Props {
  id: string;
  title: string;
  message: string;
  confirm_text: string;
  destructive: boolean;
  onAction: (actionJson: string) => void;
}

export function ConfirmationDialogComponent(props: Props) {
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

  const onBackdropClick = (e: MouseEvent) => {
    // Only dismiss if clicking the backdrop itself, not the dialog content
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div class="dialog-backdrop" onClick={onBackdropClick}>
      <div class="component confirmation-dialog">
        <h4 class="dialog-title">{props.title}</h4>
        <p class="dialog-message">{props.message}</p>
        <div class="dialog-actions">
          <button class="btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            class={props.destructive ? "btn-destructive" : "btn-confirm"}
            onClick={onConfirm}
          >
            {props.confirm_text}
          </button>
        </div>
      </div>
    </div>
  );
}
