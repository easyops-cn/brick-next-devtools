import React from "react";
import ReactDOM from "react-dom";

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import { BrickTreeContainer } from './components/BrickTreeContainer';

const root = document.createElement("div");
document.body.appendChild(root);
root.classList.add("bp3-dark");
root.classList.add("bp3-focus-disabled");
root.style.padding = "10px";

ReactDOM.render(<BrickTreeContainer />, root);
