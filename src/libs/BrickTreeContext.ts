import React from "react";
import { RichBrickData } from './interfaces';

export interface ContextOfBrickTree {
  tree?: RichBrickData[];
  setTree?: React.Dispatch<RichBrickData[]>;
}

export const BrickTreeContext = React.createContext<ContextOfBrickTree>({});

export const useBrickTreeContext = (): ContextOfBrickTree =>
  React.useContext(BrickTreeContext);
