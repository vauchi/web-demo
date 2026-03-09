// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import type { TextStyle } from "../../types/core";

interface Props {
  id: string;
  content: string;
  style: TextStyle;
}

export function TextComponent(props: Props) {
  const tag = () => {
    switch (props.style) {
      case "Title": return "h3";
      case "Subtitle": return "h4";
      case "Caption": return "small";
      default: return "p";
    }
  };

  return <p class={`text text-${props.style.toLowerCase()}`}>{props.content}</p>;
}
