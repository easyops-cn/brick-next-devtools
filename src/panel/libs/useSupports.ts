import React from "react";
import { HOOK_NAME } from "../../shared/constants";

export function useSupports(...features: string[]): boolean {
  const [supported, setSupported] = React.useState(false);

  React.useEffect((): void => {
    chrome.devtools.inspectedWindow.eval(
      `window.${HOOK_NAME} && window.${HOOK_NAME}.supports(${features
        .map((item) => JSON.stringify(item))
        .join(",")})`,
      function (result: boolean) {
        setSupported(result === true);
      }
    );
  }, [features]);

  return supported;
}
