// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { describe, it, expect } from "vitest";
import type {
  ScreenModel,
  Component,
  UserAction,
  ActionResult,
  Command,
  WakeupEnvelope,
} from "../src/types/core";
import { onWakeup } from "../src/wasm/bridge";

describe("Core types", () => {
  it("can construct a ScreenModel with ADR-044 chrome fields", () => {
    const screen: ScreenModel = {
      screen_id: "test",
      title: "Test",
      subtitle: null,
      components: [],
      actions: [],
      progress: null,
      nav_actions: [{ id: "go_back", label: "Back", style: "Secondary", enabled: true }],
      nav_tab_id: "more",
    };
    expect(screen.screen_id).toBe("test");
    expect(screen.nav_actions?.[0].id).toBe("go_back");
    expect(screen.nav_tab_id).toBe("more");
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

  it("requires core-owned copy and action ids for generic editing", () => {
    const component: Component = {
      EditableText: {
        id: "visual-only-id",
        label: "Note",
        value: "Hello",
        edit_text: "Change note",
        save_text: "Keep it",
        cancel_text: "Leave it",
        edit_action_id: "opaque/edit#1",
        save_action_id: "opaque/save#2",
        cancel_action_id: "opaque/cancel#3",
        editing: false,
        validation_error: null,
      },
    };
    expect(component.EditableText.edit_action_id).toBe("opaque/edit#1");
  });

  it("preserves the core-owned ImageCircle edit action id", () => {
    const component: Component = {
      ImageCircle: {
        id: "visual-only-id",
        initials: "AG",
        editable: true,
        edit_action_id: "opaque/image-edit#4",
      },
    };
    expect(component.ImageCircle.edit_action_id).toBe("opaque/image-edit#4");
  });

  it("requires the core-localized StatusIndicator label", () => {
    const component: Component = {
      StatusIndicator: {
        id: "sync-status",
        icon: null,
        title: "Synchronisation",
        detail: null,
        status: "Success",
        status_label: "Erfolg",
      },
    };
    expect(component.StatusIndicator.status_label).toBe("Erfolg");
  });

  it("can construct a NavigateBack user action", () => {
    const action: UserAction = "NavigateBack";
    expect(action).toBe("NavigateBack");
  });

  it("can construct a PerformNativeBack action result", () => {
    const result: ActionResult = "PerformNativeBack";
    expect(result).toBe("PerformNativeBack");
  });

  it("can construct a ScheduleWakeup command", () => {
    const command: Command = {
      ScheduleWakeup: {
        earliest_secs: 30,
        deadline_secs: 90,
        min_interval_secs: 30,
      },
    };
    expect(command.ScheduleWakeup.deadline_secs).toBe(90);
  });

  it("can construct an on_wakeup envelope", () => {
    const envelope: WakeupEnvelope = {
      notifications: [],
      commands: [
        {
          ScheduleWakeup: {
            earliest_secs: 30,
            deadline_secs: 90,
            min_interval_secs: 30,
          },
        },
      ],
    };
    expect(envelope.commands).toHaveLength(1);
  });
});

describe("WASM bridge", () => {
  it("returns an empty on_wakeup envelope when WASM is not loaded", () => {
    const envelope = onWakeup(0);
    expect(envelope.notifications).toEqual([]);
    expect(envelope.commands).toEqual([]);
  });
});
