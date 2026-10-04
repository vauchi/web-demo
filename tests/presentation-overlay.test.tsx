// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";
import { PresentationOverlay } from "../src/presentation/PresentationOverlay";
import type { OverlaySpec } from "../src/types/presentation";

let dispose: (() => void) | null = null;

function mount(overlay: OverlaySpec): { root: HTMLElement; dismissed: number } {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const counter = { root, dismissed: 0 };
  dispose = render(
    () => (
      <PresentationOverlay
        surfaceId="detail"
        overlay={overlay}
        reducedMotion={true}
        onAction={() => {}}
        onDismiss={() => {
          counter.dismissed += 1;
        }}
      />
    ),
    root,
  );
  return counter;
}

afterEach(() => {
  dispose?.();
  dispose = null;
  document.body.innerHTML = "";
});

describe("an information overlay (vauchi/private#479)", () => {
  it("is a dialog that shows Core's text, offers no items, and closes", () => {
    const mounted = mount({
      kind: "information",
      title: "Contacts",
      items: [],
      body: "Here are the people you have exchanged cards with.",
    });

    const dialog = mounted.root.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog?.getAttribute("aria-label")).toBe("Contacts");
    expect(dialog?.textContent).toContain("Here are the people you have exchanged cards with.");
    expect(mounted.root.querySelectorAll(".presentation-overlay-items button")).toHaveLength(0);

    mounted.root.querySelector<HTMLButtonElement>(".presentation-overlay-close")?.click();
    expect(mounted.dismissed).toBe(1);
  });

  it("still lists the items of an action menu without a body", () => {
    const mounted = mount({
      kind: "action_menu",
      title: "Actions",
      items: [{
        interaction_id: "edit",
        label: "Edit",
        accessibility_label: "Edit",
        icon_token: null,
        enabled: true,
        shortcut: null,
      }],
    });

    expect(mounted.root.querySelectorAll(".presentation-overlay-items button")).toHaveLength(1);
  });
});
