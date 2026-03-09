// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Match, Switch } from "solid-js";
import type { FieldDisplay, VisibilityMode, UiFieldVisibility } from "../../types/core";

interface Props {
  id: string;
  fields: FieldDisplay[];
  visibility_mode: VisibilityMode;
  available_groups: string[];
  onAction: (actionJson: string) => void;
}

function VisibilityBadge(props: { visibility: UiFieldVisibility; mode: VisibilityMode }) {
  return (
    <div class="field-visibility">
      <Switch>
        <Match when={props.visibility === "Shown"}>
          <span class="visibility-icon visibility-shown" title="Visible">&#128065;</span>
        </Match>
        <Match when={props.visibility === "Hidden"}>
          <span class="visibility-icon visibility-hidden" title="Hidden">&#128683;</span>
        </Match>
        <Match when={typeof props.visibility === "object" && "Groups" in (props.visibility as object)}>
          <For each={(props.visibility as { Groups: string[] }).Groups}>
            {(group) => <span class="group-badge">{group}</span>}
          </For>
        </Match>
      </Switch>
    </div>
  );
}

export function FieldListComponent(props: Props) {
  return (
    <div class="component field-list">
      <For each={props.fields}>
        {(field) => (
          <div class="field-row">
            <div class="field-info">
              <span class="field-label">{field.label}</span>
              <span class="field-value">{field.value}</span>
            </div>
            <VisibilityBadge visibility={field.visibility} mode={props.visibility_mode} />
          </div>
        )}
      </For>
    </div>
  );
}
