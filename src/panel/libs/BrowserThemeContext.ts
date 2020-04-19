import React from "react";
import { BrowserTheme } from "../../shared/interfaces";

export const BrowserThemeContext = React.createContext<BrowserTheme>("light");

// istanbul ignore next
export const useBrowserThemeContext = (): BrowserTheme =>
  React.useContext(BrowserThemeContext);
