// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { evaluateAudit } = require("../ci/audit-deps.js") as {
  evaluateAudit: (
    status: number | null,
    report: unknown,
    now?: Date,
    productionStatus?: number | null,
  ) => { ok: boolean; reason: string };
};

const advisory = "https://github.com/advisories/GHSA-fc5q-39xc-vjpf";
const beforeExpiry = new Date("2026-11-18T12:00:00Z");

function exceptionReport() {
  const finding = (via: unknown[]) => ({ via });
  return {
    vulnerabilities: {
      "@vitest/coverage-v8": finding(["vitest"]),
      fdir: finding(["picomatch"]),
      picomatch: finding([{ url: advisory }]),
      tinyglobby: finding(["fdir", "picomatch"]),
      vite: finding(["fdir", "picomatch", "tinyglobby"]),
      vitest: finding(["@vitest/coverage-v8", "picomatch", "tinyglobby"]),
    },
  };
}

describe("dependency audit exception", () => {
  it("accepts a clean audit without reading a report", () => {
    expect(evaluateAudit(0, null, beforeExpiry)).toEqual({
      ok: true,
      reason: "clean",
    });
  });

  it("accepts only the time-boxed dev-only advisory chain", () => {
    expect(evaluateAudit(1, exceptionReport(), beforeExpiry)).toEqual({
      ok: true,
      reason: "time-boxed exception",
    });
  });

  it("rejects an additional advisory", () => {
    const report = exceptionReport();
    report.vulnerabilities["new-finding"] = {
      via: [{ url: "https://github.com/advisories/GHSA-new-finding" }],
    };

    expect(evaluateAudit(1, report, beforeExpiry).ok).toBe(false);
  });

  it("rejects the advisory when it reaches production dependencies", () => {
    expect(evaluateAudit(1, exceptionReport(), beforeExpiry, 1)).toEqual({
      ok: false,
      reason: "production audit failed",
    });
  });

  it("rejects a failing audit backend", () => {
    expect(evaluateAudit(2, exceptionReport(), beforeExpiry)).toEqual({
      ok: false,
      reason: "npm audit exited with status 2",
    });
  });

  it("rejects malformed audit output", () => {
    expect(evaluateAudit(1, null, beforeExpiry)).toEqual({
      ok: false,
      reason: "invalid npm audit report",
    });
  });

  it("fails when the exception expires", () => {
    expect(
      evaluateAudit(1, exceptionReport(), new Date("2026-12-19T00:00:00Z")),
    ).toEqual({
      ok: false,
      reason: "exception expired on 2026-12-18",
    });
  });
});
