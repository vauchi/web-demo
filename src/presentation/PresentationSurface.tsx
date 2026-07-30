// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { For, Show } from "solid-js";
import type {
  PresentationEvent,
  SurfaceSpec,
} from "../types/presentation";
import { surfaceActivated } from "./events";
import { PresentationNodeRenderer } from "./PresentationNodeRenderer";

interface Props {
  surface: SurfaceSpec;
  active: boolean;
  onEvent: (event: PresentationEvent) => void;
}

export function PresentationSurface(props: Props) {
  const activate = () => {
    if (!props.active) props.onEvent(surfaceActivated(props.surface.surface_id));
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
      <header>
        <h2>{props.surface.title}</h2>
        <Show when={props.surface.subtitle}>
          {(subtitle) => <p>{subtitle()}</p>}
        </Show>
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
    </section>
  );
}
