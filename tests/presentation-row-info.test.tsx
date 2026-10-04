// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";
import { PresentationNodeRenderer } from "../src/presentation/PresentationNodeRenderer";
import type {
  ActionSpec,
  PresentationEvent,
  PresentationNode,
} from "../src/types/presentation";

const info: ActionSpec = {
  interaction_id: "surface.7.interaction.3",
  label: "Info",
  accessibility_label: "About Home address",
  icon_token: null,
  enabled: true,
  shortcut: null,
};

const list = (rowInfo: ActionSpec | undefined): PresentationNode => ({
  List: {
    id: "entries",
    label: null,
    rows: [{
      title: "Home address",
      subtitle: null,
      detail: null,
      icon_token: null,
      image_data: null,
      fallback_text: null,
      selected: false,
      enabled: true,
      activation: null,
      secondary_actions: [],
      controls: [],
      accessibility: { label: "Home address", description: null },
      ...(rowInfo ? { info: rowInfo } : {}),
    }],
    searchable: false,
    paging: null,
    accessibility: { label: "Entries", description: null },
    style: "rows",
  },
} as PresentationNode);

let dispose: (() => void) | null = null;

function mount(node: PresentationNode) {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const events: PresentationEvent[] = [];
  dispose = render(
    () => (
      <PresentationNodeRenderer
        node={node}
        surfaceId="groups"
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

describe("a row's info action (vauchi/private#479)", () => {
  it("is a button named for its item that reports the activation", () => {
    const { root, events } = mount(list(info));

    const button = root.querySelector<HTMLButtonElement>(
      'button[data-presentation-id="surface.7.interaction.3"]',
    );
    expect(button?.getAttribute("aria-label")).toBe("About Home address");
    button?.click();
    expect(events).toEqual([
      { ActionActivated: { surface_id: "groups", interaction_id: "surface.7.interaction.3" } },
    ]);
  });

  it("is absent from a row an older Core sends", () => {
    const { root } = mount(list(undefined));

    expect(root.querySelectorAll("button")).toHaveLength(0);
  });
});
