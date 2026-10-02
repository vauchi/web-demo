// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";
import { PresentationNodeRenderer } from "../src/presentation/PresentationNodeRenderer";
import { pictogramMarkup } from "../src/presentation/pictograms";
import type { PresentationNode } from "../src/types/presentation";

const BUNDLED_EXCHANGE_PICTOGRAMS = [
  "glance",
  "hover",
  "bump",
  "shake",
  "magic",
  "tap_tap",
  "tap_hover_shake",
  "link",
  "cable",
];

function listWithRow(iconToken: string | null, imageData: number[] | null = null): PresentationNode {
  return {
    List: {
      id: "modes",
      label: null,
      rows: [
        {
          title: "Hover",
          subtitle: "Hold your phone over theirs",
          detail: null,
          icon_token: iconToken,
          image_data: imageData,
          fallback_text: null,
          selected: false,
          enabled: true,
          activation: null,
          secondary_actions: [],
          controls: [],
          accessibility: { label: "Hover", description: null },
        },
      ],
      searchable: false,
      paging: null,
      accessibility: { label: "Exchange modes", description: null },
    },
  };
}

let dispose: (() => void) | null = null;

function mountRow(node: PresentationNode): HTMLElement {
  const root = document.createElement("div");
  document.body.appendChild(root);
  dispose = render(
    () => <PresentationNodeRenderer node={node} surfaceId="exchange" onEvent={() => {}} />,
    root,
  );
  const row = root.querySelector(".presentation-row");
  if (!row) throw new Error("the list rendered no .presentation-row");
  return row as HTMLElement;
}

afterEach(() => {
  dispose?.();
  dispose = null;
  document.body.innerHTML = "";
});

describe("pictogram icon tokens", () => {
  it.each(BUNDLED_EXCHANGE_PICTOGRAMS)("bundles a drawing for pictogram.exchange.%s", (name) => {
    const markup = pictogramMarkup(`pictogram.exchange.${name}`);
    expect(markup).toMatch(/<svg[^>]*viewBox="0 0 24 24"/);
    expect(markup).toContain('stroke="currentColor"');
  });

  it.each([
    "pictogram.exchange.not_a_mode",
    "pictogram.unknown_group.hover",
    "pictogram.exchange",
    "pictogram.exchange.hover.extra",
    "pictogram.exchange.../hover",
    "pictogram.__proto__.constructor",
    "pictogram.exchange.HOVER",
    "exchange.hover",
    "person.2",
    "",
  ])("resolves %j to no drawing", (token) => {
    expect(pictogramMarkup(token)).toBeNull();
  });

  it("draws a row's pictogram inline in the text colour", () => {
    const svg = mountRow(listWithRow("pictogram.exchange.hover")).querySelector("svg");
    if (!svg) throw new Error("the row rendered no inline <svg>");
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.querySelectorAll("path")).toHaveLength(15);
  });

  it("draws nothing for a pictogram this build does not bundle", () => {
    const row = mountRow(listWithRow("pictogram.exchange.not_a_mode"));
    expect(row.querySelector("svg")).toBeNull();
    expect(row.textContent).toContain("Hover");
  });

  it("draws nothing for a non-pictogram token, as before", () => {
    expect(mountRow(listWithRow("person.2")).querySelector("svg")).toBeNull();
  });

  it("keeps a row's own picture ahead of its pictogram", () => {
    const row = mountRow(listWithRow("pictogram.exchange.hover", [82, 73, 70, 70]));
    expect(row.querySelector("img")).not.toBeNull();
    expect(row.querySelector("svg")).toBeNull();
  });
});
