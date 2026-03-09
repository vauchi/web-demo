// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For } from "solid-js";
import type { FieldDisplay, GroupCardView } from "../../types/core";

interface Props {
  name: string;
  fields: FieldDisplay[];
  group_views: GroupCardView[];
  selected_group: string | null;
  onAction: (actionJson: string) => void;
}

export function CardPreviewComponent(props: Props) {
  const selectGroup = (groupName: string | null) => {
    props.onAction(JSON.stringify({ GroupViewSelected: { group_name: groupName } }));
  };

  return (
    <div class="card-preview">
      <h3>{props.name}</h3>
      <For each={props.fields}>
        {(field) => (
          <div class="field-item">
            <span class="field-label">{field.label}</span>
            <span class="field-value">{field.value}</span>
          </div>
        )}
      </For>
    </div>
  );
}
