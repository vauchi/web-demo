// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

/// TypeScript types matching vauchi-core's JSON-serializable UI types.

export interface A11y {
  label?: string;
  hint?: string;
  role?: string;
}

export interface ScreenModel {
  screen_id: string;
  title: string;
  subtitle: string | null;
  components: Component[];
  actions: ScreenAction[];
  progress: Progress | null;
  // Serde omits this when "Scroll" (default); "Fixed" disables the scroll container.
  layout?: ScreenLayout;
  // ADR-044 Am2a: core-driven chrome / tabs retire the boolean-family flags.
  nav_actions?: ScreenAction[];
  nav_tab_id?: string;
}

export type ScreenLayout = "Scroll" | "Fixed";

export interface Progress {
  current_step: number;
  total_steps: number;
  label: string | null;
}

export interface ScreenAction {
  id: string;
  label: string;
  style: "Primary" | "Secondary" | "Destructive";
  enabled: boolean;
}

// Component is a tagged union (serde externally tagged)
export type Component =
  | { Text: { id: string; content: string; style: TextStyle } }
  | { TextInput: { id: string; label: string; value: string; placeholder: string | null; max_length: number | null; validation_error: string | null; input_type: InputType; a11y?: A11y } }
  | { ToggleList: { id: string; label: string; items: ToggleItem[]; a11y?: A11y } }
  | { FieldList: { id: string; title: string; fields: FieldDisplay[]; visibility_mode: VisibilityMode; available_scopes: string[]; a11y?: A11y } }
  | { InfoPanel: { id: string; icon: string | null; title: string; items: InfoItem[]; a11y?: A11y } }
  | { SettingsGroup: { id: string; label: string; items: SettingsItem[] } }
  | { ActionList: { id: string; items: ActionListItem[] } }
  | { StatusIndicator: { id: string; icon: string | null; title: string; detail: string | null; status: Status; status_label: string; a11y?: A11y } }
  | { PinInput: { id: string; label: string; length: number; filled: number; masked: boolean; validation_error: string | null; a11y?: A11y } }
  | { QrCode: { id: string; data: string; mode: QrMode; label: string | null; a11y?: A11y } }
  | { InlineConfirm: { id: string; warning: string; confirm_text: string; cancel_text: string; confirm_action_id: string; cancel_action_id: string; destructive: boolean; a11y?: A11y } }
  | { EditableText: { id: string; label: string; value: string; edit_text: string; save_text: string; cancel_text: string; edit_action_id: string; save_action_id: string; cancel_action_id: string; editing: boolean; validation_error: string | null; a11y?: A11y } }
  | { Banner: { text: string; action_label: string; action_id: string; a11y?: A11y } }
  | { Row: { id: string; items: Component[] } }
  | { List: { id: string; items: Item[]; searchable: boolean } }
  | { Preview: { name: string; initials: string; avatar_data?: number[] | null; fields: FieldDisplay[]; variants: PreviewVariant[]; selected_variant: string | null; visible_fields?: FieldDisplay[]; a11y?: A11y } }
  | { Dropdown: { id: string; label: string; selected: string | null; options: DropdownOption[]; a11y?: A11y } }
  | { ImageCircle: { id: string; image_data?: number[] | null; initials: string; bg_color?: [number, number, number] | null; brightness?: number; editable?: boolean; edit_action_id?: string | null; a11y?: A11y } }
  | { Slider: { id: string; label: string; value: number; min: number; max: number; step?: number; min_icon?: string | null; max_icon?: string | null; a11y?: A11y } }
  | { Indicator: { id: string; label: string; kind: IndicatorKind; action_id?: string | null; a11y?: A11y } }
  | { SectionedActionList: { id: string; sections: Section[] } }
  | "Divider";

export type TextStyle = "Title" | "Subtitle" | "Body" | "Caption";
export type InputType = "Text" | "Phone" | "Email" | "Password";
export type VisibilityMode = "ReadOnly" | "ShowHide" | "PerGroup";
export type Status = "Pending" | "InProgress" | "Success" | "Failed" | "Warning";
export type QrMode = "Display" | "Scan";
export type IndicatorKind = "Active" | "Error" | "Neutral" | "Busy";
export type ListItemActionKind = "archive" | "unarchive" | "hide" | "unhide" | "delete" | "undelete" | "custom";

