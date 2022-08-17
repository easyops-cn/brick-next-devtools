import React from "react";
import { LazyEvaluation } from "../../shared/interfaces";

export interface ContextOfEvaluations {
  evaluations?: LazyEvaluation[];
  setEvaluations?: React.Dispatch<React.SetStateAction<LazyEvaluation[]>>;
  preserveLogs?: boolean;
  savePreserveLogs?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EvaluationsContext = React.createContext<ContextOfEvaluations>({});

// istanbul ignore next
export const useEvaluationsContext = (): ContextOfEvaluations =>
  React.useContext(EvaluationsContext);
