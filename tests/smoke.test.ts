// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import type {
  PlatformCommand,
  PresentationEvent,
  PresentationNode,
} from "../src/types/presentation";
import { dispatch, initialCommands } from "../src/wasm/bridge";

describe("generic presentation types", () => {
  it("represents every interaction with opaque identifiers", () => {
    const event: PresentationEvent = {
      ActionActivated: {
        surface_id: "opaque.surface",
        interaction_id: "opaque.interaction",
      },
    };
    expect(JSON.stringify(event)).toContain("opaque.interaction");
  });

  it("represents prepared nodes without ScreenMode actions", () => {
    const node: PresentationNode = {
      Text: {
        id: null,
        content: "Prepared by Core",
        style: "body",
        accessibility: {
          label: "Prepared by Core",
          description: null,
        },
      },
    };
    expect(node.Text.content).toBe("Prepared by Core");
  });

  it("represents a Core-owned contextual primary action", () => {
    const command: PlatformCommand = {
      SetContextBar: {
        surface_id: "main",
        revision: 1,
        bar: {
          back: null,
          navigation: null,
          primary: {
            interaction_id: "save",
            label: "Save",
            accessibility_label: "Save changes",
            icon_token: null,
            enabled: true,
            shortcut: "activate_primary",
          },
          secondary: null,
        },
      },
    };
    expect("SetContextBar" in command).toBe(true);
  });
});

describe("WASM bridge fallback", () => {
  it("provides a prepared placeholder transaction without WASM", () => {
    const commands = initialCommands(0);

    expect(commands.some((command) => "ReplaceSurface" in Object(command)))
      .toBe(true);
    expect(commands.some((command) => "SetContextBar" in Object(command)))
      .toBe(true);
  });

  it("fails closed when dispatch is attempted without WASM", () => {
    expect(() => dispatch(0, {
      BackRequested: { surface_id: "placeholder" },
    })).toThrow("WASM is not loaded");
  });
});
