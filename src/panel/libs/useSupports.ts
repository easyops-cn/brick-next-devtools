import React from "react";
import { HOOK_NAME } from "../../shared/constants";
import { useEvalOptions } from "./useEvalOptions";

export function useSupports(...features: string[]): boolean {
  const [supported, setSupported] = React.useState(false);
  const evalOptions = useEvalOptions();

  React.useEffect((): void => {
    chrome.devtools.inspectedWindow.eval(
      `window.${HOOK_NAME} && window.${HOOK_NAME}.supports(${features
        .map((item) => JSON.stringify(item))
        .join(",")})`,
      evalOptions,
      function (result: boolean) {
        setSupported(result === true);
      }
    );
  }, [evalOptions, features]);

  return supported;
}
