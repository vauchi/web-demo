// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

//! WASM bindings for vauchi-core workflow engines.
//!
//! Exposes workflow create/screen/action functions to JavaScript
//! via wasm-bindgen. Built with `crypto-wasm` feature for hybrid
//! WebCrypto + RustCrypto backend.

use std::sync::Mutex;
use vauchi_core::ui::*;
use wasm_bindgen::prelude::*;

static WORKFLOWS: Mutex<Vec<Option<Box<dyn WorkflowEngineAny>>>> = Mutex::new(Vec::new());

trait WorkflowEngineAny {
    fn current_screen_json(&self) -> String;
    fn handle_action_json(&mut self, json: &str) -> String;
}

impl<T: WorkflowEngine> WorkflowEngineAny for T {
    fn current_screen_json(&self) -> String {
        serde_json::to_string(&self.current_screen()).unwrap_or_default()
    }
    fn handle_action_json(&mut self, json: &str) -> String {
        match serde_json::from_str::<UserAction>(json) {
            Ok(action) => {
                let result = self.handle_action(action);
                serde_json::to_string(&result).unwrap_or_default()
            }
            Err(e) => format!(r#"{{"error":"{}"}}"#, e),
        }
    }
}

#[wasm_bindgen]
pub fn workflow_create(workflow_type: &str) -> i32 {
    let engine: Box<dyn WorkflowEngineAny> = match workflow_type {
        "onboarding" => Box::new(OnboardingEngine::new()),
        "emergency_shred" => Box::new(EmergencyShredEngine::new()),
        "lock_screen" => Box::new(LockScreenEngine::new(3)),
        _ => return -1,
    };

    let mut workflows = WORKFLOWS.lock().unwrap();
    let handle = workflows.len() as i32;
    workflows.push(Some(engine));
    handle
}

#[wasm_bindgen]
pub fn workflow_current_screen(handle: i32) -> String {
    let workflows = WORKFLOWS.lock().unwrap();
    match workflows.get(handle as usize) {
        Some(Some(engine)) => engine.current_screen_json(),
        _ => r#"{"error":"invalid handle"}"#.to_string(),
    }
}

#[wasm_bindgen]
pub fn workflow_handle_action(handle: i32, action_json: &str) -> String {
    let mut workflows = WORKFLOWS.lock().unwrap();
    match workflows.get_mut(handle as usize) {
        Some(Some(engine)) => engine.handle_action_json(action_json),
        _ => r#"{"error":"invalid handle"}"#.to_string(),
    }
}

#[wasm_bindgen]
pub fn workflow_destroy(handle: i32) {
    let mut workflows = WORKFLOWS.lock().unwrap();
    if let Some(slot) = workflows.get_mut(handle as usize) {
        *slot = None;
    }
}
