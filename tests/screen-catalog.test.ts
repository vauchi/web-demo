// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  parseScreenCatalog,
  reduceCatalogEntry,
  selectCatalogEntry,
} from "../src/presentation/catalog";

const smokeCatalog = () => parseScreenCatalog(JSON.parse(readFileSync(
  join(__dirname, "fixtures", "screen_catalog_smoke.json"),
  "utf8",
)));

describe("screen catalog", () => {
  it("reduces every catalog entry into the surface Core prepared for it", () => {
    const catalog = smokeCatalog();
    expect(catalog.screens).toHaveLength(2);

    const titles = catalog.screens.map((entry) => {
      const result = reduceCatalogEntry(entry);
      expect(result.ok, `${entry.code_id}: ${result.ok ? "" : result.error}`)
        .toBe(true);
      if (!result.ok) return null;
      const surfaces = Object.values(result.state.surfaces);
      expect(surfaces).toHaveLength(1);
      expect(result.state.bars[surfaces[0].surface_id]?.bar.primary)
        .toBeTruthy();
      return surfaces[0].title;
    });

    expect(titles).toEqual(["Welcome to Vauchi", "What's your name?"]);
    expect(titles).toEqual(catalog.screens.map((entry) => entry.title));
  });

  it("selects an entry by code_id, by index, and defaults to the first", () => {
    const catalog = smokeCatalog();
    expect(selectCatalogEntry(catalog, "onboarding-display-name")?.code_id)
      .toBe("onboarding-display-name");
    expect(selectCatalogEntry(catalog, "1")?.code_id)
      .toBe("onboarding-display-name");
    expect(selectCatalogEntry(catalog, null)?.code_id)
      .toBe("onboarding-welcome");
    expect(selectCatalogEntry(catalog, "missing")).toBeUndefined();
  });

  it("tolerates commands, node kinds, and enum values newer than this shell", () => {
    const catalog = parseScreenCatalog({
      schema_version: 1,
      screens: [{
        code_id: "future",
        title: "Future",
        locale: "en",
        commands: [
          {
            ReplaceSurface: {
              surface: {
                surface_id: "future",
                revision: 1,
                title: "Future",
                subtitle: null,
                accessibility_label: "Future",
                layout: "holographic",
                tokens: {
                  spacing_small: 4,
                  spacing_medium: 8,
                  spacing_large: 16,
                  corner_radius: 8,
                  minimum_target_size: 44,
                },
                nodes: [
                  { Hologram: { id: "h", depth: 3 } },
                  {
                    Status: {
                      id: null,
                      title: "Tone from the future",
                      detail: null,
                      icon_token: null,
                      badge: null,
                      tone: "iridescent",
                      activation: null,
                      accessibility: { label: "Tone", description: null },
                    },
                  },
                ],
              },
            },
          },
          { SetContextBar: {
            surface_id: "future",
            revision: 1,
            bar: {
              back: null,
              navigation: null,
              primary: {
                interaction_id: "go",
                label: "Go",
                accessibility_label: "Go",
                icon_token: null,
                enabled: true,
                shortcut: null,
                tone: "sparkling",
              },
              secondary: null,
            },
          } },
          { SetNavigation: { destinations: [] } },
          { RecalibrateFluxCapacitor: { level: 1.21 } },
          "SomeUnitCommandFromTheFuture",
        ],
      }],
    });

    const result = reduceCatalogEntry(catalog.screens[0]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.surfaces.future.nodes).toHaveLength(2);
    expect(result.state.bars.future.bar.primary?.label).toBe("Go");
  });

  it("rejects a catalog whose shape this shell cannot replay", () => {
    expect(() => parseScreenCatalog(null)).toThrow(/catalog/);
    expect(() => parseScreenCatalog({ schema_version: 2, screens: [] }))
      .toThrow(/schema_version/);
    expect(() => parseScreenCatalog({ schema_version: 1, screens: {} }))
      .toThrow(/screens/);
    expect(() => parseScreenCatalog({
      schema_version: 1,
      screens: [{ code_id: "x", title: "X", locale: "en" }],
    })).toThrow(/commands/);
    expect(() => parseScreenCatalog({
      schema_version: 1,
      screens: [{ code_id: 7, title: "X", locale: "en", commands: [] }],
    })).toThrow(/code_id/);
  });
});
