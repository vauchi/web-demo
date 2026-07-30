// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { expect, test } from "@playwright/test";

test("Core drives responsive chrome and distinct reduced-motion overlays", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".presentation-surface")).toBeVisible();

  const app = page.locator(".app");
  await expect(app).toHaveAttribute("data-window-class", "compact");
  await expect(page.locator(".context-command-bar")).toBeVisible();
  await expect(page.locator(".actions")).toHaveCount(0);
  await expect(page.locator(".workflow-tabs")).toHaveCount(0);

  await page.getByRole("button", { name: "Navigate" }).click();
  const navigation = page.locator(".overlay-navigation");
  await expect(navigation).toBeVisible();
  await expect(navigation.locator(".presentation-overlay-panel"))
    .toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "Emergency Shred" }).click();
  await expect(page.getByRole("heading", {
    name: "Emergency Data Wipe",
    level: 2,
  }))
    .toBeVisible();

  const secondary = page.locator(".context-command-secondary");
  await expect(secondary).toBeVisible();
  await secondary.click();
  const actions = page.locator(".overlay-action_menu");
  await expect(actions).toBeVisible();
  await expect(actions.locator(".presentation-overlay-panel"))
    .toHaveCSS("animation-name", "none");
  await expect(actions).not.toHaveClass(/overlay-navigation/);
  await page.keyboard.press("Escape");
  await expect(actions).toHaveCount(0);

  await page.setViewportSize({ width: 600, height: 844 });
  await expect(app).toHaveAttribute("data-window-class", "medium");
  await page.setViewportSize({ width: 840, height: 844 });
  await expect(app).toHaveAttribute("data-window-class", "expanded");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 841, height: 844 });
  await page.getByRole("button", { name: "Navigate" }).click();
  await expect(navigation.locator(".presentation-overlay-panel"))
    .toHaveCSS("animation-name", "navigation-reveal");
  await page.keyboard.press("Escape");
  await secondary.click();
  await expect(actions.locator(".presentation-overlay-panel"))
    .toHaveCSS("animation-name", "action-menu-reveal");
});

test("desktop shortcuts and responsive changes preserve contextual focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 841, height: 844 });
  await page.goto("/");
  const navigationButton = page.getByRole("button", { name: "Navigate" });
  await expect(navigationButton).toBeVisible();

  await navigationButton.focus();
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.locator(".overlay-navigation")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(navigationButton).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".app"))
    .toHaveAttribute("data-window-class", "compact");
  await expect(navigationButton).toBeFocused();
  await page.setViewportSize({ width: 840, height: 844 });
  await expect(page.locator(".app"))
    .toHaveAttribute("data-window-class", "expanded");
  await expect(navigationButton).toBeFocused();
});
