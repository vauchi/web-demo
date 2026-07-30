// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

export type SurfaceId = string;
export type InteractionId = string;
export type BindingId = string;

export interface AccessibilitySpec {
  label: string;
  description: string | null;
}

export type StandardShortcut = "back" | "activate_primary" | "undo";
export type ActionTone = "standard" | "destructive";

export interface ActionSpec {
  interaction_id: InteractionId;
  label: string;
  accessibility_label: string;
  icon_token: string | null;
  enabled: boolean;
  tone?: ActionTone;
  shortcut: StandardShortcut | null;
}

export interface ContextBar {
  back: ActionSpec | null;
  navigation: ActionSpec | null;
  primary: ActionSpec | null;
  secondary: ActionSpec | null;
}

export type OverlayKind = "navigation" | "action_menu";

export interface OverlaySpec {
  kind: OverlayKind;
  title: string | null;
  items: ActionSpec[];
}

export type InputMode = "touch" | "pointer" | "keyboard";
export type MotionPreference = "full" | "reduced";
export type WindowClass = "compact" | "medium" | "expanded";
export type PaneLayout = "single" | "split";

export interface PresentationProfile {
  window_class: WindowClass;
  pane_layout: PaneLayout;
  primary_surface: SurfaceId;
  detail_surface: SurfaceId | null;
  active_surface: SurfaceId;
}

export interface PresentationTokens {
  spacing_small: number;
  spacing_medium: number;
  spacing_large: number;
  corner_radius: number;
  minimum_target_size: number;
}

export interface ChoiceOption {
  id: string;
  label: string;
}

export interface PresentationPaging {
  total_count: number;
  offset: number;
  window: number;
}

export interface PresentationRow {
  title: string;
  subtitle: string | null;
  detail: string | null;
  icon_token: string | null;
  image_data: number[] | null;
  fallback_text: string | null;
  selected: boolean;
  enabled: boolean;
  activation: ActionSpec | null;
  secondary_actions: ActionSpec[];
  controls: PresentationNode[];
  accessibility: AccessibilitySpec;
}

export type PresentationNode =
  | { Text: { id: BindingId | null; content: string; style: "heading" | "body" | "caption" | "monospace" | "muted"; accessibility: AccessibilitySpec } }
  | { Input: { binding_id: BindingId; label: string; value: string; placeholder: string | null; input_kind: "text" | "email" | "phone" | "url" | "password" | "number" | "search" | "pin"; max_length: number | null; validation_error: string | null; enabled: boolean; accessibility: AccessibilitySpec } }
  | { Toggle: { binding_id: BindingId; label: string; value: boolean; enabled: boolean; accessibility: AccessibilitySpec } }
  | { Choice: { binding_id: BindingId; label: string; selected: string | null; options: ChoiceOption[]; enabled: boolean; accessibility: AccessibilitySpec } }
  | { Group: { id: BindingId | null; label: string | null; axis: "horizontal" | "vertical"; children: PresentationNode[]; accessibility: AccessibilitySpec } }
  | { List: { id: BindingId; label: string | null; rows: PresentationRow[]; searchable: boolean; paging: PresentationPaging | null; accessibility: AccessibilitySpec } }
  | { Image: { id: BindingId | null; data: number[] | null; fallback_text: string | null; shape: "natural" | "circle"; brightness: number; activation: ActionSpec | null; accessibility: AccessibilitySpec } }
  | { Status: { id: BindingId | null; title: string; detail: string | null; icon_token: string | null; badge: string | null; tone: "neutral" | "accent" | "success" | "warning" | "error"; activation: ActionSpec | null; accessibility: AccessibilitySpec } }
  | { Qr: { id: BindingId; payloads: string[]; purpose: "display" | "capture"; label: string | null; accessibility: AccessibilitySpec } }
  | { Confirmation: { id: BindingId; warning: string; confirm: ActionSpec; cancel: ActionSpec; accessibility: AccessibilitySpec } }
  | { Slider: { binding_id: BindingId; label: string; value: number; minimum: number; maximum: number; step: number | null; minimum_icon: string | null; maximum_icon: string | null; accessibility: AccessibilitySpec } }
  | { Progress: { label: string | null; value: number | null; accessibility: AccessibilitySpec } }
  | "Divider";

export interface SurfaceSpec {
  surface_id: SurfaceId;
  revision: number;
  title: string;
  subtitle: string | null;
  accessibility_label: string;
  layout: "scroll" | "fixed" | "pinned";
  tokens: PresentationTokens;
  nodes: PresentationNode[];
}

export type InputValue =
  | { Text: string }
  | { Boolean: boolean }
  | { Choice: string | null }
  | { Number: number };

export type PresentationEvent =
  | { SurfaceActivated: { surface_id: SurfaceId } }
  | { ActionActivated: { surface_id: SurfaceId; interaction_id: InteractionId } }
  | { ValueChanged: { surface_id: SurfaceId; binding_id: BindingId; value: InputValue } }
  | { BackRequested: { surface_id: SurfaceId } }
  | { OverlayDismissed: { surface_id: SurfaceId; kind: OverlayKind } }
  | { PresentationEnvironmentChanged: { available_width: number; available_height: number; input_modes: InputMode[]; motion: MotionPreference } };

export type PresentationCommand =
  | { ReplaceSurface: { surface: SurfaceSpec } }
  | { SetContextBar: { surface_id: SurfaceId; revision: number; bar: ContextBar } }
  | { PresentOverlay: { surface_id: SurfaceId; revision: number; overlay: OverlaySpec } }
  | { SetPresentationProfile: { profile: PresentationProfile } };

export type PlatformCommand =
  | PresentationCommand
  | { PresentAlert: { alert: { title: string; message: string } } }
  | { ShowToast: { toast: { message: string; undo_action_id?: string | null; undo_label?: string | null } } }
  | { OpenExternalUrl: { url: string } }
  | { ExportFile: { file: unknown } }
  | "PerformNativeBack"
  | "ResetApplication"
  | { PostNotification: { notification: unknown } }
  | Record<string, unknown>;
