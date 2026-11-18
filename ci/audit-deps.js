// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

"use strict";

const { spawnSync } = require("node:child_process");

const ADVISORY = "https://github.com/advisories/GHSA-fc5q-39xc-vjpf";
const EXPIRY = "2026-12-18";
const EXPECTED_FINDINGS = [
  "@vitest/coverage-v8",
  "fdir",
  "picomatch",
  "tinyglobby",
  "vite",
  "vitest",
];

function evaluateAudit(status, report, now = new Date(), productionStatus = 0) {
  if (productionStatus !== 0) {
    return { ok: false, reason: "production audit failed" };
  }
  if (status === 0) {
    return { ok: true, reason: "clean" };
  }
  if (status !== 1) {
    return { ok: false, reason: `npm audit exited with status ${status}` };
  }
  if (now.toISOString().slice(0, 10) > EXPIRY) {
    return { ok: false, reason: `exception expired on ${EXPIRY}` };
  }
  if (!report || typeof report !== "object" || !report.vulnerabilities) {
    return { ok: false, reason: "invalid npm audit report" };
  }

  const vulnerabilities = report.vulnerabilities;
  const names = Object.keys(vulnerabilities).sort();
  if (names.join("\n") !== EXPECTED_FINDINGS.join("\n")) {
    return { ok: false, reason: "unexpected vulnerabilities" };
  }

  const directAdvisories = [];
  for (const name of names) {
    const finding = vulnerabilities[name];
    if (!Array.isArray(finding.via)) {
      return { ok: false, reason: "unexpected vulnerabilities" };
    }
    for (const via of finding.via) {
      if (via && typeof via === "object") {
        directAdvisories.push(via.url);
      }
    }
  }

  // GHSA-fc5q-39xc-vjpf has no patched release and affects only local glob
  // tooling; the exact dev-only chain is tolerated until the expiry above.
  if (directAdvisories.length === 1 && directAdvisories[0] === ADVISORY) {
    return { ok: true, reason: "time-boxed exception" };
  }
  return { ok: false, reason: "unexpected vulnerabilities" };
}

function main() {
  const production = spawnSync(
    "npm",
    ["audit", "--audit-level=moderate", "--omit=dev"],
    {
      encoding: "utf8",
    },
  );
  if (production.stdout) {
    process.stdout.write(production.stdout);
  }
  if (production.stderr) {
    process.stderr.write(production.stderr);
  }

  const audit = spawnSync(
    "npm",
    ["audit", "--audit-level=moderate", "--json"],
    {
      encoding: "utf8",
    },
  );
  if (audit.stdout) {
    process.stdout.write(audit.stdout);
  }
  if (audit.stderr) {
    process.stderr.write(audit.stderr);
  }

  let report = null;
  try {
    report = JSON.parse(audit.stdout);
  } catch {
    report = null;
  }
  const result = evaluateAudit(
    audit.status,
    report,
    new Date(),
    production.status,
  );
  if (!result.ok) {
    console.error(`Dependency audit failed: ${result.reason}`);
    return 1;
  }
  if (result.reason === "time-boxed exception") {
    console.warn(`Accepted ${ADVISORY} in dev-only tooling until ${EXPIRY}`);
  }
  return 0;
}

module.exports = { evaluateAudit };

if (require.main === module) {
  process.exitCode = main();
}
