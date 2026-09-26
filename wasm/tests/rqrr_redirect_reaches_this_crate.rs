// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

//! The `[patch.crates-io]` rqrr redirect in `Cargo.toml` must name a core tag
//! whose fork satisfies the rqrr version core requires. When the two drift
//! apart cargo keeps the fork as a dead lock entry and silently resolves the
//! registry crate instead — which is what the v0.67.0 bump did. Every rqrr
//! entry is checked, because a stale redirect leaves two of them.
//! Record: `_private/docs/problems/2026-09-07-core-rqrr-patch-does-not-reach-consumers/`.

const LOCK: &str = include_str!("../Cargo.lock");

fn rqrr_sources() -> Vec<String> {
    let mut sources = Vec::new();
    let mut in_rqrr = false;
    for line in LOCK.lines() {
        let line = line.trim();
        if line == "[[package]]" {
            in_rqrr = false;
        } else if line == "name = \"rqrr\"" {
            in_rqrr = true;
        } else if in_rqrr && let Some(rest) = line.strip_prefix("source = ") {
            sources.push(rest.trim_matches('"').to_string());
        }
    }
    sources
}

#[test]
fn every_rqrr_in_the_lock_resolves_from_the_core_fork() {
    let sources = rqrr_sources();
    assert_eq!(
        sources.len(),
        1,
        "exactly one rqrr must resolve; two means the redirect is stale: {sources:?}"
    );
    assert!(
        sources[0].starts_with("git+https://gitlab.com/vauchi/core.git"),
        "rqrr must come from core's vendored fork, got: {}",
        sources[0]
    );
}
