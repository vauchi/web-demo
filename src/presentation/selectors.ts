// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import type { SurfaceId, WindowClass } from "../types/presentation";
import type { PresentationState } from "./state";

// Core's profile owns the active surface when it has sent one. Before
// that (and in the screen catalog, which replays batches without a
// profile) the last surface a batch replaced is the one the user opened.
export function activeSurfaceId(
  state: PresentationState,
  windowClass: WindowClass,
): SurfaceId | null {
  return visibleSurfaceIds(state, windowClass).at(-1) ?? null;
}

export function visibleSurfaceIds(
  state: PresentationState,
  windowClass: WindowClass,
): SurfaceId[] {
  const { profile } = state;
  if (profile) {
    if (profile.pane_layout === "single") return [profile.active_surface];
    return [
      profile.primary_surface,
      ...(profile.detail_surface ? [profile.detail_surface] : []),
    ];
  }
  const active = state.activeSurface ?? Object.keys(state.surfaces)[0];
  if (active === undefined) return [];
  const companion = windowClass === "compact"
    ? undefined
    : Object.values(state.surfaces).find((surface) => (
      surface.layout === "pinned" && surface.surface_id !== active
    ));
  return companion ? [companion.surface_id, active] : [active];
}