export interface ToggleItem { id: string; label: string; selected: boolean; subtitle: string | null; a11y?: A11y; }
export interface FieldDisplay { id: string; field_type: string; label: string; value: string; visibility: UiFieldVisibility; a11y?: A11y; }
export type UiFieldVisibility = "Shown" | "Hidden" | { Scopes: string[] };
export interface InfoItem { icon: string | null; title: string; detail: string; }
export interface SettingsItem { id: string; label: string; kind: SettingsItemKind; }
export type SettingsItemKind = { Toggle: { enabled: boolean } } | { Value: { value: string } } | { Link: { detail: string | null } } | { Destructive: { label: string } };
export interface ActionListItem { id: string; label: string; icon: string | null; detail: string | null; }

// Component::List item shape (Wire Humble: UI-shaped, domain-agnostic).
export interface Item { id: string; name: string; subtitle: string | null; avatar_initials: string; status: string | null; actions?: ListItemAction[]; a11y?: A11y; }
export interface ListItemAction { id: string; label: string; kind: ListItemActionKind; destructive?: boolean; }

// Component::Preview alternate-view shape.
export interface PreviewVariant { variant_id: string; display_name: string; visible_fields: FieldDisplay[]; }

// Component::Dropdown option shape.
export interface DropdownOption { id: string; label: string; }

// Component::SectionedActionList section shape.
export interface Section { id: string; label: string; items: ActionListItem[]; }

// UserAction tagged union
export type UserAction =
  | { TextChanged: { component_id: string; value: string } }
  | { ItemToggled: { component_id: string; item_id: string } }
  | { ActionPressed: { action_id: string } }
  | { NavigateToTab: { action_id: string } }
  | "NavigateBack"
  | "AppForegrounded"
  | { FieldVisibilityChanged: { field_id: string; group_id: string | null; visible: boolean } }
  | { VariantSelected: { variant_id: string | null } }
  | { SearchChanged: { component_id: string; query: string } }
  | { ListItemSelected: { component_id: string; item_id: string } }
  | { ListItemAction: { component_id: string; item_id: string; action_id: string } }
  | { SettingsToggled: { component_id: string; item_id: string } }
  | { SliderChanged: { component_id: string; value_milli: number } }
  | { UndoPressed: { action_id: string } };

// Core command carried inside ActionResult::Commands or an on_wakeup envelope.
// ADR-044 Am2a: ScheduleWakeup replaces the frontend's requires_poll loop.
export type Command =
  | { ScheduleWakeup: { earliest_secs: number; deadline_secs: number; min_interval_secs: number } };

// Result of handle_action. Keeps the shape loose enough for the WASM bridge
// JSON while surfacing the variants the web demo acts on.
export type ActionResult =
  | "Complete"
  | "PerformNativeBack"
  | { error: string }
  | { UpdateScreen: ScreenModel }
  | { NavigateTo: ScreenModel }
  | { ShowAlert: { title: string; message: string } }
  | { CompleteWith: { destination: PostOnboardingDestination } }
  | { OnboardingComplete: { destination: PostOnboardingDestination } }
  | { StartDeviceLink: { role: DeviceLinkRole } }
  | { OpenContact: { contact_id: string } }
  | { ContactAction: { contact_id: string; kind: ContactActionKind; undo_action_id: string } }
  | { ValidationError: { component_id: string; message: string } }
  | { Commands: Command[] }
  | { WipeComplete: null };

export type PostOnboardingDestination = "Home" | "Onboarding" | string;
export type DeviceLinkRole = "Initiator" | "Responder";
export type ContactActionKind = "archive" | "unarchive" | "hide" | "unhide" | "delete" | "undelete";

// Envelope returned by the WASM on_wakeup function.
export interface WakeupEnvelope {
  notifications: unknown[];
  commands: Command[];
}
