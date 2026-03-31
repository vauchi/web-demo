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

interface VisibilityBadgeProps {
  field_id: string;
  visibility: UiFieldVisibility;
  mode: VisibilityMode;
  onAction: (actionJson: string) => void;
}

function VisibilityBadge(props: VisibilityBadgeProps) {
  const toggleVisibility = () => {
    const visible = props.visibility === "Hidden";
    props.onAction(JSON.stringify({
      FieldVisibilityChanged: { field_id: props.field_id, group_id: null, visible }
    }));
  };

  const removeGroup = (group: string) => {
    props.onAction(JSON.stringify({
      FieldVisibilityChanged: { field_id: props.field_id, group_id: group, visible: false }
    }));
  };

  return (
    <div class="field-visibility">
      <Switch>
        <Match when={props.visibility === "Shown" && props.mode === "ShowHide"}>
          <span
            class="visibility-icon visibility-shown"
            title="Visible — click to hide"
            role="button"
            tabIndex={0}
            aria-label="Hide field"
            onClick={toggleVisibility}
            onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleVisibility(); } }}
          >&#128065;</span>
        </Match>
        <Match when={props.visibility === "Hidden" && props.mode === "ShowHide"}>
          <span
            class="visibility-icon visibility-hidden"
            title="Hidden — click to show"
            role="button"
            tabIndex={0}
            aria-label="Show field"
            onClick={toggleVisibility}
            onKeyDown={(e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleVisibility(); } }}
          >&#128683;</span>
        </Match>
        <Match when={props.visibility === "Shown"}>
          <span class="visibility-icon visibility-shown" title="Visible">&#128065;</span>
        </Match>
        <Match when={props.visibility === "Hidden"}>
          <span class="visibility-icon visibility-hidden" title="Hidden">&#128683;</span>
        </Match>
        <Match when={typeof props.visibility === "object" && "Groups" in (props.visibility as object)}>
          <For each={(props.visibility as { Groups: string[] }).Groups}>
            {(group) => (
              <span
                class="group-badge"
                role={props.mode === "PerGroup" ? "button" : undefined}
                tabIndex={props.mode === "PerGroup" ? 0 : undefined}
                aria-label={props.mode === "PerGroup" ? `Remove group ${group}` : undefined}
                title={props.mode === "PerGroup" ? "Click to remove" : undefined}
                onClick={props.mode === "PerGroup" ? () => removeGroup(group) : undefined}
                onKeyDown={props.mode === "PerGroup" ? (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); removeGroup(group); } } : undefined}
              >{group}</span>
            )}
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
            <VisibilityBadge field_id={field.id} visibility={field.visibility} mode={props.visibility_mode} onAction={props.onAction} />
          </div>
        )}
      </For>
    </div>
  );
}
