// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { Match, Switch } from "solid-js";
import type { TextStyle } from "../../types/core";

interface Props {
  id: string;
  content: string;
  style: TextStyle;
}

export function TextComponent(props: Props) {
  return (
    <Switch>
      <Match when={props.style === "Title"}>
        <h1 class="text text-title">{props.content}</h1>
      </Match>
      <Match when={props.style === "Subtitle"}>
        <h3 class="text text-subtitle">{props.content}</h3>
      </Match>
      <Match when={props.style === "Caption"}>
        <small class="text text-caption">{props.content}</small>
      </Match>
      <Match when={props.style === "Body"}>
        <p class="text text-body">{props.content}</p>
      </Match>
    </Switch>
  );
}
