// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, expect, it } from "vitest";
import {
  actionActivated,
  backRequested,
  environmentChanged,
  overlayDismissed,
  surfaceActivated,
  valueChanged,
} from "../src/presentation/events";

describe("presentation events", () => {
  it("preserves opaque surface, interaction, and binding identifiers", () => {
    expect(surfaceActivated("detail")).toEqual({
      SurfaceActivated: { surface_id: "detail" },
    });
    expect(actionActivated("detail", "opaque.action/7")).toEqual({
      ActionActivated: {
        surface_id: "detail",
        interaction_id: "opaque.action/7",
      },
    });
    expect(valueChanged("detail", "opaque.binding/2", { Text: "Alice" }))
      .toEqual({
        ValueChanged: {
          surface_id: "detail",
          binding_id: "opaque.binding/2",
          value: { Text: "Alice" },
        },
      });
  });

  it("encodes back and overlay dismissal as Core events", () => {
    expect(backRequested("main")).toEqual({
      BackRequested: { surface_id: "main" },
    });
    expect(overlayDismissed("main", "action_menu")).toEqual({
      OverlayDismissed: {
        surface_id: "main",
        kind: "action_menu",
      },
    });
  });

  it("reports raw environment facts rather than choosing a window class", () => {
    expect(environmentChanged(600, 900, ["touch", "keyboard"], true)).toEqual({
      PresentationEnvironmentChanged: {
        available_width: 600,
        available_height: 900,
        input_modes: ["touch", "keyboard"],
        motion: "reduced",
      },
    });
  });
});
