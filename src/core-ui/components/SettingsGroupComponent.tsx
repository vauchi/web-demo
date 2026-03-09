// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Match, Switch } from "solid-js";
import type { SettingsItem, SettingsItemKind } from "../../types/core";

interface Props {
  id: string;
  label: string;
  items: SettingsItem[];
  onAction: (actionJson: string) => void;
}

export function SettingsGroupComponent(props: Props) {
  const onToggle = (itemId: string) => {
    props.onAction(JSON.stringify({
      SettingsToggled: { component_id: props.id, item_id: itemId }
    }));
  };

  const onSelect = (itemId: string) => {
    props.onAction(JSON.stringify({
      ListItemSelected: { component_id: props.id, item_id: itemId }
    }));
  };

  return (
    <div class="component settings-group">
      <div class="settings-label">{props.label}</div>
      <div class="settings-items">
        <For each={props.items}>
          {(item) => (
            <div class="settings-item">
              <span class="settings-item-label">{item.label}</span>
              <Switch>
                <Match when={"Toggle" in item.kind && (item.kind as { Toggle: { enabled: boolean } }).Toggle}>
                  {(toggle) => (
                    <input
                      type="checkbox"
                      class="switch"
                      checked={toggle().enabled}
                      onChange={() => onToggle(item.id)}
                    />
                  )}
                </Match>
                <Match when={"Navigation" in item.kind && (item.kind as { Navigation: { detail: string | null } }).Navigation}>
                  {(nav) => (
                    <span class="settings-nav" onClick={() => onSelect(item.id)}>
                      {nav().detail && <span class="settings-detail">{nav().detail}</span>}
                      <span class="nav-arrow">&#8250;</span>
                    </span>
                  )}
                </Match>
                <Match when={"Action" in item.kind && (item.kind as { Action: { destructive: boolean } }).Action}>
                  {(action) => (
                    <button
                      class={`settings-action-link ${action().destructive ? "action-destructive-text" : ""}`}
                      onClick={() => onSelect(item.id)}
                    >
                      &#8250;
                    </button>
                  )}
                </Match>
              </Switch>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
