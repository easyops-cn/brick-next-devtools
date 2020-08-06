import React from "react";
import { mount } from "enzyme";
import { useSupports } from "./useSupports";

const mockEval = jest
  .fn()
  .mockImplementation((str: string, callback: (result: boolean) => void) => {
    callback(str.includes('"good"'));
  });

(window as any).chrome = {
  devtools: {
    inspectedWindow: {
      eval: mockEval,
    },
  },
};

function TestComponent(props: { feat: string }): React.ReactElement {
  const supported = useSupports(props.feat);
  return <div>{supported ? "yes" : "no"}</div>;
}

describe("useSupports", () => {
  it("should work", () => {
    const wrapper = mount(<TestComponent feat="bad" />);
    expect(wrapper.text()).toBe("no");
    wrapper.setProps({
      feat: "good",
    });
    expect(wrapper.text()).toBe("yes");
  });
});
