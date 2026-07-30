// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import type { PresentationProfile } from "../types/presentation";

export function visibleSurfaceIds(
  profile: PresentationProfile | null,
  preparedSurfaceIds: string[],
): string[] {
  if (!profile) return preparedSurfaceIds.slice(0, 1);
  if (profile.pane_layout === "single") return [profile.active_surface];
  return [
    profile.primary_surface,
    ...(profile.detail_surface ? [profile.detail_surface] : []),
  ];
}
