// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import type { A11y } from "../../types/core";

interface Props {
  text: string;
  action_label: string;
  action_id: string;
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

export function BannerComponent(props: Props) {
  const handleAction = () => {
    props.onAction(JSON.stringify({
      ActionPressed: { action_id: props.action_id }
    }));
  };

  return (
    <div class="component banner" role="alert" aria-label={props.a11y?.label ?? props.text} title={props.a11y?.hint}>
      <span class="banner-text" id={`${props.action_id}-msg`}>{props.text}</span>
      <button class="banner-action" onClick={handleAction} aria-describedby={`${props.action_id}-msg`}>
        {props.action_label}
      </button>
    </div>
  );
}
