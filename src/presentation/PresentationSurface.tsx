// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type {
  ActionSpec,
  ContextBar,
  PresentationEvent,
  SurfaceSpec,
} from "../types/presentation";
import { actionActivated, surfaceActivated } from "./events";
import { PresentationNodeRenderer } from "./PresentationNodeRenderer";

interface Props {
  surface: SurfaceSpec;
  bar?: ContextBar | null;
  active: boolean;
  onEvent: (event: PresentationEvent) => void;
}

interface ChromeButtonProps {
  action: ActionSpec;
  kind: "back" | "navigation" | "info" | "secondary";
  icon: string;
  onActivate: (action: ActionSpec) => void;
}

// The title row carries what the retired bottom row used to (back,
// navigation, info, actions): same icon/label pairing as before, just
// repositioned (vauchi/private#479, owner decision 2026-10-06).
function ChromeButton(props: ChromeButtonProps) {
  return (
    <button
      type="button"
      class={`surface-title-button surface-title-${props.kind}`}
      disabled={!props.action.enabled}
      data-presentation-id={props.action.interaction_id}
      aria-label={props.action.accessibility_label}
      onClick={() => props.onActivate(props.action)}
    >
      <span aria-hidden="true">{props.icon}</span>
      <Show when={props.kind !== "back" && props.kind !== "navigation"}>
        <span class="surface-title-button-label">{props.action.label}</span>
      </Show>
    </button>
  );
}

export function PresentationSurface(props: Props) {
  const activate = () => {
    if (!props.active) props.onEvent(surfaceActivated(props.surface.surface_id));
  };
  const activateAction = (action: ActionSpec) => {
    if (action.enabled) {
      props.onEvent(actionActivated(props.surface.surface_id, action.interaction_id));
    }
  };
  const style = () => ({
    "--surface-space-small": `${props.surface.tokens.spacing_small}px`,
    "--surface-space-medium": `${props.surface.tokens.spacing_medium}px`,
    "--surface-space-large": `${props.surface.tokens.spacing_large}px`,
    "--surface-radius": `${props.surface.tokens.corner_radius}px`,
    "--surface-target": `${props.surface.tokens.minimum_target_size}px`,
  });

  return (
    <section
      class={`presentation-surface presentation-layout-${props.surface.layout}`}
      aria-label={props.surface.accessibility_label}
      data-surface-id={props.surface.surface_id}
      data-active={props.active}
      style={style()}
      onPointerDown={activate}
      onFocusIn={activate}
    >
      <header class="surface-title-row">
        <div class="surface-title-leading">
          <Show when={props.bar?.back}>
            {(action) => (
              <ChromeButton action={action()} kind="back" icon="←" onActivate={activateAction} />
            )}
          </Show>
          <Show when={props.bar?.navigation}>
            {(action) => (
              <ChromeButton
                action={action()}
                kind="navigation"
                icon="☰"
                onActivate={activateAction}
              />
            )}
          </Show>
          <div class="surface-title-text">
            <h2>{props.surface.title}</h2>
            <Show when={props.surface.subtitle}>
              {(subtitle) => <p>{subtitle()}</p>}
            </Show>
          </div>
        </div>
        <div class="surface-title-trailing">
          <Show when={props.bar?.info}>
            {(action) => (
              <ChromeButton action={action()} kind="info" icon="ⓘ" onActivate={activateAction} />
            )}
          </Show>
          <Show when={props.bar?.secondary}>
            {(action) => (
              <ChromeButton
                action={action()}
                kind="secondary"
                icon="⋯"
                onActivate={activateAction}
              />
            )}
          </Show>
        </div>
      </header>
      <div class="presentation-nodes">
        <For each={props.surface.nodes}>
          {(node) => (
            <PresentationNodeRenderer
              node={node}
              surfaceId={props.surface.surface_id}
              onEvent={props.onEvent}
            />
          )}
        </For>
      </div>
      <Show when={props.bar?.primary}>
        {(action) => (
          <div class="surface-primary">
            <button
              type="button"
              class={`surface-primary-button${action().shortcut === "undo" ? " is-undo" : ""}`}
              disabled={!action().enabled}
              data-presentation-id={action().interaction_id}
              aria-label={action().accessibility_label}
              onClick={() => activateAction(action())}
            >
              {action().label}
            </button>
          </div>
        )}
      </Show>
    </section>
  );
}
