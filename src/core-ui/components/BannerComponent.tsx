// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

interface Props {
  text: string;
  action_label: string;
  action_id: string;
  onAction: (actionJson: string) => void;
}

export function BannerComponent(props: Props) {
  const handleAction = () => {
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: props.action_id }
    }));
  };

  return (
    <div class="component banner" role="status">
      <span class="banner-text" id={`${props.action_id}-msg`}>{props.text}</span>
      <button class="banner-action" onClick={handleAction} aria-describedby={`${props.action_id}-msg`}>
        {props.action_label}
      </button>
    </div>
  );
}
