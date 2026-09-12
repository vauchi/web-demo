// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// @vitest-environment jsdom

import { render } from "solid-js/web";
import { afterEach, describe, expect, it } from "vitest";
import { PresentationNodeRenderer } from "../src/presentation/PresentationNodeRenderer";
import type {
  PresentationEvent,
  PresentationNode,
} from "../src/types/presentation";

const optionIds = (count: number): string[] =>
  Array.from({ length: count }, (_, index) => `option-${index + 1}`);

function choiceNode(count: number, selected: string | null): PresentationNode {
  return {
    Choice: {
      binding_id: "perspective",
      label: "Perspective",
      selected,
      options: optionIds(count).map((id) => ({ id, label: id.toUpperCase() })),
      enabled: true,
      accessibility: { label: "Perspective", description: null },
    },
  };
}

interface Mounted {
  root: HTMLElement;
  events: PresentationEvent[];
}

let dispose: (() => void) | null = null;

function mount(node: PresentationNode): Mounted {
  const root = document.createElement("div");
  document.body.appendChild(root);
  const events: PresentationEvent[] = [];
  dispose = render(
    () => (
      <PresentationNodeRenderer
        node={node}
        surfaceId="detail"
        onEvent={(event) => events.push(event)}
      />
    ),
    root,
  );
  return { root, events };
}

afterEach(() => {
  dispose?.();
  dispose = null;
  document.body.innerHTML = "";
});

const radios = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLButtonElement>("[role='radio']"));

const choiceEvent = (choice: string) => ({
  ValueChanged: {
    surface_id: "detail",
    binding_id: "perspective",
    value: { choice },
  },
});

describe("Choice control kind", () => {
  it.each([2, 3])("renders %i options as a segmented radiogroup", (count) => {
    const { root } = mount(choiceNode(count, "option-1"));

    const group = root.querySelector("[role='radiogroup']");
    expect(group).not.toBeNull();
    expect(group?.getAttribute("data-presentation-id")).toBe("perspective");
    const labelId = group?.getAttribute("aria-labelledby") ?? "";
    expect(document.getElementById(labelId)?.textContent).toBe("Perspective");
    expect(root.querySelector("select")).toBeNull();

    const segments = radios(root);
    expect(segments.map((radio) => radio.textContent))
      .toEqual(optionIds(count).map((id) => id.toUpperCase()));
    expect(segments.map((radio) => radio.getAttribute("aria-checked")))
      .toEqual(["true", ...Array<string>(count - 1).fill("false")]);
    expect(segments.map((radio) => radio.tabIndex))
      .toEqual([0, ...Array<number>(count - 1).fill(-1)]);
  });

  it.each([1, 4, 15])("renders %i options as a select without an empty option", (count) => {
    const { root } = mount(choiceNode(count, "option-1"));

    expect(root.querySelector("[role='radiogroup']")).toBeNull();
    const select = root.querySelector("select");
    expect(select?.getAttribute("data-presentation-id")).toBe("perspective");
    expect(Array.from(select?.options ?? []).map((option) => option.value))
      .toEqual(optionIds(count));
    expect(select?.value).toBe("option-1");
  });
});

describe("Choice events", () => {
  it("emits the chosen option when a segment is clicked, and nothing when re-clicked", () => {
    const { root, events } = mount(choiceNode(2, "option-1"));
    const [first, second] = radios(root);

    second.click();
    expect(events).toEqual([choiceEvent("option-2")]);

    first.click();
    expect(events).toHaveLength(2);
    expect(events[1]).toEqual(choiceEvent("option-1"));

    first.click();
    expect(events).toHaveLength(2);
  });

  it("moves the selection with arrow keys, wrapping at both ends", () => {
    const { root, events } = mount(choiceNode(3, "option-1"));
    const press = (key: string) => {
      const focused = document.activeElement as HTMLElement;
      focused.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    };

    radios(root)[0].focus();
    press("ArrowRight");
    expect(events.at(-1)).toEqual(choiceEvent("option-2"));
    expect(document.activeElement?.textContent).toBe("OPTION-2");

    press("ArrowLeft");
    press("ArrowLeft");
    expect(events.at(-1)).toEqual(choiceEvent("option-3"));
    expect(document.activeElement?.textContent).toBe("OPTION-3");

    press("ArrowDown");
    expect(events.at(-1)).toEqual(choiceEvent("option-1"));
    expect(events).toHaveLength(4);
  });

  it("emits the chosen option from the select", () => {
    const { root, events } = mount(choiceNode(4, "option-1"));
    const select = root.querySelector("select");
    if (!select) throw new Error("select missing");

    select.value = "option-3";
    select.dispatchEvent(new Event("change", { bubbles: true }));
    expect(events).toEqual([choiceEvent("option-3")]);
  });

  it("disables every segment when the node is disabled", () => {
    const node = choiceNode(2, "option-1");
    if ("Choice" in node) node.Choice.enabled = false;
    const { root, events } = mount(node);

    const segments = radios(root);
    expect(segments.every((radio) => radio.disabled)).toBe(true);
    segments[1].click();
    expect(events).toEqual([]);
  });
});
