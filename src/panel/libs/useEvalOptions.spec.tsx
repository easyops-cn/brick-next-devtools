import React from "react";
import { mount } from "enzyme";
import { useEvalOptions } from "./useEvalOptions";
import { SelectedInspectContext } from "./SelectedInspectContext";

function TestComponent(): React.ReactElement {
  const { frameURL } = useEvalOptions();
  return <div>{frameURL}</div>;
}

describe("useEvalOptions", () => {
  it("should work for top frame", () => {
    const wrapper = mount(
      <SelectedInspectContext.Provider
        value={{ frames: [], inspectContext: 0 }}
      >
        <TestComponent />
      </SelectedInspectContext.Provider>
    );
    expect(wrapper.text()).toBe("");
  });

  it("should work for inner frame", () => {
    const wrapper = mount(
      <SelectedInspectContext.Provider
        value={{
          frames: [
            {
              frameId: 1,
              frameURL: "/1",
            },
            {
              frameId: 2,
              frameURL: "/2",
            },
          ],
          inspectContext: 2,
        }}
      >
        <TestComponent />
      </SelectedInspectContext.Provider>
    );
    expect(wrapper.text()).toBe("/2");
  });
});
