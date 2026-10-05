// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

// A display code is drawn inside a white/light square, at Core's placement
// and error-correction level — absent placement fills the square, absent
// level draws at medium (vauchi/private#450, as on iOS/macOS).
//
// Traces to: features/generic_presentation_protocol.feature

import { render } from "solid-js/web";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PresentationNode } from "../src/types/presentation";

const toDataURL = vi.fn((
  _payload: string,
  options: { errorCorrectionLevel: string; width: number },
) => Promise.resolve(`data:image/png;base64,${options.errorCorrectionLevel}-${options.width}`));

vi.mock("qrcode", () => ({ default: { toDataURL }, toDataURL }));

const { QrPresentation } = await import("../src/presentation/QrPresentation");

type QrNode = Extract<PresentationNode, { Qr: unknown }>["Qr"];

function qrNode(overrides: {
  placement?: { size: number; x: number; y: number } | null;
  error_correction?: "low" | "medium" | null;
} = {}): QrNode {
  return {
    id: "own_qr",
    payloads: ["FRAME"],
    purpose: "display",
    label: null,
    placement: overrides.placement,
    error_correction: overrides.error_correction,
    accessibility: { label: "Your code", description: null },
  };
}

let dispose: (() => void) | null = null;

function mountQr(node: QrNode): HTMLElement {
  const root = document.createElement("div");
  document.body.appendChild(root);
  dispose = render(
    () => <QrPresentation node={node} surfaceId="exchange" onEvent={() => {}} />,
    root,
  );
  return root;
}

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(() => {
  dispose?.();
  dispose = null;
  document.body.innerHTML = "";
  toDataURL.mockClear();
});

describe("display QR placement", () => {
  it("fills the square when Core sends no placement", async () => {
    const root = mountQr(qrNode());
    await flush();
    const img = root.querySelector<HTMLImageElement>(".presentation-qr-code");
    if (!img) throw new Error("no QR code image rendered");
    expect(img.style.width).toBe("240px");
    expect(img.style.height).toBe("240px");
    expect(img.style.left).toBe("0px");
    expect(img.style.top).toBe("0px");
  });

  it("scales and offsets the code within the square at Core's placement", async () => {
    const root = mountQr(qrNode({ placement: { size: 650, x: 350, y: 175 } }));
    await flush();
    const img = root.querySelector<HTMLImageElement>(".presentation-qr-code");
    if (!img) throw new Error("no QR code image rendered");
    expect(img.style.width).toBe("156px");
    expect(img.style.height).toBe("156px");
    expect(img.style.left).toBe("84px");
    expect(img.style.top).toBe("42px");
  });
});

describe("display QR error correction", () => {
  it("gives the QR generator the low level when Core asks for it", async () => {
    mountQr(qrNode({ error_correction: "low" }));
    await flush();
    expect(toDataURL).toHaveBeenCalledWith(
      "FRAME",
      expect.objectContaining({ errorCorrectionLevel: "L" }),
    );
  });

  it("gives the QR generator medium when Core sends no level", async () => {
    mountQr(qrNode());
    await flush();
    expect(toDataURL).toHaveBeenCalledWith(
      "FRAME",
      expect.objectContaining({ errorCorrectionLevel: "M" }),
    );
  });
});
