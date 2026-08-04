// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

//! Humble WASM shell for Core's generic Event/Command presentation reducer.

use std::sync::Mutex;

use vauchi_app::ui::DemoPresentationEngine;
use vauchi_core::{Command, Event};
use wasm_bindgen::prelude::*;

static WORKFLOWS: Mutex<Vec<Option<DemoPresentationEngine>>> = Mutex::new(Vec::new());

fn command_json(result: Result<Vec<Command>, String>) -> String {
    match result {
        Ok(commands) => serde_json::to_string(&commands)
            .unwrap_or_else(|error| serde_json::json!({ "error": error.to_string() }).to_string()),
        Err(error) => serde_json::json!({ "error": error }).to_string(),
    }
}

#[wasm_bindgen]
pub fn workflow_create(workflow_type: &str) -> i32 {
    let Ok(workflow) = DemoPresentationEngine::new(workflow_type) else {
        return -1;
    };
    let mut workflows = WORKFLOWS.lock().unwrap();
    let handle = workflows.len() as i32;
    workflows.push(Some(workflow));
    handle
}

#[wasm_bindgen]
pub fn workflow_initial_commands(handle: i32) -> String {
    let mut workflows = WORKFLOWS.lock().unwrap();
    let result = workflows
        .get_mut(handle as usize)
        .and_then(Option::as_mut)
        .ok_or_else(|| "invalid handle".to_owned())
        .and_then(DemoPresentationEngine::initial_commands);
    command_json(result)
}

#[wasm_bindgen]
pub fn workflow_dispatch(handle: i32, event_json: &str) -> String {
    let event = match serde_json::from_str::<Event>(event_json) {
        Ok(event) => event,
        Err(error) => {
            return serde_json::json!({ "error": error.to_string() }).to_string();
        }
    };
    let mut workflows = WORKFLOWS.lock().unwrap();
    let result = workflows
        .get_mut(handle as usize)
        .and_then(Option::as_mut)
        .ok_or_else(|| "invalid handle".to_owned())
        .and_then(|workflow| workflow.dispatch(event));
    command_json(result)
}

#[wasm_bindgen]
pub fn workflow_destroy(handle: i32) {
    let mut workflows = WORKFLOWS.lock().unwrap();
    if let Some(slot) = workflows.get_mut(handle as usize) {
        *slot = None;
    }
}

// INLINE_TEST_REQUIRED: the WASM boundary tests exercise the module-private
// workflow registry and serialized command bridge.
#[cfg(test)]
mod tests {
    use super::*;
    use serde::Deserialize;
    use serde_json::Value;
    use vauchi_core::{ContextBar, SurfaceId, SurfaceSpec};

    // Fixture versions are exact contracts: additive fields require an
    // explicit WASM-consumer review rather than being ignored silently.
    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct PresentationContractFixture {
        schema_version: u64,
        initial_commands: Vec<Command>,
        steps: Vec<PresentationContractStep>,
        expected_state: ExpectedPresentationState,
    }

    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct PresentationContractStep {
        // The WASM consumer decodes both directions of the wire corpus even
        // though Core's AppEngine owns the authoritative event replay.
        #[serde(rename = "event")]
        _event: Event,
        commands: Vec<Command>,
    }

    #[derive(Deserialize)]
    #[serde(deny_unknown_fields)]
    struct ExpectedPresentationState {
        active_surface_id: SurfaceId,
        surface: SurfaceSpec,
        context_bar: ContextBar,
    }

    // @scenario: generic_presentation_protocol.feature :: Every shell renders the same prepared presentation
    #[test]
    fn wasm_decodes_the_core_owned_presentation_contract_fixture() {
        let fixture: PresentationContractFixture =
            serde_json::from_str(vauchi_app::ui::presentation_contract_fixture_json())
                .expect("Core-owned presentation fixture");
        assert_eq!(
            fixture.schema_version, 1,
            "fixture schema changed; re-verify the WASM decoder contract"
        );
        assert!(!fixture.initial_commands.is_empty());
        assert!(!fixture.steps.is_empty());
        assert!(fixture.steps.iter().all(|step| !step.commands.is_empty()));
        assert_eq!(
            fixture.expected_state.active_surface_id,
            fixture.expected_state.surface.surface_id
        );
        assert!(fixture.expected_state.context_bar.primary.is_some());
    }

    // @scenario: generic_presentation_protocol.feature :: Release contains only the generic action system
    #[test]
    fn initial_batch_uses_only_the_generic_presentation_protocol() {
        let handle = workflow_create("onboarding");

        let commands: Vec<Value> =
            serde_json::from_str(&workflow_initial_commands(handle)).expect("command JSON");

        assert!(
            commands
                .iter()
                .any(|command| command.get("ReplaceSurface").is_some())
        );
        assert!(
            commands
                .iter()
                .any(|command| command.get("SetContextBar").is_some())
        );
        assert!(
            commands
                .iter()
                .all(|command| command.get("UpdateScreen").is_none())
        );
        workflow_destroy(handle);
    }

    // @scenario: generic_presentation_protocol.feature :: Available window drives structural composition
    #[test]
    fn environment_event_returns_core_classified_profile() {
        let handle = workflow_create("onboarding");
        let _ = workflow_initial_commands(handle);
        let event = r#"{
            "PresentationEnvironmentChanged": {
                "available_width": 700,
                "available_height": 900,
                "input_modes": ["touch"],
                "motion": "full"
            }
        }"#;

        let commands: Vec<Value> =
            serde_json::from_str(&workflow_dispatch(handle, event)).expect("command JSON");

        assert!(commands.iter().any(|command| {
            command
                .get("SetPresentationProfile")
                .and_then(|value| value.get("profile"))
                .and_then(|value| value.get("window_class"))
                == Some(&Value::String("medium".into()))
        }));
        workflow_destroy(handle);
    }

    // @scenario: generic_presentation_protocol.feature :: Invalid boundary input fails safely
    #[test]
    fn invalid_event_fails_closed() {
        let handle = workflow_create("onboarding");

        let response: Value =
            serde_json::from_str(&workflow_dispatch(handle, r#"{"unknown":true}"#))
                .expect("error JSON");

        assert!(response.get("error").is_some());
        workflow_destroy(handle);
    }
}
