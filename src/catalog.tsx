// SPDX-FileCopyrightText: 2026 Mattia Egloff <mattia.egloff@pm.me>
// SPDX-License-Identifier: GPL-3.0-or-later

import { render } from "solid-js/web";
import CatalogApp from "./CatalogApp";

const root = document.getElementById("root");
if (root) {
  render(() => <CatalogApp />, root);
}
