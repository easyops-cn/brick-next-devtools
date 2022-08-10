import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import { Button, Switch } from "@blueprintjs/core";
import { TreeToolbar } from "./TreeToolbar";
import { useBrickTreeContext } from "../libs/BrickTreeContext";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { useCollapsedBrickIdsContext } from "../libs/CollapsedBrickIdsContext";
import { useShowFullNameContext } from "../libs/ShowFullNameContext";
import { MESSAGE_SOURCE_HOOK } from "../../shared/constants";

jest.mock("../libs/BrickTreeContext");
jest.mock("../libs/SelectedBrickContext");
jest.mock("../libs/CollapsedBrickIdsContext");
jest.mock("../libs/ShowFullNameContext");

const setTree = jest.fn();
const setSelectedBrick = jest.fn();
const setShowFullName = jest.fn();
const setCollapsedBrickIds = jest.fn();
const setExpandedInternalIds = jest.fn();

(useBrickTreeContext as jest.Mock).mockReturnValue({ setTree });
(useSelectedBrickContext as jest.Mock).mockReturnValue({ setSelectedBrick });
(useCollapsedBrickIdsContext as jest.Mock).mockReturnValue({
  setCollapsedBrickIds,
  setExpandedInternalIds,
});
(useShowFullNameContext as jest.Mock).mockReturnValue({
  showFullName: false,
  setShowFullName,
});

const mockEval = jest.fn((string: string, options: any, fn: any): void => {
  (typeof options === "function" ? options : fn)({
    main: [],
    bg: [],
  });
});

(window as any).chrome = {
  devtools: {
    inspectedWindow: {
      eval: mockEval,
    },
  },
};

/* const listeners: Record<string, Function> = {};
window.addEventListener = jest.fn((event, cb) => {
  listeners[event] = cb as Function;
});
window.removeEventListener = jest.fn((event) => {
  delete listeners[event];
}); */

describe("TreeToolbar", () => {
  it("should work", async () => {
    const wrapper = mount(<TreeToolbar />);

    expect(mockEval).toBeCalledTimes(1);
    expect(setTree).toBeCalledWith({ main: [], bg: [] });
    expect(setCollapsedBrickIds).toBeCalledWith([]);
    expect(setExpandedInternalIds).toBeCalledWith([]);
    expect(setSelectedBrick).toBeCalledWith(null);

    wrapper.find(Button).invoke("onClick")(null);
    expect(mockEval).toBeCalledTimes(2);

    wrapper.find(Switch).invoke("onChange")({
      target: {
        checked: true,
      },
    } as any);
    expect(setShowFullName).toBeCalledWith(true);

    // Would ignore this message.
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "rendering",
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    expect(mockEval).toBeCalledTimes(2);

    // Would handle this message.
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "rendered",
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    expect(mockEval).toBeCalledTimes(3);

    wrapper.unmount();
  });
});
