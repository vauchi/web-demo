// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

/// TypeScript types matching vauchi-core's JSON-serializable UI types.

export interface ScreenModel {
  screen_id: string;
  title: string;
  subtitle: string | null;
  components: Component[];
  actions: ScreenAction[];
  progress: Progress | null;
}

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
  | { TextInput: { id: string; label: string; value: string; placeholder: string | null; max_length: number | null; validation_error: string | null; input_type: InputType } }
  | { ToggleList: { id: string; label: string; items: ToggleItem[] } }
  | { FieldList: { id: string; fields: FieldDisplay[]; visibility_mode: VisibilityMode; available_groups: string[] } }
  | { CardPreview: { name: string; fields: FieldDisplay[]; group_views: GroupCardView[]; selected_group: string | null } }
  | { InfoPanel: { id: string; icon: string | null; title: string; items: InfoItem[] } }
  | { ContactList: { id: string; contacts: ContactItem[]; searchable: boolean } }
  | { SettingsGroup: { id: string; label: string; items: SettingsItem[] } }
  | { ActionList: { id: string; items: ActionListItem[] } }
  | { StatusIndicator: { id: string; icon: string | null; title: string; detail: string | null; status: Status } }
  | { PinInput: { id: string; label: string; length: number; filled: number; masked: boolean; validation_error: string | null } }
  | { QrCode: { id: string; data: string; mode: QrMode; label: string | null } }
  | { InlineConfirm: { id: string; warning: string; confirm_text: string; cancel_text: string; destructive: boolean } }
  | { EditableText: { id: string; label: string; value: string; editing: boolean; validation_error: string | null } }
  | { Banner: { text: string; action_label: string; action_id: string } }
  | "Divider";

export type TextStyle = "Title" | "Subtitle" | "Body" | "Caption";
export type InputType = "Text" | "Phone" | "Email" | "Password";
export type VisibilityMode = "ReadOnly" | "ShowHide" | "PerGroup";
export type Status = "Pending" | "InProgress" | "Success" | "Failed" | "Warning";
export type QrMode = "Display" | "Scan";

export interface ToggleItem { id: string; label: string; selected: boolean; subtitle: string | null; }
export interface FieldDisplay { id: string; field_type: string; label: string; value: string; visibility: UiFieldVisibility; }
export type UiFieldVisibility = "Shown" | "Hidden" | { Groups: string[] };
export interface GroupCardView { group_name: string; display_name: string; visible_fields: FieldDisplay[]; }
export interface InfoItem { icon: string | null; title: string; detail: string; }
export interface ContactItem { id: string; name: string; subtitle: string | null; avatar_initials: string; status: string | null; searchable_fields: string[]; }
export interface SettingsItem { id: string; label: string; kind: SettingsItemKind; }
export type SettingsItemKind = { Toggle: { enabled: boolean } } | { Value: { value: string } } | { Link: { detail: string | null } } | { Destructive: { label: string } };
export interface ActionListItem { id: string; label: string; icon: string | null; detail: string | null; }

// UserAction tagged union
export type UserAction =
  | { TextChanged: { component_id: string; value: string } }
  | { ItemToggled: { component_id: string; item_id: string } }
  | { ActionPressed: { action_id: string } }
  | { FieldVisibilityChanged: { field_id: string; group_id: string | null; visible: boolean } }
  | { GroupViewSelected: { group_name: string | null } }
  | { SearchChanged: { component_id: string; query: string } }
  | { ListItemSelected: { component_id: string; item_id: string } }
  | { SettingsToggled: { component_id: string; item_id: string } }
  | { UndoPressed: { action_id: string } };
