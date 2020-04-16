import { PROP_DEHYDRATED } from "../../shared/constants";
import { DehydratedWrapper } from "../../shared/interfaces";

export function isDehydrated(value: any): value is DehydratedWrapper {
  return !!value?.[PROP_DEHYDRATED];
}

export function isObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value;
}
