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
    props.onAction(JSON.stringify({ ActionPressed: { action_id: `${props.id}_confirm` } }));
  };

  const onCancel = () => {
    props.onAction(JSON.stringify({ ActionPressed: { action_id: `${props.id}_cancel` } }));
  };

  return (
    <div class="confirmation-dialog">
      <h4>{props.title}</h4>
      <p>{props.message}</p>
      <div class="dialog-actions">
        <button class="action-btn action-secondary" onClick={onCancel}>Cancel</button>
        <button
          class={`action-btn ${props.destructive ? "action-destructive" : "action-primary"}`}
          onClick={onConfirm}
        >
          {props.confirm_text}
        </button>
      </div>
    </div>
  );
}
