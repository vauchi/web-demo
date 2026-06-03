// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For } from "solid-js";
import type { Component } from "../../types/core";
import { ComponentRenderer } from "../ComponentRenderer";

interface Props {
  id: string;
  items: Component[];
  onAction: (actionJson: string) => void;
}

// Horizontal container: renders children left-to-right (CSS flex row).
// Each child is bounded with `flex: 1` so a full-width child cannot
// overflow/overlap its siblings.
export function RowComponent(props: Props) {
  return (
    <div class="component row" id={props.id} style={{ display: "flex", "flex-direction": "row", gap: "12px" }}>
      <For each={props.items}>
        {(child) => (
          <div class="row-cell" style={{ flex: "1 1 0", "min-width": "0" }}>
            <ComponentRenderer component={child} onAction={props.onAction} />
          </div>
        )}
      </For>
    </div>
  );
}
