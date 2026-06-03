// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type { A11y, FieldDisplay, PreviewVariant } from "../../types/core";

interface Props {
  name: string;
  initials: string;
  avatar_data?: number[] | null;
  fields: FieldDisplay[];
  variants: PreviewVariant[];
  selected_variant: string | null;
  /**
   * Pre-filtered list emitted by core's `build_visible_fields` helper
   * (ADR-021/043). Render this directly rather than reproducing the
   * filter in TS. Falls back to `fields` when absent.
   */
  visible_fields?: FieldDisplay[];
  a11y?: A11y;
  onAction: (actionJson: string) => void;
}

// Component::Preview: a card preview with selectable per-variant views.
// Reuses GroupViewSelected (variant_id maps onto group_name on the wire).
export function PreviewComponent(props: Props) {
  const selectVariant = (variantId: string | null) => {
    props.onAction(JSON.stringify({
      GroupViewSelected: { group_name: variantId }
    }));
  };

  const activeFields = () => props.visible_fields ?? props.fields;

  return (
    <div class="component preview" aria-label={props.a11y?.label ?? `Preview: ${props.name}`} title={props.a11y?.hint}>
      <Show when={props.variants.length > 0}>
        <div class="preview-variant-tabs">
          <button
            class={`preview-tab ${props.selected_variant === null ? "preview-tab-active" : ""}`}
            onClick={() => selectVariant(null)}
          >
            All
          </button>
          <For each={props.variants}>
            {(variant) => (
              <button
                class={`preview-tab ${props.selected_variant === variant.variant_id ? "preview-tab-active" : ""}`}
                onClick={() => selectVariant(variant.variant_id)}
              >
                {variant.display_name}
              </button>
            )}
          </For>
        </div>
      </Show>
      <div class="preview-header">
        <div class="preview-avatar">{props.initials}</div>
        <h3 class="preview-name">{props.name}</h3>
      </div>
      <div class="preview-fields">
        <For each={activeFields()}>
          {(field) => (
            <div class="preview-field-row">
              <span class="preview-field-label">{field.label}</span>
              <span class="preview-field-value">{field.value}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
