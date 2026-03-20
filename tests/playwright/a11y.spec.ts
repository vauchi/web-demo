// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// Accessibility tests using Playwright + axe-core.
// Scans the rendered app for WCAG 2.1 AA violations.

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("main page has no critical or serious a11y violations", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for app to finish loading (WASM init + first screen render)
    await page.waitForSelector(".app-header", { timeout: 15_000 });

    // Wait a bit for WASM screen to render
    await page.waitForTimeout(2_000);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (critical.length > 0) {
      const summary = critical
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`
        )
        .join("\n");
      console.log("Accessibility violations:\n" + summary);
    }

    expect(critical).toEqual([]);
  });

  test("page has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".app-header", { timeout: 15_000 });

    // H1 should exist
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
  });

  test("interactive elements are keyboard accessible", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".app-header", { timeout: 15_000 });
    await page.waitForTimeout(2_000);

    // Tab through the page — should be able to reach at least one focusable element
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      return el ? el.tagName : null;
    });

    // Something should be focused after Tab
    expect(focused).not.toBeNull();
  });

  test("images and icons have alt text", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".app-header", { timeout: 15_000 });
    await page.waitForTimeout(2_000);

    // All img elements should have alt attributes
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt, `Image ${i} missing alt text`).not.toBeNull();
    }
  });

  test("buttons have accessible names", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector(".app-header", { timeout: 15_000 });
    await page.waitForTimeout(2_000);

    const buttons = page.locator("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const name = await buttons.nth(i).evaluate((el) => {
        return (
          el.getAttribute("aria-label") ||
          el.textContent?.trim() ||
          el.getAttribute("title") ||
          ""
        );
      });
      expect(name.length, `Button ${i} has no accessible name`).toBeGreaterThan(
        0
      );
    }
  });
});
