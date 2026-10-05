// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import type { PresentationQrErrorCorrection, QrPlacement } from "../types/presentation";

const FULL_PERMILLE = 1000;

/** A display code's side and top-left corner inside a square, in the
 * square's own units. Pure, so it can be asserted without rendering. */
export interface QrFrameSpec {
  side: number;
  left: number;
  top: number;
}

/** No placement, or a size of zero or less, is the full square. Core
 * only sends placements inside the square; a value outside it is pulled
 * back in, so the code is never drawn past its node
 * (vauchi/private#450, as on iOS/macOS). */
export function qrFrameSpec(
  placement: QrPlacement | null | undefined,
  squareSide: number,
): QrFrameSpec {
  if (!placement || placement.size <= 0) {
    return { side: squareSide, left: 0, top: 0 };
  }
  const size = Math.min(placement.size, FULL_PERMILLE);
  const room = FULL_PERMILLE - size;
  const clampToRoom = (offset: number) => Math.min(Math.max(offset, 0), room);
  // Multiply before dividing: 650 * 240 / 1000 is exact.
  const scale = (permille: number) => (permille * squareSide) / FULL_PERMILLE;
  return {
    side: scale(size),
    left: scale(clampToRoom(placement.x)),
    top: scale(clampToRoom(placement.y)),
  };
}

/** Core's error-correction level, mapped to the `qrcode` package's level
 * codes: "low" is L; absent or anything this shell does not recognize is
 * M, the level drawn before this field existed. */
export function qrCorrectionLevel(
  errorCorrection: PresentationQrErrorCorrection | string | null | undefined,
): "L" | "M" {
  return errorCorrection === "low" ? "L" : "M";
}
