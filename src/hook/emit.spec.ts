import { emit } from "./emit";
import { MESSAGE_SOURCE_HOOK } from "../shared/constants";

const postMessage = jest.fn();
window.postMessage = postMessage;
const warn = jest.spyOn(console, "warn").mockImplementation(() => void 0);

describe("emit", () => {
  it("should work", () => {
    emit({
      type: "evaluation",
      payload: {
        quality: "good",
      },
    });
    expect(postMessage).toBeCalledWith(
      {
        source: MESSAGE_SOURCE_HOOK,
        payload: {
          type: "evaluation",
          payload: {
            quality: "good",
          },
          repo: [],
        },
      },
      "*"
    );
  });

  it("should warn if data is nil", () => {
    emit(null);
    expect(warn).toBeCalled();
  });
});
