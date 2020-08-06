import { dehydrate } from "./dehydrate";
import { EmitData } from "../shared/interfaces";
import { MESSAGE_SOURCE_HOOK } from "../shared/constants";

// This API is exposed to Brick Next itself, keep compatible.
export function emit(data: EmitData): void {
  try {
    const repo: any[] = [];
    const payload = dehydrate(data.payload, repo);
    window.postMessage(
      {
        source: MESSAGE_SOURCE_HOOK,
        payload: {
          type: data.type,
          payload,
          repo,
        },
      },
      "*"
    );
  } catch (error) {
    console.warn("brick-next-devtools emit failed:", error);
  }
}
