import { DehydratedWrapper, Dehydrated } from "../shared/interfaces";
import { PROP_DEHYDRATED } from "../shared/constants";

/**
 * Make the `value` serializable for `postMessage`.
 * E.g. transform the non-stringify-able data, and handle circular references.
 *
 * @param value data to transfer.
 * @param repo  repository to collect circular references.
 * @returns original value if it's serializable, or a dehydrated wrapper if not.
 */
export function dehydrate(
  value: unknown,
  repo: any[],
  memo = new WeakMap()
): any {
  if (memo.has(value as any)) {
    const processed = memo.get(value as any);
    let repoIndex = repo.indexOf(processed);
    if (repoIndex < 0) {
      repoIndex = repo.length;
      repo.push(processed);
    }
    return wrapDehydrated({
      type: "ref",
      ref: repoIndex,
    });
  }

  if (Array.isArray(value)) {
    const processed: any[] = [];
    memo.set(value, processed);
    value.forEach((item) => {
      processed.push(dehydrate(item, repo, memo));
    });
    return processed;
  }

  if (typeof value === "object" && value) {
    if (value.constructor === Object) {
      const processed: Record<string, any> = {};
      memo.set(value, processed);
      Object.entries(value).forEach((entry) => {
        processed[entry[0]] = dehydrate(entry[1], repo, memo);
      });
      return processed;
    }

    const processed = wrapDehydrated({
      type: "object",
      constructorName: String(value.constructor?.name || "null"),
    });
    memo.set(value, processed);

    if (value instanceof Event) {
      appendDehydratedChildren(
        processed,
        dehydrate(
          {
            type: value.type,
            ...(value instanceof CustomEvent && {
              detail: value.detail,
            }),
          },
          repo,
          memo
        )
      );
    }

    return processed;
  }

  if (typeof value === "function") {
    const processed = wrapDehydrated({
      type: "function",
    });
    memo.set(value, processed);
    return processed;
  }

  if (typeof value === "symbol") {
    return wrapDehydrated({
      type: "symbol",
    });
  }

  if (
    Number.isNaN(value) ||
    value === Infinity ||
    value === -Infinity ||
    value === undefined
  ) {
    return wrapDehydrated({
      type: String(value) as "NaN" | "Infinity" | "-Infinity" | "undefined",
    });
  }

  return value;
}

// This API is exposed to Brick Next itself, keep compatible.
export function restoreDehydrated(value: unknown): any {
  const dehydrated: Dehydrated = (value as any)?.[PROP_DEHYDRATED];
  if (dehydrated && dehydrated.type === "object" && dehydrated.children) {
    if (dehydrated.constructorName === "CustomEvent") {
      return new CustomEvent(dehydrated.children.type, {
        detail: dehydrated.children.detail,
      });
    }
    if (dehydrated.constructorName === "Event") {
      return new Event(dehydrated.children.type);
    }
  }
  return value;
}

function wrapDehydrated(data: Dehydrated): DehydratedWrapper {
  return {
    [PROP_DEHYDRATED]: data,
  };
}

function appendDehydratedChildren(
  dehydrated: DehydratedWrapper,
  children: any
): void {
  dehydrated[PROP_DEHYDRATED].children = children;
}
