import React from "react";
import { Evaluation } from "../../shared/interfaces";

export interface ContextOfEvaluations {
  evaluations?: Evaluation[];
  setEvaluations?: React.Dispatch<React.SetStateAction<Evaluation[]>>;
  preserveLogs?: boolean;
  savePreserveLogs?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EvaluationsContext = React.createContext<ContextOfEvaluations>({});

// istanbul ignore next
export const useEvaluationsContext = (): ContextOfEvaluations =>
  React.useContext(EvaluationsContext);
