// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";
import { PresentationNodeRenderer } from "../src/presentation/PresentationNodeRenderer";
import type { PresentationNode } from "../src/types/presentation";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function imageNode(brightness: number): PresentationNode {
  return {
    Image: {
      id: null,
      data: PNG_SIGNATURE,
      fallback_text: "Vauchi",
      shape: "natural",
      brightness,
      activation: null,
      accessibility: { label: "Vauchi", description: null },
    },
  };
}

let dispose: (() => void) | null = null;

function renderedFilter(node: PresentationNode): string {
  const root = document.createElement("div");
  document.body.appendChild(root);
  dispose = render(
    () => <PresentationNodeRenderer node={node} surfaceId="onboarding" onEvent={() => {}} />,
    root,
  );
  const img = root.querySelector("img");
  if (!img) throw new Error("the image node rendered no <img>");
  return img.style.filter;
}

afterEach(() => {
  dispose?.();
  dispose = null;
  document.body.innerHTML = "";
});

// Core's brightness is an offset where 0 leaves the picture unchanged (the
// avatar editor slider runs -0.3...0.3). As a CSS multiplier, 0 painted
// every picture Core sends at rest, avatars and the onboarding mark, black.
describe("image brightness", () => {
  it("leaves a picture at Core's neutral brightness unchanged", () => {
    expect(renderedFilter(imageNode(0))).toBe("brightness(1)");
  });

  it("applies Core's offset around that neutral point", () => {
    expect(renderedFilter(imageNode(-0.2))).toBe("brightness(0.8)");
  });
});
