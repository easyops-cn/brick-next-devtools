import { dehydrate } from "./dehydrate";
import { EmitData } from "../shared/interfaces";
import { MESSAGE_SOURCE_HOOK } from "../shared/constants";

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
