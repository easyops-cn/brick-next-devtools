import React from "react";
import { BricksByMountPoint } from "./interfaces";

export interface ContextOfBrickTree {
  tree?: BricksByMountPoint;
  setTree?: React.Dispatch<BricksByMountPoint>;
}

export const BrickTreeContext = React.createContext<ContextOfBrickTree>({});

// istanbul ignore next
export const useBrickTreeContext = (): ContextOfBrickTree =>
  React.useContext(BrickTreeContext);
