// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import {
  activeSurfaceId,
  visibleSurfaceIds,
} from "../src/presentation/selectors";
import type { PresentationState } from "../src/presentation/state";
import type {
  PresentationProfile,
  SurfaceSpec,
} from "../src/types/presentation";

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

const surface = (
  surfaceId: string,
  layout: SurfaceSpec["layout"] = "scroll",
): SurfaceSpec => ({
  surface_id: surfaceId,
  revision: 1,
  title: surfaceId,
  subtitle: null,
  accessibility_label: surfaceId,
  layout,
  tokens: {
    spacing_small: 4,
    spacing_medium: 8,
    spacing_large: 16,
    corner_radius: 8,
    minimum_target_size: 44,
  },
  nodes: [],
});

// Insertion order is the order Core replaced the surfaces in.
const state = (
  surfaces: SurfaceSpec[],
  options: {
    profile?: PresentationProfile | null;
    activeSurface?: string | null;
  } = {},
): PresentationState => ({
  surfaces: Object.fromEntries(surfaces.map((s) => [s.surface_id, s])),
  bars: {},
  profile: options.profile ?? null,
  overlay: null,
  activeSurface: options.activeSurface ?? null,
});

describe("Core-owned surface selection", () => {
  it("renders only Core's active surface in a single-pane profile", () => {
    const current = state(
      [surface("contacts", "pinned"), surface("contact_detail")],
      { profile: profile("single", "contact_detail") },
    );
    expect(visibleSurfaceIds(current, "compact")).toEqual(["contact_detail"]);
    expect(activeSurfaceId(current, "compact")).toBe("contact_detail");
  });

  it("renders Core's ordered primary and detail panes in split mode", () => {
    const current = state(
      [surface("contact_detail"), surface("contacts", "pinned")],
      { profile: profile("split", "contact_detail") },
    );
    expect(visibleSurfaceIds(current, "expanded"))
      .toEqual(["contacts", "contact_detail"]);
  });

  it("falls back to the first prepared surface before the profile arrives", () => {
    const current = state([surface("onboarding")]);
    expect(visibleSurfaceIds(current, "compact")).toEqual(["onboarding"]);
    expect(activeSurfaceId(current, "compact")).toBe("onboarding");
  });

  it("renders nothing while no surface is prepared", () => {
    expect(visibleSurfaceIds(state([]), "expanded")).toEqual([]);
    expect(activeSurfaceId(state([]), "expanded")).toBeNull();
  });
});

// A sub-screen batch replaces the pinned parent pane and then the
// sub-screen, with no profile (the screen catalog, and the live shell
// before Core's first profile). The sub-screen is what the user opened.
describe("profile-less sub-screen batches", () => {
  const subScreen = state(
    [surface("contacts", "pinned"), surface("contact_detail")],
    { activeSurface: "contact_detail" },
  );

  it("shows the sub-screen beside its pinned parent when wide", () => {
    expect(visibleSurfaceIds(subScreen, "expanded"))
      .toEqual(["contacts", "contact_detail"]);
    expect(visibleSurfaceIds(subScreen, "medium"))
      .toEqual(["contacts", "contact_detail"]);
    expect(activeSurfaceId(subScreen, "expanded")).toBe("contact_detail");
  });

  it("shows only the sub-screen when compact", () => {
    expect(visibleSurfaceIds(subScreen, "compact")).toEqual(["contact_detail"]);
    expect(activeSurfaceId(subScreen, "compact")).toBe("contact_detail");
  });

  it("does not pair a sub-screen with a scrolling parent", () => {
    const settings = state(
      [surface("settings"), surface("settings_advanced")],
      { activeSurface: "settings_advanced" },
    );
    expect(visibleSurfaceIds(settings, "expanded"))
      .toEqual(["settings_advanced"]);
  });

  it("shows a pinned surface alone when it is the active one", () => {
    const contacts = state([surface("contacts", "pinned")], {
      activeSurface: "contacts",
    });
    expect(visibleSurfaceIds(contacts, "expanded")).toEqual(["contacts"]);
  });
});
