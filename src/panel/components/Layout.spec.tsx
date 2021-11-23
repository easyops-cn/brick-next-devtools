import React from "react";
import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import { Layout } from "./Layout";
import { Storage } from "../libs/Storage";
import { BricksPanel } from "./BricksPanel";
import { EvaluationsPanel } from "./EvaluationsPanel";
import { TransformationsPanel } from "./TransformationsPanel";
import { MESSAGE_SOURCE_HOOK } from "../../shared/constants";
import { useEvaluationsContext } from "../libs/EvaluationsContext";
import { useTransformationsContext } from "../libs/TransformationsContext";

function MockEvaluationsPanel(): React.ReactElement {
  const { evaluations, savePreserveLogs } = useEvaluationsContext();
  return (
    <div
      onChange={(e) => {
        savePreserveLogs((e.target as any).value);
      }}
      id="EvaluationsPanel"
    >
      EvaluationsPanel ({evaluations.length})
    </div>
  );
}

function MockTransformationsPanel(): React.ReactElement {
  const { transformations } = useTransformationsContext();
  return <div>TransformationsPanel ({transformations.length})</div>;
}

jest.mock("./BricksPanel", () => ({
  BricksPanel: function BricksPanel(): React.ReactElement {
    return <div>BricksPanel</div>;
  },
}));

jest.mock("./EvaluationsPanel", () => ({
  EvaluationsPanel: MockEvaluationsPanel,
}));

jest.mock("./TransformationsPanel", () => ({
  TransformationsPanel: MockTransformationsPanel,
}));

const storageGetItem = jest.spyOn(Storage, "getItem");
const storageSetItem = jest
  .spyOn(Storage, "setItem")
  .mockImplementation(() => void 0);

const mockPanels: Record<string, any> = {};
(window as any).chrome = {
  devtools: {
    panels: mockPanels,
  },
};

describe("Layout", () => {
  afterEach(() => {
    mockPanels.themeName = undefined;
    storageGetItem.mockReturnValue(null);
    storageSetItem.mockClear();
  });

  it("should work as default theme", () => {
    const wrapper = mount(<Layout />);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(wrapper.childAt(0).hasClass("bp3-dark")).toBe(false);
    expect(wrapper.find(BricksPanel).length).toBe(1);
    expect(wrapper.find(EvaluationsPanel).length).toBe(0);
    expect(wrapper.find(TransformationsPanel).length).toBe(0);
    wrapper.unmount();
  });

  it("should work as dark theme", () => {
    mockPanels.themeName = "dark";
    const wrapper = mount(<Layout />);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(wrapper.childAt(0).hasClass("bp3-dark")).toBe(true);
    wrapper.unmount();
  });

  it("should work for bricks panel", () => {
    const wrapper = mount(<Layout />);
    expect(wrapper.text()).toBe("BricksPanel");
    expect(storageSetItem).toBeCalledWith("selectedPanel", "Bricks");
    wrapper.unmount();
  });

  it("should work for evaluations panel", () => {
    storageGetItem.mockReturnValue("Evaluations");
    const wrapper = mount(<Layout />);
    expect(wrapper.text()).toBe("EvaluationsPanel (0)");
    expect(storageSetItem).toBeCalledWith("selectedPanel", "Evaluations");
    wrapper.unmount();
  });

  it("should work for transformations panel", () => {
    storageGetItem.mockReturnValue("Transformations");
    const wrapper = mount(<Layout />);
    expect(wrapper.text()).toBe("TransformationsPanel (0)");
    expect(storageSetItem).toBeCalledWith("selectedPanel", "Transformations");
    wrapper.unmount();
  });

  it("should work for new evaluations", async () => {
    storageGetItem.mockReturnValue("Evaluations");
    const wrapper = mount(<Layout />);
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "evaluation",
            payload: "good",
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    expect(wrapper.text()).toBe("EvaluationsPanel (1)");
    wrapper.unmount();
  });

  it("should work for edit evaluations", async () => {
    storageGetItem.mockReturnValue("Evaluations");
    const wrapper = mount(<Layout />);
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "evaluation",
            payload: {
              id: 0,
              result: "good",
            },
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "re-evaluation",
            payload: {
              id: 0,
              result: "new",
            },
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    expect(wrapper.text()).toBe("EvaluationsPanel (1)");
    wrapper.unmount();
  });

  it("should work for new transformations", async () => {
    storageGetItem.mockReturnValue("Transformations");
    const wrapper = mount(<Layout />);
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "transformation",
            payload: "good",
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    expect(wrapper.text()).toBe("TransformationsPanel (1)");
    wrapper.unmount();
  });

  it("should work for edit transformations", async () => {
    storageGetItem.mockReturnValue("Transformations");
    const wrapper = mount(<Layout />);
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "transformation",
            payload: {
              result: "good",
              id: 0,
            },
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "re-transformation",
            payload: {
              id: 0,
              result: "new",
            },
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    expect(wrapper.text()).toBe("TransformationsPanel (1)");
    wrapper.unmount();
  });

  it.each([
    [true, 1],
    [false, 0],
  ])("locationChange should work", async (value, length) => {
    storageGetItem.mockReturnValue("Evaluations");
    const wrapper = mount(<Layout />);
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "evaluation",
            payload: "good",
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    wrapper.find("#EvaluationsPanel").first().invoke("onChange")({
      target: { value },
    } as any);
    await act(async () => {
      window.postMessage(
        {
          source: MESSAGE_SOURCE_HOOK,
          payload: {
            type: "locationChange",
          },
        },
        location.origin
      );
      await new Promise((resolve) => setTimeout(resolve));
    });
    expect(wrapper.text()).toBe(`EvaluationsPanel (${length})`);
    wrapper.unmount();
  });
});
