// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// Screenshot walk: captures every screen the demo can reach and every
// step of the flows between them. No baselines — the PNG files are review
// artifacts (test:screenshots uploads them), so the walk fails only
// when navigation itself is broken: too few captures, or destination
// captures that came out byte-identical.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Locator, type Page } from "@playwright/test";

const SCREENS_DIR = join(__dirname, "screens");
const DISPLAY_NAME = "Screenshot Walk";
const MAX_FLOW_STEPS = 8;

let shotIndex = 0;
const destinationShots: string[] = [];

const slugify = (text: string): string =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "screen";

async function capture(page: Page, slug: string): Promise<string> {
  shotIndex += 1;
  const path = join(SCREENS_DIR, `${String(shotIndex).padStart(2, "0")}-${slug}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function waitForSurface(page: Page): Promise<void> {
  await page.waitForSelector(".app-header", { timeout: 15_000 });
  await expect(page.locator("[data-surface-id][data-active='true']")).toBeVisible();
  await expect(page.getByRole("button", { name: "Navigate" })).toBeVisible();
}

async function activeTitle(page: Page): Promise<string> {
  const heading = page.locator("[data-surface-id][data-active='true'] h2").first();
  return (await heading.textContent())?.trim() ?? "";
}

// The primary slot is shell markup (ContextCommandBar.tsx), not a Core
// class; its label changes per step, so the slot is the stable handle.
const primaryAction = (page: Page): Locator =>
  page.getByRole("navigation", { name: "Contextual commands" })
    .locator(".context-command-primary");

async function openNavigation(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "Navigate" }).click();
  const overlay = page.getByRole("dialog");
  await expect(overlay).toBeVisible();
  return overlay;
}

async function fillTextInputs(page: Page): Promise<void> {
  const inputs = page.getByRole("textbox");
  const count = await inputs.count();
  for (let i = 0; i < count; i += 1) {
    const input = inputs.nth(i);
    if (await input.isEnabled()) await input.fill(DISPLAY_NAME);
  }
}

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  if (existsSync(SCREENS_DIR)) rmSync(SCREENS_DIR, { recursive: true });
  mkdirSync(SCREENS_DIR, { recursive: true });
});

test("walks the first render, every onboarding step, and every destination", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await waitForSurface(page);
  await capture(page, "first-render");

  // Drive the flow Core boots into by its primary action until the
  // primary stops changing the screen (the flow's last step).
  let title = await activeTitle(page);
  for (let step = 0; step < MAX_FLOW_STEPS; step += 1) {
    const primary = primaryAction(page);
    if ((await primary.count()) === 0) break;
    await fillTextInputs(page);
    if (!(await primary.isEnabled())) break;
    await primary.click();
    const next = page.locator("[data-surface-id][data-active='true'] h2").first();
    try {
      await expect(next).not.toHaveText(title, { timeout: 3_000 });
    } catch {
      break;
    }
    title = await activeTitle(page);
    await capture(page, `flow-${slugify(title)}`);
  }

  const overlay = await openNavigation(page);
  await capture(page, "navigation");
  const destinations = (await overlay.getByRole("button").allTextContents())
    .map((name) => name.trim())
    .filter((name) => name && name !== "×");
  await page.keyboard.press("Escape");
  await expect(overlay).toBeHidden();
  expect(destinations.length, "navigation overlay lists destinations").toBeGreaterThan(0);

  for (const destination of destinations) {
    // Some destinations (lock screen, emergency shred) replace the
    // chrome; reload to a known state when the launcher is gone.
    if (!(await page.getByRole("button", { name: "Navigate" }).isVisible())) {
      await page.goto("/");
      await waitForSurface(page);
    }
    const menu = await openNavigation(page);
    const before = await activeTitle(page);
    await menu.getByRole("button", { name: destination, exact: true }).click();
    await expect(menu).toBeHidden();
    const heading = page.locator("[data-surface-id][data-active='true'] h2").first();
    await expect(heading).not.toHaveText(before, { timeout: 5_000 }).catch(() => {});
    destinationShots.push(await capture(page, slugify(destination)));
  }
});

test("captures the home screen in the compact layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await waitForSurface(page);
  await expect(page.locator(".app")).toHaveAttribute("data-window-class", "compact");
  await capture(page, "home-compact");
});

test("wrote distinct screenshots for the walk", () => {
  const written = readdirSync(SCREENS_DIR).filter((name) => name.endsWith(".png"));
  console.log(`Screenshots written:\n  ${written.sort().join("\n  ")}`);
  expect(written.length).toBeGreaterThanOrEqual(4);

  const buffers = destinationShots.map((path) => readFileSync(path));
  for (let i = 0; i < buffers.length; i += 1) {
    for (let j = i + 1; j < buffers.length; j += 1) {
      expect(
        buffers[i].equals(buffers[j]),
        `${destinationShots[i]} and ${destinationShots[j]} are byte-identical`,
      ).toBe(false);
    }
  }
});
