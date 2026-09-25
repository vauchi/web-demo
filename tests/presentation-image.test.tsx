// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";
import { PresentationNodeRenderer } from "../src/presentation/PresentationNodeRenderer";
import type { PresentationNode } from "../src/types/presentation";

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function imageNode(
  brightness: number,
  overrides: { size?: number; data?: number[] | null; fallback_text?: string | null } = {},
): PresentationNode {
  return {
    Image: {
      id: null,
      data: overrides.data === undefined ? PNG_SIGNATURE : overrides.data,
      fallback_text: overrides.fallback_text ?? "Vauchi",
      shape: "natural",
      size: overrides.size,
      brightness,
      activation: null,
      accessibility: { label: "Vauchi", description: null },
    },
  };
}

let dispose: (() => void) | null = null;

function mountImage(node: PresentationNode): HTMLElement {
  const root = document.createElement("div");
  document.body.appendChild(root);
  dispose = render(
    () => <PresentationNodeRenderer node={node} surfaceId="onboarding" onEvent={() => {}} />,
    root,
  );
  const box = root.querySelector(".presentation-image");
  if (!box) throw new Error("the image node rendered no .presentation-image container");
  return box as HTMLElement;
}

function renderedFilter(node: PresentationNode): string {
  const img = mountImage(node).querySelector("img");
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

// Core omits `size` entirely for every avatar and sends it only for the
// onboarding mark (core/vauchi-app/fixtures/presentation_contract_v1.json).
// Absent must reproduce today's unsized behaviour exactly.
describe("image size", () => {
  it("leaves an unsized picture without a sizing class or custom property", () => {
    const box = mountImage(imageNode(0));
    expect(box.classList.contains("presentation-image-sized")).toBe(false);
    expect(box.style.getPropertyValue("--presentation-image-size")).toBe("");
  });

  it("sizes a picture into a square of the requested logical units", () => {
    const box = mountImage(imageNode(0, { size: 88 }));
    expect(box.classList.contains("presentation-image-sized")).toBe(true);
    expect(box.style.getPropertyValue("--presentation-image-size")).toBe("88px");
  });

  it("sizes the fallback into the same square when there is no image data", () => {
    const box = mountImage(imageNode(0, { size: 88, data: null, fallback_text: "Vauchi" }));
    expect(box.querySelector("img")).toBeNull();
    expect(box.textContent).toBe("Vauchi");
    expect(box.classList.contains("presentation-image-sized")).toBe(true);
    expect(box.style.getPropertyValue("--presentation-image-size")).toBe("88px");
  });
});
