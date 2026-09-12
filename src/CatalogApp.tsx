// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// Catalog render shell: replays one screen-catalog entry through the
// presentation reducer and draws it with the same surface and command
// bar the live app uses, without wasm and without navigation. The
// catalog comes from `window.__VAUCHI_SCREEN_CATALOG` (an object or JSON
// text, set by a test's init script) or from the URL in `?catalog=`;
// `?screen=` picks an entry by code_id or index.

import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { ContextCommandBar } from "./presentation/ContextCommandBar";
import {
  parseScreenCatalog,
  reduceCatalogEntry,
  selectCatalogEntry,
  type ScreenCatalog,
  type ScreenCatalogEntry,
} from "./presentation/catalog";
import { PresentationSurface } from "./presentation/PresentationSurface";
import {
  activeSurfaceId as selectActiveSurfaceId,
  visibleSurfaceIds,
} from "./presentation/selectors";
import {
  emptyPresentationState,
  type PresentationState,
} from "./presentation/state";
import type { WindowClass } from "./types/presentation";

declare global {
  interface Window {
    __VAUCHI_SCREEN_CATALOG?: unknown;
  }
}

// Mirrors Core's window-class breakpoints (vauchi-app presentation.rs)
// for entries whose batch carries no presentation profile.
export const windowClassForWidth = (width: number): WindowClass => {
  if (width < 600) return "compact";
  if (width < 840) return "medium";
  return "expanded";
};

async function loadCatalog(search: URLSearchParams): Promise<ScreenCatalog> {
  const injected = window.__VAUCHI_SCREEN_CATALOG;
  if (injected !== undefined) {
    return parseScreenCatalog(
      typeof injected === "string" ? JSON.parse(injected) : injected,
    );
  }
  const url = search.get("catalog");
  if (!url) {
    throw new Error(
      "no screen catalog: set window.__VAUCHI_SCREEN_CATALOG or ?catalog=<url>",
    );
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`catalog fetch failed: ${response.status} ${url}`);
  }
  return parseScreenCatalog(await response.json());
}

export default function CatalogApp() {
  const [state, setState] = createSignal<PresentationState>(
    emptyPresentationState(),
  );
  const [entry, setEntry] = createSignal<ScreenCatalogEntry | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [ready, setReady] = createSignal(false);

  const windowClass = createMemo(() => (
    state().profile?.window_class
    ?? windowClassForWidth(document.documentElement.clientWidth)
  ));
  const surfaceIds = createMemo(() => (
    visibleSurfaceIds(state(), windowClass())
  ));
  const activeSurfaceId = createMemo(() => (
    selectActiveSurfaceId(state(), windowClass())
  ));
  const paneLayout = createMemo(() => (
    state().profile?.pane_layout
    ?? (surfaceIds().length > 1 ? "split" : "single")
  ));
  const activeBar = createMemo(() => {
    const surfaceId = activeSurfaceId();
    return surfaceId ? state().bars[surfaceId]?.bar ?? null : null;
  });

  const ignoreEvent = () => {};

  onMount(async () => {
    const search = new URLSearchParams(window.location.search);
    try {
      const catalog = await loadCatalog(search);
      const selected = selectCatalogEntry(catalog, search.get("screen"));
      if (!selected) {
        throw new Error(`no catalog entry ${String(search.get("screen"))}`);
      }
      const result = reduceCatalogEntry(selected);
      if (!result.ok) {
        throw new Error(`${selected.code_id}: ${result.error}`);
      }
      setEntry(selected);
      setState(result.state);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setReady(true);
    }
  });

  return (
    <div
      class="app"
      data-window-class={windowClass()}
      data-pane-layout={paneLayout()}
      data-catalog-ready={ready()}
      data-catalog-screen={entry()?.code_id ?? ""}
      data-catalog-locale={entry()?.locale ?? ""}
    >
      <header class="app-header">
        <h1>Vauchi Demo</h1>
        <p>Sandboxed preview; Core prepares every visible control.</p>
      </header>
      <main class="presentation-workspace">
        <Show
          when={!error()}
          fallback={<p class="error" role="alert">{error()}</p>}
        >
          <For each={surfaceIds()}>
            {(surfaceId) => (
              <Show when={state().surfaces[surfaceId]}>
                {(surface) => (
                  <PresentationSurface
                    surface={surface()}
                    active={activeSurfaceId() === surfaceId}
                    onEvent={ignoreEvent}
                  />
                )}
              </Show>
            )}
          </For>
        </Show>
      </main>
      <Show when={activeSurfaceId()}>
        {(surfaceId) => (
          <ContextCommandBar
            surfaceId={surfaceId()}
            bar={activeBar()}
            onEvent={ignoreEvent}
          />
        )}
      </Show>
    </div>
  );
}
