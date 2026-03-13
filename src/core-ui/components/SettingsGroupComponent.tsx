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
                <Match when={"Value" in item.kind && (item.kind as { Value: { value: string } }).Value}>
                  {(val) => (
                    <span class="settings-value">{val().value}</span>
                  )}
                </Match>
                <Match when={"Link" in item.kind && (item.kind as { Link: { detail: string | null } }).Link}>
                  {(link) => (
                    <span class="settings-nav" onClick={() => onSelect(item.id)}>
                      {link().detail && <span class="settings-detail">{link().detail}</span>}
                      <span class="nav-arrow">&#8250;</span>
                    </span>
                  )}
                </Match>
                <Match when={"Destructive" in item.kind && (item.kind as { Destructive: { label: string } }).Destructive}>
                  {(destructive) => (
                    <button
                      class="settings-action-link action-destructive-text"
                      onClick={() => onSelect(item.id)}
                    >
                      {destructive().label}
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
