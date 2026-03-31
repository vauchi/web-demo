// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Match, Switch } from "solid-js";
import type { Component } from "../types/core";
import { TextComponent } from "./components/TextComponent";
import { TextInputComponent } from "./components/TextInputComponent";
import { ToggleListComponent } from "./components/ToggleListComponent";
import { FieldListComponent } from "./components/FieldListComponent";
import { CardPreviewComponent } from "./components/CardPreviewComponent";
import { InfoPanelComponent } from "./components/InfoPanelComponent";
import { ContactListComponent } from "./components/ContactListComponent";
import { SettingsGroupComponent } from "./components/SettingsGroupComponent";
import { ActionListComponent } from "./components/ActionListComponent";
import { StatusIndicatorComponent } from "./components/StatusIndicatorComponent";
import { PinInputComponent } from "./components/PinInputComponent";
import { QrCodeComponent } from "./components/QrCodeComponent";
import { InlineConfirmComponent } from "./components/InlineConfirmComponent";
import { EditableTextComponent } from "./components/EditableTextComponent";
import { DividerComponent } from "./components/DividerComponent";

interface Props {
  component: Component;
  onAction: (actionJson: string) => void;
}

export function ComponentRenderer(props: Props) {
  // Handle string variant "Divider"
  if (props.component === "Divider") {
    return <DividerComponent />;
  }

  const comp = props.component as Exclude<Component, "Divider">;

  return (
    <Switch fallback={<div>Unknown component</div>}>
      <Match when={"Text" in comp && (comp as any).Text}>
        {(data) => <TextComponent {...data()} />}
      </Match>
      <Match when={"TextInput" in comp && (comp as any).TextInput}>
        {(data) => <TextInputComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"ToggleList" in comp && (comp as any).ToggleList}>
        {(data) => <ToggleListComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"FieldList" in comp && (comp as any).FieldList}>
        {(data) => <FieldListComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"CardPreview" in comp && (comp as any).CardPreview}>
        {(data) => <CardPreviewComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"InfoPanel" in comp && (comp as any).InfoPanel}>
        {(data) => <InfoPanelComponent {...data()} />}
      </Match>
      <Match when={"ContactList" in comp && (comp as any).ContactList}>
        {(data) => <ContactListComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"SettingsGroup" in comp && (comp as any).SettingsGroup}>
        {(data) => <SettingsGroupComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"ActionList" in comp && (comp as any).ActionList}>
        {(data) => <ActionListComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"StatusIndicator" in comp && (comp as any).StatusIndicator}>
        {(data) => <StatusIndicatorComponent {...data()} />}
      </Match>
      <Match when={"PinInput" in comp && (comp as any).PinInput}>
        {(data) => <PinInputComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"QrCode" in comp && (comp as any).QrCode}>
        {(data) => <QrCodeComponent {...data()} />}
      </Match>
      <Match when={"InlineConfirm" in comp && (comp as any).InlineConfirm}>
        {(data) => <InlineConfirmComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"EditableText" in comp && (comp as any).EditableText}>
        {(data) => <EditableTextComponent {...data()} onAction={props.onAction} />}
      </Match>
    </Switch>
  );
}
