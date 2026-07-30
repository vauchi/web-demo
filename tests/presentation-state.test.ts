// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import {
  applyPresentationCommands,
  emptyPresentationState,
} from "../src/presentation/state";
import type {
  ActionSpec,
  PlatformCommand,
  SurfaceSpec,
} from "../src/types/presentation";

const action = (interactionId: string, label: string): ActionSpec => ({
  interaction_id: interactionId,
  label,
  accessibility_label: label,
  icon_token: null,
  enabled: true,
  shortcut: null,
});

const surface = (surfaceId: string, revision: number): SurfaceSpec => ({
  surface_id: surfaceId,
  revision,
  title: "Prepared by Core",
  subtitle: null,
  accessibility_label: "Prepared by Core",
  layout: "scroll",
  tokens: {
    spacing_small: 4,
    spacing_medium: 8,
    spacing_large: 16,
    corner_radius: 8,
    minimum_target_size: 44,
  },
  nodes: [],
});

describe("presentation command cache", () => {
  it("atomically applies Core's prepared surface, context bar, and profile", () => {
    const commands: PlatformCommand[] = [
      { ReplaceSurface: { surface: surface("main", 1) } },
      {
        SetContextBar: {
          surface_id: "main",
          revision: 1,
          bar: {
            back: action("back", "Back"),
            navigation: action("navigation", "Navigate"),
            primary: action("save", "Save"),
            secondary: action("more", "More"),
          },
        },
      },
      {
        SetPresentationProfile: {
          profile: {
            window_class: "compact",
            pane_layout: "single",
            primary_surface: "main",
            detail_surface: null,
            active_surface: "main",
          },
        },
      },
    ];

    const result = applyPresentationCommands(
      emptyPresentationState(),
      commands,
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.surfaces.main.revision).toBe(1);
    expect(result.state.bars.main.bar.primary?.label).toBe("Save");
    expect(result.state.profile?.active_surface).toBe("main");
    expect(result.effects).toEqual([]);
  });

  it("rejects an entire stale transaction without changing visible state", () => {
    const initial = applyPresentationCommands(emptyPresentationState(), [
      { ReplaceSurface: { surface: surface("main", 2) } },
    ]);
    expect(initial.ok).toBe(true);
    if (!initial.ok) return;

    const stale = applyPresentationCommands(initial.state, [
      { ReplaceSurface: { surface: surface("main", 1) } },
      {
        SetContextBar: {
          surface_id: "main",
          revision: 1,
          bar: {
            back: null,
            navigation: null,
            primary: action("stale", "Stale"),
            secondary: null,
          },
        },
      },
    ]);

    expect(stale).toEqual({
      ok: false,
      error: "stale surface revision for main",
    });
    expect(initial.state.surfaces.main.revision).toBe(2);
  });

  it("clears stale chrome when Core replaces a surface", () => {
    const initial = applyPresentationCommands(emptyPresentationState(), [
      { ReplaceSurface: { surface: surface("main", 1) } },
      {
        SetContextBar: {
          surface_id: "main",
          revision: 1,
          bar: {
            back: null,
            navigation: null,
            primary: action("save", "Save"),
            secondary: null,
          },
        },
      },
    ]);
    expect(initial.ok).toBe(true);
    if (!initial.ok) return;

    const replaced = applyPresentationCommands(initial.state, [
      { ReplaceSurface: { surface: surface("main", 2) } },
    ]);

    expect(replaced.ok).toBe(true);
    if (!replaced.ok) return;
    expect(replaced.state.bars.main).toBeUndefined();
  });

  it("retains structurally distinct overlay kinds at reduced motion", () => {
    const initial = applyPresentationCommands(emptyPresentationState(), [
      { ReplaceSurface: { surface: surface("main", 1) } },
    ]);
    expect(initial.ok).toBe(true);
    if (!initial.ok) return;

    const navigation = applyPresentationCommands(initial.state, [
      {
        PresentOverlay: {
          surface_id: "main",
          revision: 1,
          overlay: {
            kind: "navigation",
            title: "Navigate",
            items: [action("contacts", "Contacts")],
          },
        },
      },
    ]);
    expect(navigation.ok).toBe(true);
    if (!navigation.ok) return;
    expect(navigation.state.overlay?.overlay.kind).toBe("navigation");

    const actions = applyPresentationCommands(navigation.state, [
      {
        PresentOverlay: {
          surface_id: "main",
          revision: 1,
          overlay: {
            kind: "action_menu",
            title: "More",
            items: [action("archive", "Archive")],
          },
        },
      },
    ]);
    expect(actions.ok).toBe(true);
    if (!actions.ok) return;
    expect(actions.state.overlay?.overlay.kind).toBe("action_menu");
  });

  it("returns native effects without teaching the renderer their meaning", () => {
    const command: PlatformCommand = {
      OpenExternalUrl: { url: "https://vauchi.app/" },
    };

    const result = applyPresentationCommands(
      emptyPresentationState(),
      [command],
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.effects).toEqual([command]);
  });

  it("preserves prepared selection and causal Undo through responsive profiles", () => {
    const selectedSurface = surface("detail", 4);
    selectedSurface.nodes = [{
      Choice: {
        binding_id: "trust",
        label: "Trust",
        selected: "verified",
        options: [{ id: "verified", label: "Verified" }],
        enabled: true,
        accessibility: { label: "Trust", description: null },
      },
    }];
    const undo = action("undo.archive", "Undo archive");
    undo.shortcut = "undo";
    const initial = applyPresentationCommands(emptyPresentationState(), [
      { ReplaceSurface: { surface: selectedSurface } },
      {
        SetContextBar: {
          surface_id: "detail",
          revision: 4,
          bar: {
            back: null,
            navigation: action("navigate", "Navigate"),
            primary: undo,
            secondary: null,
          },
        },
      },
      {
        SetPresentationProfile: {
          profile: {
            window_class: "compact",
            pane_layout: "single",
            primary_surface: "detail",
            detail_surface: null,
            active_surface: "detail",
          },
        },
      },
    ]);
    expect(initial.ok).toBe(true);
    if (!initial.ok) return;

    const expanded = applyPresentationCommands(initial.state, [{
      SetPresentationProfile: {
        profile: {
          window_class: "expanded",
          pane_layout: "single",
          primary_surface: "detail",
          detail_surface: null,
          active_surface: "detail",
        },
      },
    }]);

    expect(expanded.ok).toBe(true);
    if (!expanded.ok) return;
    expect(expanded.state.surfaces.detail.nodes).toEqual(selectedSurface.nodes);
    expect(expanded.state.bars.detail.bar.primary?.shortcut).toBe("undo");
    expect(expanded.state.profile?.active_surface).toBe("detail");
  });
});
