import React from "react";
import ReactDOM from "react-dom";
import { Layout } from "./components/Layout";
import {
  MESSAGE_SOURCE_DEVTOOLS,
  MESSAGE_SOURCE_PANEL,
} from "../shared/constants";

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./style.css";

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

ReactDOM.render(<Layout />, root);
// istanbul ignore next
window.addEventListener("message", function onMessage(
  event: MessageEvent
): void {
  if (
    event?.data.source === MESSAGE_SOURCE_DEVTOOLS &&
    event.data.payload?.type === "navigated"
  ) {
    ReactDOM.unmountComponentAtNode(root);
    root.innerHTML = "";
    ReactDOM.render(<Layout />, root);
  }
});
