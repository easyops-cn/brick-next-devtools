import React from "react";
import { shallow } from "enzyme";
import { Tag, Tooltip } from "@blueprintjs/core";
import { BrickLabel } from "./BrickLabel";
import { useShowFullNameContext } from "../libs/ShowFullNameContext";

jest.mock("../libs/ShowFullNameContext");

(useShowFullNameContext as jest.Mock).mockReturnValue({ showFullName: false });

describe("BrickLabel", () => {
  it("should brick tag name", () => {
    const wrapper = shallow(<BrickLabel tagName="div" />);
    expect(wrapper.find(".brick-title").text()).toBe("div");
    expect(wrapper.find(Tag).length).toBe(0);
    expect(
      wrapper.find(".brick-title").hasClass("includes-internal-bricks")
    ).toBe(false);
    expect(wrapper.find(".brick-title").hasClass("native")).toBe(true);

    wrapper.setProps({
      tagName: "basic-bricks.micro-app",
    });

    expect(wrapper.find(".brick-title").text()).toBe("micro-app");
    expect(wrapper.find(Tag).prop("intent")).toBe("warning");
    expect(wrapper.find(".brick-title").hasClass("native")).toBe(false);

    wrapper.setProps({
      tagName: "basic-bricks.script-brick",
    });

    expect(wrapper.find(".brick-title").text()).toBe("script-brick");
    expect(wrapper.find(Tag).prop("intent")).toBe("danger");

    wrapper.setProps({
      tagName: "oops-unknown",
      invalid: true,
    });

    expect(wrapper.find(".brick-title").text()).toBe("oops-unknown");
    expect(wrapper.find(Tag).prop("intent")).toBe("danger");
    expect(
      (wrapper.find(Tooltip).prop("content") as string).includes("not defined")
    ).toBe(true);
  });

  it("should show internal node", () => {
    const wrapper = shallow(<BrickLabel includesInternalBricks />);
    expect(wrapper.find(".brick-title").text()).toBe("#internal");
    expect(
      wrapper.find(".brick-title").hasClass("includes-internal-bricks")
    ).toBe(true);
    expect(wrapper.find(".brick-title").hasClass("native")).toBe(false);
  });

  it("should full brick tag name", () => {
    (useShowFullNameContext as jest.Mock).mockReturnValueOnce({
      showFullName: true,
    });

    const wrapper = shallow(<BrickLabel tagName="your.awesome-brick" />);
    expect(wrapper.find(".brick-title").text()).toBe("your.awesome-brick");
  });
});
