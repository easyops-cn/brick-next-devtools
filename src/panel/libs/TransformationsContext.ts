import React from "react";
import { Transformation } from "../../shared/interfaces";

export interface ContextOfTransformations {
  transformations?: Transformation[];
  setTransformations?: React.Dispatch<React.SetStateAction<Transformation[]>>;
}

export const TransformationsContext = React.createContext<
  ContextOfTransformations
>({});

// istanbul ignore next
export const useTransformationsContext = (): ContextOfTransformations =>
  React.useContext(TransformationsContext);
