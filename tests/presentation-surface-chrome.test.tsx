// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";
import { PresentationSurface } from "../src/presentation/PresentationSurface";
import type {
  ActionSpec,
  ContextBar,
  PresentationEvent,
  SurfaceSpec,
} from "../src/types/presentation";

const action = (id: string, label: string, spoken = label): ActionSpec => ({
  interaction_id: id,
  label,
  accessibility_label: spoken,
  icon_token: null,
  enabled: true,
  shortcut: null,
});

const surface = (
  layout: SurfaceSpec["layout"] = "scroll",
): SurfaceSpec => ({
  surface_id: "detail",
  revision: 1,
  title: "Amira Khalil",
  subtitle: null,
  accessibility_label: "Amira Khalil",
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

let dispose: (() => void) | null = null;

function mount(
  bar: ContextBar | null,
  layout: SurfaceSpec["layout"] = "scroll",
): { root: HTMLElement; events: PresentationEvent[] } {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const events: PresentationEvent[] = [];
  dispose = render(
    () => (
      <PresentationSurface
        surface={surface(layout)}
        bar={bar}
        active
        onEvent={(event) => events.push(event)}
      />
    ),
    root,
  );
  return { root, events };
}

afterEach(() => {
  dispose?.();
  dispose = null;
  document.body.innerHTML = "";
});

describe("the context bar retired into the surface's own chrome (vauchi/private#479)", () => {
  it("draws no separate bar above a tab bar; back, info and actions live in the title row", () => {
    const { root, events } = mount({
      back: action("back", "Back"),
      navigation: null,
      primary: action("primary", "Add"),
      secondary: action("secondary", "More"),
      info: action("presentation.info", "Info", "About this screen"),
    });

    expect(root.querySelector(".context-command-bar")).toBeNull();
    expect(root.querySelector('[aria-label="Contextual commands"]')).toBeNull();

    const titleRow = root.querySelector(".surface-title-row");
    expect(titleRow).not.toBeNull();

    const back = titleRow?.querySelector<HTMLButtonElement>(
      'button[data-presentation-id="back"]',
    );
    expect(back?.getAttribute("aria-label")).toBe("Back");

    const info = titleRow?.querySelector<HTMLButtonElement>(
      'button[data-presentation-id="presentation.info"]',
    );
    expect(info?.getAttribute("aria-label")).toBe("About this screen");

    const secondary = titleRow?.querySelector<HTMLButtonElement>(
      'button[data-presentation-id="secondary"]',
    );
    expect(secondary?.getAttribute("aria-label")).toBe("More");

    expect(titleRow?.querySelector("h2")?.textContent).toBe("Amira Khalil");

    info?.click();
    expect(events).toEqual([
      { ActionActivated: { surface_id: "detail", interaction_id: "presentation.info" } },
    ]);
  });

  it("draws the primary action as a full-width button inside the surface content, not the title row", () => {
    const { root, events } = mount({
      back: null,
      navigation: null,
      primary: action("primary", "Add Entry"),
      secondary: null,
    });

    const titleRow = root.querySelector(".surface-title-row");
    expect(titleRow?.querySelector('[data-presentation-id="primary"]')).toBeNull();

    const primary = root.querySelector<HTMLButtonElement>(
      '.surface-primary button[data-presentation-id="primary"]',
    );
    expect(primary?.textContent).toBe("Add Entry");

    primary?.click();
    expect(events).toEqual([
      { ActionActivated: { surface_id: "detail", interaction_id: "primary" } },
    ]);
  });

  it("draws the navigation launcher at the leading end when Core sends one", () => {
    const { root } = mount({
      back: null,
      navigation: action("nav", "Navigate"),
      primary: null,
      secondary: null,
    });

    const titleRow = root.querySelector(".surface-title-row");
    const nav = titleRow?.querySelector<HTMLButtonElement>(
      'button[data-presentation-id="nav"]',
    );
    expect(nav?.getAttribute("aria-label")).toBe("Navigate");
  });

  it("takes no space for an absent slot and tolerates a missing bar entirely", () => {
    const { root } = mount({
      back: null,
      navigation: null,
      primary: null,
      secondary: null,
    });

    expect(root.querySelectorAll("button")).toHaveLength(0);
    expect(root.querySelector(".surface-primary")).toBeNull();

    dispose?.();
    document.body.innerHTML = "";
    const { root: noBarRoot } = mount(null);
    expect(noBarRoot.querySelectorAll("button")).toHaveLength(0);
  });
});
