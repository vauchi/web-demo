// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Match, Switch } from "solid-js";
import type { Component } from "../types/core";
import { TextComponent } from "./components/TextComponent";
import { TextInputComponent } from "./components/TextInputComponent";
import { ToggleListComponent } from "./components/ToggleListComponent";
import { FieldListComponent } from "./components/FieldListComponent";
import { InfoPanelComponent } from "./components/InfoPanelComponent";
import { SettingsGroupComponent } from "./components/SettingsGroupComponent";
import { ActionListComponent } from "./components/ActionListComponent";
import { StatusIndicatorComponent } from "./components/StatusIndicatorComponent";
import { PinInputComponent } from "./components/PinInputComponent";
import { QrCodeComponent } from "./components/QrCodeComponent";
import { InlineConfirmComponent } from "./components/InlineConfirmComponent";
import { EditableTextComponent } from "./components/EditableTextComponent";
import { BannerComponent } from "./components/BannerComponent";
import { DividerComponent } from "./components/DividerComponent";
import { RowComponent } from "./components/RowComponent";
import { ListComponent } from "./components/ListComponent";
import { PreviewComponent } from "./components/PreviewComponent";
import { DropdownComponent } from "./components/DropdownComponent";
import { SliderComponent } from "./components/SliderComponent";
import { ImageCircleComponent } from "./components/ImageCircleComponent";
import { IndicatorComponent } from "./components/IndicatorComponent";
import { SectionedActionListComponent } from "./components/SectionedActionListComponent";

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
      <Match when={"InfoPanel" in comp && (comp as any).InfoPanel}>
        {(data) => <InfoPanelComponent {...data()} />}
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
      <Match when={"Banner" in comp && (comp as any).Banner}>
        {(data) => <BannerComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"Row" in comp && (comp as any).Row}>
        {(data) => <RowComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"List" in comp && (comp as any).List}>
        {(data) => <ListComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"Preview" in comp && (comp as any).Preview}>
        {(data) => <PreviewComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"Dropdown" in comp && (comp as any).Dropdown}>
        {(data) => <DropdownComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"Slider" in comp && (comp as any).Slider}>
        {(data) => <SliderComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"ImageCircle" in comp && (comp as any).ImageCircle}>
        {(data) => <ImageCircleComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"Indicator" in comp && (comp as any).Indicator}>
        {(data) => <IndicatorComponent {...data()} onAction={props.onAction} />}
      </Match>
      <Match when={"SectionedActionList" in comp && (comp as any).SectionedActionList}>
        {(data) => <SectionedActionListComponent {...data()} onAction={props.onAction} />}
      </Match>
    </Switch>
  );
}
