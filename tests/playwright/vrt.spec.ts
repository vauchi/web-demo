// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// Visual regression tests using Playwright screenshots.
// Captures full-page screenshots and compares against baselines.

import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("main page matches baseline", async ({ page }) => {
    await page.goto("/");

    // Wait for WASM + first screen render
    await page.waitForSelector(".app-header", { timeout: 15_000 });
    await page.waitForTimeout(2_000);

    await expect(page).toHaveScreenshot("main-page.png", {
      maxDiffPixelRatio: 0.005,
      fullPage: true,
    });
  });
});
