import { Dehydrated } from "../../shared/interfaces";
import { PROP_DEHYDRATED } from "../../shared/constants";
import { isObject } from "./utils";

const hydratedSymbol = Symbol();
// istanbul ignore next
function noop(): void {
  // noop
}

/**
 * Re-hydrate a dehydrated data.
 *
 * @param value
 * @param repo
 * @returns re-hydrated data
 */
export function hydrate(
  value: any,
  repo: any[],
  memo = new Map<number, any>(),
  ref?: number
): any {
  const dehydrated: Dehydrated = value?.[PROP_DEHYDRATED];
  if (dehydrated) {
    switch (dehydrated.type) {
      case "ref":
        if (memo.has(dehydrated.ref)) {
          return memo.get(dehydrated.ref);
        }
        return hydrate(repo[dehydrated.ref], repo, memo, dehydrated.ref);
      case "object":
        return {
          [PROP_DEHYDRATED]: {
            ...dehydrated,
            children: hydrate(dehydrated.children, repo, memo),
          },
        };
      case "undefined":
        return undefined;
      case "NaN":
        return NaN;
      case "Infinity":
        return Infinity;
      case "-Infinity":
        return -Infinity;
      case "symbol":
        return hydratedSymbol;
      case "function":
        return noop;
      // Should never reach `default`.
      // istanbul ignore next
      default:
        return value;
    }
  }

  if (Array.isArray(value)) {
    const processed: any[] = [];
    if (ref !== undefined) {
      memo.set(ref, processed);
    }
    value.forEach((item) => {
      processed.push(hydrate(item, repo, memo));
    });
    return processed;
  }

  if (isObject(value)) {
    const processed: Record<string, any> = {};
    if (ref !== undefined) {
      memo.set(ref, processed);
    }
    Object.entries(value).forEach((entry) => {
      processed[entry[0]] = hydrate(entry[1], repo, memo);
    });
    return processed;
  }

  return value;
}
