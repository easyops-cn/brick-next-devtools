import React from "react";
import { BrowserTheme } from "./interfaces";

export const BrowserThemeContext = React.createContext<BrowserTheme>("light");

// istanbul ignore next
export const useBrowserThemeContext = (): BrowserTheme =>
  React.useContext(BrowserThemeContext);
