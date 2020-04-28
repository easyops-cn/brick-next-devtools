import React from "react";
import { shallow } from "enzyme";
import { Tree, Tag } from "@blueprintjs/core";
import { BrickTree } from "./BrickTree";
import { useBrickTreeContext } from "../libs/BrickTreeContext";
import { useSelectedBrickContext } from "../libs/SelectedBrickContext";
import {
  useCollapsedBrickIdsContext,
  ContextOfCollapsedBrickIds,
} from "../libs/CollapsedBrickIdsContext";
import { BricksByMountPoint, RichBrickData } from "../../shared/interfaces";

jest.mock("../libs/BrickTreeContext");
jest.mock("../libs/SelectedBrickContext");
jest.mock("../libs/CollapsedBrickIdsContext");

const setSelectedBrick = jest.fn();
const collapsedBrickIdsContext: ContextOfCollapsedBrickIds = {
  collapsedBrickIds: [100],
  setCollapsedBrickIds: jest.fn((setter) => {
    if (typeof setter === "function") {
      setter([100]);
    }
  }),
  expandedInternalIds: [200],
  setExpandedInternalIds: jest.fn((setter) => {
    if (typeof setter === "function") {
      setter([200]);
    }
  }),
};

(useBrickTreeContext as jest.Mock).mockReturnValue({});
(useSelectedBrickContext as jest.Mock).mockReturnValue({
  selectedBrick: null,
  setSelectedBrick,
});
(useCollapsedBrickIdsContext as jest.Mock).mockReturnValue(
  collapsedBrickIdsContext
);

const mockEval = jest.fn();

(window as any).chrome = {
  devtools: {
    inspectedWindow: {
      eval: mockEval,
    },
  },
};

describe("BrickTree", () => {
  afterEach(() => {
    mockEval.mockClear();
    setSelectedBrick.mockClear();
    // collapsedBrickIdsContext.collapsedBrickIds = [];
    (collapsedBrickIdsContext.setCollapsedBrickIds as jest.Mock).mockClear();
    (collapsedBrickIdsContext.setExpandedInternalIds as jest.Mock).mockClear();
  });

  it("should work when no tree", () => {
    const wrapper = shallow(<BrickTree />);
    expect(wrapper.find(".scroll-container").children.length).toBe(1);
  });

  it("should display brick tree", () => {
    const tree: BricksByMountPoint = {
      main: [
        {
          uid: 1,
          tagName: "a",
          children: [
            {
              uid: 2,
              tagName: "b",
              children: [],
            },
          ],
        },
        {
          uid: 3,
          tagName: "c",
          children: [],
        },
      ],
      bg: [
        {
          uid: 10,
          tagName: "z",
          children: [],
        },
      ],
    };
    (useBrickTreeContext as jest.Mock).mockReturnValue({ tree });

    const wrapper = shallow(<BrickTree />);

    expect(wrapper.find(Tag).length).toBe(2);
    expect(wrapper.find(Tag).at(0).childAt(0).text()).toBe("main");
    expect(wrapper.find(Tag).at(1).childAt(0).text()).toBe("bg");

    expect(wrapper.find(Tree).length).toBe(2);
    expect(wrapper.find(Tree).at(0).prop("contents").length).toBe(2);
    expect(wrapper.find(Tree).at(1).prop("contents").length).toBe(1);

    (useBrickTreeContext as jest.Mock).mockReset();
  });

  it("should work", () => {
    const brickA: RichBrickData = {
      uid: 1,
      tagName: "a",
      children: [
        {
          uid: 2,
          tagName: "b",
          children: [],
        },
      ],
    };
    const brickX: RichBrickData = {
      uid: 3,
      tagName: "x",
      children: [
        {
          uid: 4,
          includesInternalBricks: true,
          children: [
            {
              uid: 5,
              tagName: "y",
              children: [],
            },
          ],
        },
      ],
    };
    const tree: BricksByMountPoint = {
      main: [brickA, brickX],
    };
    (useBrickTreeContext as jest.Mock).mockReturnValue({ tree });

    const wrapper = shallow(<BrickTree />);

    expect(wrapper.find(Tree).prop("contents")[0].isExpanded).toBe(true);
    expect(wrapper.find(Tree).prop("contents")[1].isExpanded).toBe(true);
    expect(
      wrapper.find(Tree).prop("contents")[1].childNodes[0].isExpanded
    ).toBe(false);

    (wrapper.find(Tree).invoke("onNodeClick") as any)({
      nodeData: brickA,
    });

    expect(setSelectedBrick).toBeCalledWith(brickA);

    (wrapper.find(Tree).invoke("onNodeCollapse") as any)({
      id: 1,
      nodeData: {},
    });
    // Todo(steve): context not updated
    expect(collapsedBrickIdsContext.setCollapsedBrickIds).toBeCalledTimes(1);
    // expect(
    //   collapsedBrickIdsContext.setCollapsedBrickIds
    // ).toHaveBeenNthCalledWith(1, [100, 1]);
    // expect(wrapper.find(Tree).prop("contents")[0].isExpanded).toBe(false);

    (wrapper.find(Tree).invoke("onNodeExpand") as any)({
      id: 1,
      nodeData: {},
    });
    // Todo(steve): context not updated
    expect(collapsedBrickIdsContext.setCollapsedBrickIds).toBeCalledTimes(2);
    // expect(
    //   collapsedBrickIdsContext.setCollapsedBrickIds
    // ).toHaveBeenNthCalledWith(2, [100]);
    // expect(wrapper.find(Tree).prop("contents")[0].isExpanded).toBe(true);

    // Internal expand.
    (wrapper.find(Tree).invoke("onNodeExpand") as any)({
      id: 4,
      nodeData: {
        includesInternalBricks: true,
      },
    });
    expect(collapsedBrickIdsContext.setExpandedInternalIds).toBeCalledTimes(1);

    // Internal collapse.
    (wrapper.find(Tree).invoke("onNodeCollapse") as any)({
      id: 4,
      nodeData: {
        includesInternalBricks: true,
      },
    });
    expect(collapsedBrickIdsContext.setExpandedInternalIds).toBeCalledTimes(2);

    // Ignore internal.
    (wrapper.find(Tree).invoke("onNodeMouseEnter") as any)({
      id: 4,
      nodeData: {
        includesInternalBricks: true,
      },
    });
    expect(mockEval).not.toBeCalled();

    // Ignore internal.
    (wrapper.find(Tree).invoke("onNodeMouseLeave") as any)({
      id: 4,
      nodeData: {
        includesInternalBricks: true,
      },
    });
    expect(mockEval).not.toBeCalled();

    (wrapper.find(Tree).invoke("onNodeMouseEnter") as any)({
      id: 1,
      nodeData: {},
    });
    expect(mockEval).toHaveBeenNthCalledWith(
      1,
      "inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.inspectBrick(1));"
    );

    (wrapper.find(Tree).invoke("onNodeMouseLeave") as any)({
      id: 1,
      nodeData: {},
    });
    expect(mockEval).toHaveBeenNthCalledWith(
      2,
      "inspect(window.__BRICK_NEXT_DEVTOOLS_HOOK__.dismissInspections(1));"
    );

    (useBrickTreeContext as jest.Mock).mockReset();
  });
});
