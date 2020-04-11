import React from "react";
import { BrowserTheme } from "./interfaces";

export const BrowserThemeContext = React.createContext<BrowserTheme>("light");

export const useBrowserThemeContext = (): BrowserTheme =>
  React.useContext(BrowserThemeContext);
