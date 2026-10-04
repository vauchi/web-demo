// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";
import { ContextCommandBar } from "../src/presentation/ContextCommandBar";
import type {
  ActionSpec,
  ContextBar,
  PresentationEvent,
} from "../src/types/presentation";

const action = (id: string, label: string, spoken = label): ActionSpec => ({
  interaction_id: id,
  label,
  accessibility_label: spoken,
  icon_token: null,
  enabled: true,
  shortcut: null,
});

let dispose: (() => void) | null = null;

function mount(bar: ContextBar): { root: HTMLElement; events: PresentationEvent[] } {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const events: PresentationEvent[] = [];
  dispose = render(
    () => (
      <ContextCommandBar
        surfaceId="detail"
        bar={bar}
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

describe("the context bar's info slot (vauchi/private#479)", () => {
  it("draws Core's info action after the launchers, named for assistive tech, and activates it", () => {
    const { root, events } = mount({
      back: action("back", "Back"),
      navigation: null,
      primary: action("primary", "Add"),
      secondary: action("secondary", "More"),
      info: action("presentation.info", "Info", "About this screen"),
    });

    const labels = Array.from(root.querySelectorAll("button")).map((button) =>
      button.getAttribute("aria-label"));
    expect(labels).toEqual(["Back", "Add", "More", "About this screen"]);
    const info = root.querySelector<HTMLButtonElement>(
      'button[data-presentation-id="presentation.info"]',
    );
    expect(info?.textContent).toContain("Info");

    info?.click();
    expect(events).toEqual([
      { ActionActivated: { surface_id: "detail", interaction_id: "presentation.info" } },
    ]);
  });

  it("draws nothing for the slot when an older Core leaves it out", () => {
    const { root } = mount({
      back: null,
      navigation: null,
      primary: action("primary", "Add"),
      secondary: null,
    });

    expect(root.querySelectorAll("button")).toHaveLength(1);
  });
});
