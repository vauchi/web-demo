// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// Core may send a display code's `placement`: its side and the offset of
// its top-left corner, in permille of the node's square, and the
// `error_correction` level to draw it at. Absent placement means the code
// fills the square; absent level means medium. Ported from macOS's
// `QrFrameSpec`/`qrCorrectionLevel` (vauchi/private#450).
//
// Traces to: features/generic_presentation_protocol.feature

import { describe, expect, it } from "vitest";
import { qrCorrectionLevel, qrFrameSpec } from "../src/presentation/qrFrame";

describe("qrFrameSpec", () => {
  it("fills the square edge to edge when there is no placement", () => {
    expect(qrFrameSpec(null, 240)).toEqual({ side: 240, left: 0, top: 0 });
  });

  it("fills the square edge to edge when placement is undefined", () => {
    expect(qrFrameSpec(undefined, 240)).toEqual({ side: 240, left: 0, top: 0 });
  });

  it("scales and offsets a placed code within the square", () => {
    expect(qrFrameSpec({ size: 650, x: 350, y: 175 }, 240))
      .toEqual({ side: 156, left: 84, top: 42 });
    expect(qrFrameSpec({ size: 800, x: 200, y: 0 }, 240))
      .toEqual({ side: 192, left: 48, top: 0 });
  });

  // Core never sends these; the shell still must not draw past its node.
  it("pulls a placement reaching outside the square back inside", () => {
    expect(qrFrameSpec({ size: 800, x: 900, y: 5000 }, 240))
      .toEqual({ side: 192, left: 48, top: 48 });
    expect(qrFrameSpec({ size: 4000, x: 10, y: 10 }, 240))
      .toEqual({ side: 240, left: 0, top: 0 });
    expect(qrFrameSpec({ size: 500, x: -20, y: -1 }, 240))
      .toEqual({ side: 120, left: 0, top: 0 });
  });

  it("falls back to the full square for a nonsensical size", () => {
    expect(qrFrameSpec({ size: 0, x: 0, y: 0 }, 240))
      .toEqual({ side: 240, left: 0, top: 0 });
    expect(qrFrameSpec({ size: -5, x: 0, y: 0 }, 240))
      .toEqual({ side: 240, left: 0, top: 0 });
  });
});

describe("qrCorrectionLevel", () => {
  it("draws at low correction when Core asks for it", () => {
    expect(qrCorrectionLevel("low")).toBe("L");
  });

  it("draws at medium when Core sends no level", () => {
    expect(qrCorrectionLevel(null)).toBe("M");
    expect(qrCorrectionLevel(undefined)).toBe("M");
  });

  it("draws at medium for a level this shell does not recognize", () => {
    expect(qrCorrectionLevel("medium")).toBe("M");
    expect(qrCorrectionLevel("ultra")).toBe("M");
  });
});
