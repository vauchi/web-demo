// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import type {
  BindingId,
  InputMode,
  InputValue,
  InteractionId,
  OverlayKind,
  PresentationEvent,
  SurfaceId,
} from "../types/presentation";

export const surfaceActivated = (surfaceId: SurfaceId): PresentationEvent => ({
  SurfaceActivated: { surface_id: surfaceId },
});

export const actionActivated = (
  surfaceId: SurfaceId,
  interactionId: InteractionId,
): PresentationEvent => ({
  ActionActivated: {
    surface_id: surfaceId,
    interaction_id: interactionId,
  },
});

export const valueChanged = (
  surfaceId: SurfaceId,
  bindingId: BindingId,
  value: InputValue,
): PresentationEvent => ({
  ValueChanged: {
    surface_id: surfaceId,
    binding_id: bindingId,
    value,
  },
});

/// Enter in a field. Core decides whether the screen does anything with
/// it; most do not.
export const inputSubmitted = (
  surfaceId: SurfaceId,
  bindingId: BindingId,
): PresentationEvent => ({
  InputSubmitted: { surface_id: surfaceId, binding_id: bindingId },
});

/// A field lost focus without the user having submitted, so Core can
/// offer a way to commit text left behind rather than committing it on
/// the user's behalf.
export const inputFocusEnded = (
  surfaceId: SurfaceId,
  bindingId: BindingId,
): PresentationEvent => ({
  InputFocusEnded: { surface_id: surfaceId, binding_id: bindingId },
});

export const backRequested = (surfaceId: SurfaceId): PresentationEvent => ({
  BackRequested: { surface_id: surfaceId },
});

export const overlayDismissed = (
  surfaceId: SurfaceId,
  kind: OverlayKind,
): PresentationEvent => ({
  OverlayDismissed: { surface_id: surfaceId, kind },
});

export const environmentChanged = (
  availableWidth: number,
  availableHeight: number,
  inputModes: InputMode[],
  reducedMotion: boolean,
): PresentationEvent => ({
  PresentationEnvironmentChanged: {
    available_width: Math.max(0, Math.round(availableWidth)),
    available_height: Math.max(0, Math.round(availableHeight)),
    input_modes: inputModes,
    motion: reducedMotion ? "reduced" : "full",
  },
});
