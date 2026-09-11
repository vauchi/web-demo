// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

// Core's screen catalog fixture: every app screen as the command batch
// Core emitted for it. Entries replay through the same reducer the live
// shell feeds from wasm, so a catalog render exercises the real renderer
// without navigation. Only the envelope is validated — commands, node
// kinds, and enum values pass through untouched so a catalog produced by
// a newer Core cannot abort a render run.

import type { PlatformCommand } from "../types/presentation";
import {
  applyPresentationCommands,
  emptyPresentationState,
  type ApplyCommandsResult,
} from "./state";

export const SCREEN_CATALOG_SCHEMA_VERSION = 1;

export interface ScreenCatalogEntry {
  code_id: string;
  title: string;
  locale: string;
  commands: PlatformCommand[];
}

export interface ScreenCatalog {
  schema_version: number;
  screens: ScreenCatalogEntry[];
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null && !Array.isArray(value)
);

const requireString = (
  entry: Record<string, unknown>,
  field: "code_id" | "title" | "locale",
  index: number,
): string => {
  const value = entry[field];
  if (typeof value !== "string") {
    throw new Error(`screen ${index}: ${field} must be a string`);
  }
  return value;
};

export function parseScreenCatalog(value: unknown): ScreenCatalog {
  if (!isRecord(value)) throw new Error("screen catalog must be an object");
  if (value.schema_version !== SCREEN_CATALOG_SCHEMA_VERSION) {
    throw new Error(
      `screen catalog schema_version ${String(value.schema_version)} `
      + `is not ${SCREEN_CATALOG_SCHEMA_VERSION}`,
    );
  }
  if (!Array.isArray(value.screens)) {
    throw new Error("screen catalog screens must be an array");
  }
  const screens = value.screens.map((entry, index) => {
    if (!isRecord(entry)) throw new Error(`screen ${index} must be an object`);
    if (!Array.isArray(entry.commands)) {
      throw new Error(`screen ${index}: commands must be an array`);
    }
    return {
      code_id: requireString(entry, "code_id", index),
      title: requireString(entry, "title", index),
      locale: requireString(entry, "locale", index),
      commands: entry.commands as PlatformCommand[],
    };
  });
  return { schema_version: SCREEN_CATALOG_SCHEMA_VERSION, screens };
}

// `selector` is a code_id or a zero-based index; null picks the first entry.
export function selectCatalogEntry(
  catalog: ScreenCatalog,
  selector: string | null,
): ScreenCatalogEntry | undefined {
  if (selector === null || selector === "") return catalog.screens[0];
  const byCodeId = catalog.screens.find((entry) => entry.code_id === selector);
  if (byCodeId) return byCodeId;
  return /^\d+$/.test(selector)
    ? catalog.screens[Number(selector)]
    : undefined;
}

export function reduceCatalogEntry(
  entry: ScreenCatalogEntry,
): ApplyCommandsResult {
  return applyPresentationCommands(emptyPresentationState(), entry.commands);
}
