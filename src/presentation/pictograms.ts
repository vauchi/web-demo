// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * Vauchi's own drawings for `pictogram.<group>.<name>` icon tokens, bundled
 * from `src/assets/pictograms/<group>/<name>.svg` (copied from the assets
 * repo's `pictograms/<group>/generated/svg/`). The drawings stroke with
 * `currentColor`, so inline markup takes the surrounding text colour.
 */
const drawingsByPath = import.meta.glob<string>("../assets/pictograms/*/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

const BUNDLED_PATH = /\/([a-z0-9_]+)\/([a-z0-9_]+)\.svg$/;

const markupByToken = new Map<string, string>(
  Object.entries(drawingsByPath).flatMap(([path, svg]): [string, string][] => {
    const match = BUNDLED_PATH.exec(path);
    if (!match) return [];
    return [[`pictogram.${match[1]}.${match[2]}`, svg.slice(svg.indexOf("<svg"))]];
  }),
);

/** The inline `<svg>` for a bundled pictogram token, or null for any other token. */
export function pictogramMarkup(token: string | null): string | null {
  return token ? markupByToken.get(token) ?? null : null;
}
