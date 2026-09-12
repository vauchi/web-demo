// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// Screen-catalog render: every entry of Core's screen catalog replayed
// through the real renderer (catalog.html, no wasm, no navigation) at
// the expanded and compact widths and in the dark theme. No baselines —
// the PNG files are review artifacts (test:screen-catalog uploads them);
// the run fails only when an entry does not render or the captures
// collapse into one image.
//
// VAUCHI_SCREEN_CATALOG points at the catalog JSON; the two-entry smoke
// fixture copied from Core's presentation contract is the default.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { expect, test, type Page } from "@playwright/test";

const CATALOG_DIR = join(__dirname, "catalog");
const CATALOG_PATH = resolve(
  process.env.VAUCHI_SCREEN_CATALOG
    ?? join(__dirname, "..", "fixtures", "screen_catalog_smoke.json"),
);

interface CatalogEntry {
  code_id: string;
  title: string;
}

const catalogJson = readFileSync(CATALOG_PATH, "utf8");
const entries = (JSON.parse(catalogJson) as { screens: CatalogEntry[] }).screens;

const fileSlug = (codeId: string): string =>
  codeId.replace(/[^A-Za-z0-9_.-]+/g, "-");

async function renderEntry(page: Page, entry: CatalogEntry): Promise<void> {
  await page.goto(`/catalog.html?screen=${encodeURIComponent(entry.code_id)}`);
  const app = page.locator(".app[data-catalog-ready='true']");
  await expect(app).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(app).toHaveAttribute("data-catalog-screen", entry.code_id);
  // A sub-screen batch also replaces its parent pane (the responsive
  // companion), so the entry's own surface is not always the first active
  // one: look for its title among every active surface heading.
  await expect(
    page
      .locator("[data-surface-id][data-active='true']")
      .getByRole("heading", { level: 2, name: entry.title, exact: true })
      .first(),
  ).toBeVisible();
}

async function capture(page: Page, entry: CatalogEntry, suffix: string) {
  await page.screenshot({
    path: join(CATALOG_DIR, `${fileSlug(entry.code_id)}${suffix}.png`),
    fullPage: true,
  });
}

// Not serial: one screen that fails to render must not skip the rest of
// the catalog. The file still runs in one worker, so beforeAll's cleanup
// happens once.

test.beforeAll(() => {
  if (existsSync(CATALOG_DIR)) rmSync(CATALOG_DIR, { recursive: true });
  mkdirSync(CATALOG_DIR, { recursive: true });
  console.log(`Screen catalog: ${CATALOG_PATH} (${entries.length} entries)`);
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript((catalog) => {
    window.__VAUCHI_SCREEN_CATALOG = catalog;
  }, catalogJson);
});

for (const entry of entries) {
  test(`renders ${entry.code_id} expanded, compact, and dark`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await renderEntry(page, entry);
    await expect(page.locator(".app")).toHaveAttribute("data-window-class", "expanded");
    await capture(page, entry, "");

    await page.setViewportSize({ width: 390, height: 844 });
    await renderEntry(page, entry);
    await expect(page.locator(".app")).toHaveAttribute("data-window-class", "compact");
    await capture(page, entry, ".compact");

    await page.emulateMedia({ colorScheme: "dark" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await renderEntry(page, entry);
    await expect(page.locator("html")).toHaveAttribute("data-theme", "default-dark");
    await capture(page, entry, ".dark");
  });
}

test("wrote at least three distinct catalog captures", () => {
  const written = readdirSync(CATALOG_DIR).filter((name) => name.endsWith(".png"));
  console.log(`Catalog captures written:\n  ${written.sort().join("\n  ")}`);
  const distinct = new Set(
    written.map((name) => readFileSync(join(CATALOG_DIR, name)).toString("base64")),
  );
  expect(written.length).toBe(entries.length * 3);
  expect(distinct.size).toBeGreaterThanOrEqual(3);
});
