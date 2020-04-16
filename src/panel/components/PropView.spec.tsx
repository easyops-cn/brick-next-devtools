import React from "react";
import { mount } from "enzyme";
import { PropView } from "./PropView";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import { PropList } from "./PropList";

jest.mock("../libs/SelectedBrickContext");

(useSelectedBrickContext as jest.Mock).mockReturnValue({ selectedBrick: null });

const mockEval = jest.fn((string: string, fn: Function): void => {
  fn({
    info: {
      properties: {
        quality: "good",
      },
      events: [["click", { action: "console.log" }]],
    },
    repo: [],
  });
});

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
    expect(wrapper.find(PropList).at(1).prop("list")).toEqual([
      ["click", { action: "console.log" }],
    ]);

    (useSelectedBrickContext as jest.Mock).mockReset();
  });
});
