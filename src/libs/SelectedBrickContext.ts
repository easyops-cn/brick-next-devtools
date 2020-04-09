import React from "react";
import { BrickData } from './interfaces';

export interface ContextOfSelectedBrick {
  selectedBrick?: BrickData;
  setSelectedBrick?: React.Dispatch<BrickData>;
}

export const SelectedBrickContext = React.createContext<ContextOfSelectedBrick>({});

export const useSelectedBrickContext = (): ContextOfSelectedBrick =>
  React.useContext(SelectedBrickContext);
