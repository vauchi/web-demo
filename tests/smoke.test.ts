// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, it, expect } from "vitest";
import type { ScreenModel, Component, UserAction } from "../src/types/core";

describe("Core types", () => {
  it("can construct a ScreenModel", () => {
    const screen: ScreenModel = {
      screen_id: "test",
      title: "Test",
      subtitle: null,
      components: [],
      actions: [],
      progress: null,
    };
    expect(screen.screen_id).toBe("test");
  });

  it("can construct a Divider component", () => {
    const component: Component = "Divider";
    expect(component).toBe("Divider");
  });

  it("can construct an ActionPressed user action", () => {
    const action: UserAction = {
      ActionPressed: { action_id: "test" },
    };
    expect(JSON.stringify(action)).toContain("ActionPressed");
  });
});
