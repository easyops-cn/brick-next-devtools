import React from "react";
import { mount } from "enzyme";
import { PropView } from "./PropView";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { PropList } from "./PropList";
import { Button } from "@blueprintjs/core";
import { DehydratedBrickInfo } from "../../shared/interfaces";

jest.mock("../libs/SelectedBrickContext");

(useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick: null });

const mockEval = jest.fn(
  (
    string: string,
    options: any,
    fn: (brickInfo: DehydratedBrickInfo) => void
  ): void => {
    (typeof options === "function" ? options : fn)({
      info: {
        properties: {
          quality: "good",
        },
        events: [["click", { action: "console.log" }]],
      },
      repo: [],
    });
  }
);

(window as any).chrome = {
  devtools: {
    inspectedWindow: {
      eval: mockEval,
    },
  },
};

describe("PropView", () => {
  afterEach(() => {
    mockEval.mockClear();
  });

  it("should work when no brick is selected", () => {
    const wrapper = mount(<PropView />);
    expect(wrapper.html()).toBe(null);
  });

  it("should work when a brick is selected", () => {
    const selectedBrick = {
      uid: 1,
    };
    (useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick });

    const wrapper = mount(<PropView />);

    expect(mockEval.mock.calls[0][0]).toBe(
      "window.__BRICK_NEXT_DEVTOOLS_HOOK__.getBrickInfo(1)"
    );
    expect(wrapper.find(PropList).at(0).prop("list")).toEqual({
      quality: "good",
    });
    expect(wrapper.find(PropList).at(0).prop("editable")).toBe(true);
    expect(wrapper.find(PropList).at(1).prop("list")).toEqual({
      click: { action: "console.log" },
    });
    expect(wrapper.find(PropList).at(1).prop("editable")).toBe(false);
    (useSelectedBrickContext as jest.Mock).mockReset();
  });

  it("should work when copy properties", () => {
    const selectedBrick = {
      uid: 1,
    };
    (useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick });
    const wrapper = mount(<PropView />);
    document.execCommand = jest.fn().mockReturnValue(true);
    document.removeEventListener = jest.fn();
    expect(wrapper.find(Button).length).toBe(2);
    wrapper.find(Button).at(0).simulate("click");
    expect(document.execCommand).toBeCalledWith("copy");
    expect(document.removeEventListener).toHaveBeenCalled();
  });

  it("should work when overrideProps", () => {
    const selectedBrick = {
      uid: 1,
    };
    (useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick });
    const wrapper = mount(<PropView />);
    expect(mockEval.mock.calls[0][0]).toBe(
      "window.__BRICK_NEXT_DEVTOOLS_HOOK__.getBrickInfo(1)"
    );
    const mockEvalOverrideProps = jest.fn();
    (window as any).chrome = {
      devtools: {
        inspectedWindow: {
          eval: mockEvalOverrideProps,
        },
      },
    };
    wrapper.find(PropList).at(0).invoke("overrideProps")("quality", "bad");
    expect(mockEvalOverrideProps).toHaveBeenCalled();
    (useSelectedBrickContext as jest.Mock).mockReset();
  });
});
