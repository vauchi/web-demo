// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

//! WASM bindings for vauchi-core workflow engines.
//!
//! Exposes workflow create/screen/action functions to JavaScript
//! via wasm-bindgen. Uses pure RustCrypto stack (no C FFI).

use std::sync::Mutex;
use vauchi_app::i18n::Locale;
use vauchi_app::ui::*;
use wasm_bindgen::prelude::*;

static WORKFLOWS: Mutex<Vec<Option<Box<dyn WorkflowEngineAny + Send>>>> = Mutex::new(Vec::new());

trait WorkflowEngineAny {
    fn current_screen_json(&self) -> String;
    fn handle_action_json(&mut self, json: &str) -> String;
    fn on_wakeup_json(&mut self) -> String;
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
    fn on_wakeup_json(&mut self) -> String {
        // Mirrors PlatformAppEngine::on_wakeup: run the same advances as
        // poll_notifications and emit the next ScheduleWakeup so the shell
        // can re-arm (ADR-044 Am2a Option C).
        let notifications = self.poll_notifications();
        let commands = serde_json::json!([{
            "ScheduleWakeup": {
                "earliest_secs": 30,
                "deadline_secs": 90,
                "min_interval_secs": 30,
            }
        }]);
        serde_json::json!({ "notifications": notifications, "commands": commands }).to_string()
    }
}

#[wasm_bindgen]
pub fn workflow_create(workflow_type: &str) -> i32 {
    let engine: Box<dyn WorkflowEngineAny + Send> = match workflow_type {
        "onboarding" => Box::new(OnboardingEngine::new()),
        "emergency_shred" => Box::new(EmergencyShredEngine::new(Locale::English)),
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
pub fn workflow_on_wakeup(handle: i32) -> String {
    let mut workflows = WORKFLOWS.lock().unwrap();
    match workflows.get_mut(handle as usize) {
        Some(Some(engine)) => engine.on_wakeup_json(),
        _ => r#"{"notifications":[],"commands":[]}"#.to_string(),
    }
}

#[wasm_bindgen]
pub fn workflow_destroy(handle: i32) {
    let mut workflows = WORKFLOWS.lock().unwrap();
    if let Some(slot) = workflows.get_mut(handle as usize) {
        *slot = None;
    }
}
