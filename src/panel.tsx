import React from "react";
import ReactDOM from "react-dom";
import { Layout } from './components/Layout';

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./style.css";
import { MESSAGE_SOURCE_DEVTOOLS } from './shared';

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

ReactDOM.render(<Layout />, root);

window.addEventListener("message", function onMessage(event: MessageEvent): void {
  if (event?.data.source === MESSAGE_SOURCE_DEVTOOLS && event.data.payload?.type === "navigated") {
    ReactDOM.unmountComponentAtNode(root);
    root.innerHTML = "";
    ReactDOM.render(<Layout />, root);
  }
});
