import React from "react";

export interface ContextOfShowFullName {
  showFullName?: boolean;
  setShowFullName?: React.Dispatch<boolean>;
}

export const ShowFullNameContext = React.createContext<ContextOfShowFullName>(
  {}
);

// istanbul ignore next
export const useShowFullNameContext = (): ContextOfShowFullName =>
  React.useContext(ShowFullNameContext);
