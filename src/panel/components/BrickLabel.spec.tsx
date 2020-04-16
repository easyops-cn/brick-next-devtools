import React from "react";
import { shallow } from "enzyme";
import { Tag } from "@blueprintjs/core";
import { BrickLabel } from "./BrickLabel";
import { useShowFullNameContext } from "../libs/ShowFullNameContext";

jest.mock("../libs/ShowFullNameContext");

(useShowFullNameContext as jest.Mock).mockReturnValue({ showFullName: false });

describe("BrickLabel", () => {
  it("should brick tag name", () => {
    const wrapper = shallow(<BrickLabel tagName="div" />);
    expect(wrapper.find(".brick-title").text()).toBe("div");
    expect(wrapper.find(Tag).length).toBe(0);

    wrapper.setProps({
      tagName: "basic-bricks.micro-app",
    });

    expect(wrapper.find(".brick-title").text()).toBe("micro-app");
    expect(wrapper.find(Tag).prop("intent")).toBe("warning");

    wrapper.setProps({
      tagName: "basic-bricks.script-brick",
    });

    expect(wrapper.find(".brick-title").text()).toBe("script-brick");
    expect(wrapper.find(Tag).prop("intent")).toBe("danger");
  });

  it("should full brick tag name", () => {
    (useShowFullNameContext as jest.Mock).mockReturnValueOnce({
      showFullName: true,
    });

    const wrapper = shallow(<BrickLabel tagName="your.awesome-brick" />);
    expect(wrapper.find(".brick-title").text()).toBe("your.awesome-brick");
  });
});
