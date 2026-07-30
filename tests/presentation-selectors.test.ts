// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import { visibleSurfaceIds } from "../src/presentation/selectors";
import type { PresentationProfile } from "../src/types/presentation";

const profile = (
  paneLayout: "single" | "split",
  activeSurface: string,
): PresentationProfile => ({
  window_class: paneLayout === "single" ? "compact" : "expanded",
  pane_layout: paneLayout,
  primary_surface: "contacts",
  detail_surface: "contact_detail",
  active_surface: activeSurface,
});

describe("Core-owned surface selection", () => {
  it("renders only Core's active surface in a single-pane profile", () => {
    expect(visibleSurfaceIds(profile("single", "contact_detail"), [
      "contacts",
      "contact_detail",
    ])).toEqual(["contact_detail"]);
  });

  it("renders Core's ordered primary and detail panes in split mode", () => {
    expect(visibleSurfaceIds(profile("split", "contact_detail"), [
      "contact_detail",
      "contacts",
    ])).toEqual(["contacts", "contact_detail"]);
  });

  it("falls back to the first prepared surface before the profile arrives", () => {
    expect(visibleSurfaceIds(null, ["onboarding"])).toEqual(["onboarding"]);
  });
});
