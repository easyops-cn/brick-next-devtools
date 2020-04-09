import React from "react";
import ReactDOM from "react-dom";

import "normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./style.css";

import { Layout } from './components/Layout';

const root = document.createElement("div");
root.id = "root";
document.body.appendChild(root);

ReactDOM.render(<Layout />, root);
