// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For } from "solid-js";
import type { FieldDisplay, VisibilityMode } from "../../types/core";

interface Props {
  id: string;
  fields: FieldDisplay[];
  visibility_mode: VisibilityMode;
  available_groups: string[];
  onAction: (actionJson: string) => void;
}

export function FieldListComponent(props: Props) {
  return (
    <div class="field-list">
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
