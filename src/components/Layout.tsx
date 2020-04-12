import React from "react";
import classNames from "classnames";
import { TreeWrapper } from "./TreeWrapper";
import { SelectedBrickWrapper } from "./SelectedBrickWrapper";
import { BrickTreeContext } from "../libs/BrickTreeContext";
import { BrickData, BricksByMountPoint } from "../libs/interfaces";
import { SelectedBrickContext } from "../libs/SelectedBrickContext";
import { BrowserThemeContext } from "../libs/BrowserTheme";
import { CollapsedBrickIdsContext } from "../libs/CollapsedBrickIdsContext";
import { ShowFullNameContext } from "../libs/ShowFullNameContext";

export function Layout(): React.ReactElement {
  const [tree, setTree] = React.useState<BricksByMountPoint>();
  const [collapsedBrickIds, setCollapsedBrickIds] = React.useState<number[]>(
    []
  );
  const [showFullName, setShowFullName] = React.useState<boolean>(false);
  const [selectedBrick, setSelectedBrick] = React.useState<BrickData>();
  const theme = chrome.devtools.panels.themeName === "dark" ? "dark" : "light";

  return (
    <div
      className={classNames("layout bp3-focus-disabled", {
        "bp3-dark": theme === "dark",
      })}
    >
      <BrowserThemeContext.Provider value={theme}>
        <SelectedBrickContext.Provider
          value={{
            selectedBrick,
            setSelectedBrick,
          }}
        >
          <BrickTreeContext.Provider
            value={{
              tree,
              setTree,
            }}
          >
            <CollapsedBrickIdsContext.Provider
              value={{
                collapsedBrickIds,
                setCollapsedBrickIds,
              }}
            >
              <ShowFullNameContext.Provider
                value={{ showFullName, setShowFullName }}
              >
                <TreeWrapper />
              </ShowFullNameContext.Provider>
            </CollapsedBrickIdsContext.Provider>
          </BrickTreeContext.Provider>
          <SelectedBrickWrapper />
        </SelectedBrickContext.Provider>
      </BrowserThemeContext.Provider>
    </div>
  );
}
