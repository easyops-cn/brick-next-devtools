import { PROP_DEHYDRATED } from "../../shared/constants";
import { DehydratedWrapper } from "../../shared/interfaces";

export function isDehydrated(value: unknown): value is DehydratedWrapper {
  return !!(value as any)?.[PROP_DEHYDRATED];
}

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && !!value;
}
