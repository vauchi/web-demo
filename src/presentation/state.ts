// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
  ContextBar,
  OverlaySpec,
  PlatformCommand,
  PresentationProfile,
  SurfaceSpec,
} from "../types/presentation";

interface RevisionedBar {
  revision: number;
  bar: ContextBar;
}

interface RevisionedOverlay {
  surface_id: string;
  revision: number;
  overlay: OverlaySpec;
}

export interface PresentationState {
  surfaces: Record<string, SurfaceSpec>;
  bars: Record<string, RevisionedBar>;
  profile: PresentationProfile | null;
  overlay: RevisionedOverlay | null;
}

export type ApplyCommandsResult =
  | {
    ok: true;
    state: PresentationState;
    effects: PlatformCommand[];
  }
  | {
    ok: false;
    error: string;
  };

export const emptyPresentationState = (): PresentationState => ({
  surfaces: {},
  bars: {},
  profile: null,
  overlay: null,
});

const hasVariant = <T extends string>(
  command: PlatformCommand,
  variant: T,
): command is Record<T, unknown> => (
  typeof command === "object"
  && command !== null
  && variant in command
);

export function applyPresentationCommands(
  current: PresentationState,
  commands: PlatformCommand[],
): ApplyCommandsResult {
  const state: PresentationState = {
    surfaces: { ...current.surfaces },
    bars: { ...current.bars },
    profile: current.profile,
    overlay: current.overlay,
  };
  const effects: PlatformCommand[] = [];

  for (const command of commands) {
    if (hasVariant(command, "ReplaceSurface")) {
      const { surface } = command.ReplaceSurface as { surface: SurfaceSpec };
      const previous = state.surfaces[surface.surface_id];
      if (previous && surface.revision <= previous.revision) {
        return {
          ok: false,
          error: `stale surface revision for ${surface.surface_id}`,
        };
      }
      state.surfaces[surface.surface_id] = surface;
      delete state.bars[surface.surface_id];
      if (state.overlay?.surface_id === surface.surface_id) {
        state.overlay = null;
      }
      continue;
    }

    if (hasVariant(command, "SetContextBar")) {
      const value = command.SetContextBar as {
        surface_id: string;
        revision: number;
        bar: ContextBar;
      };
      const surface = state.surfaces[value.surface_id];
      if (!surface || surface.revision !== value.revision) {
        return {
          ok: false,
          error: `context bar revision does not match ${value.surface_id}`,
        };
      }
      state.bars[value.surface_id] = {
        revision: value.revision,
        bar: value.bar,
      };
      continue;
    }

    if (hasVariant(command, "PresentOverlay")) {
      const value = command.PresentOverlay as RevisionedOverlay;
      const surface = state.surfaces[value.surface_id];
      if (!surface || surface.revision !== value.revision) {
        return {
          ok: false,
          error: `overlay revision does not match ${value.surface_id}`,
        };
      }
      state.overlay = value;
      continue;
    }

    if (hasVariant(command, "SetPresentationProfile")) {
      state.profile = (
        command.SetPresentationProfile as { profile: PresentationProfile }
      ).profile;
      continue;
    }

    effects.push(command);
  }

  const profile = state.profile;
  if (profile) {
    const referenced = [
      profile.primary_surface,
      profile.active_surface,
      profile.detail_surface,
    ].filter((surfaceId): surfaceId is string => surfaceId !== null);
    const missing = referenced.find((surfaceId) => !state.surfaces[surfaceId]);
    if (missing) {
      return {
        ok: false,
        error: `presentation profile references unknown surface ${missing}`,
      };
    }
  }

  return { ok: true, state, effects };
}
