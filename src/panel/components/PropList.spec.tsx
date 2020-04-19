import React from "react";
import { shallow } from "enzyme";
import { Icon } from "@blueprintjs/core";
import { PropList, PropItem } from "./PropList";
import { PROP_DEHYDRATED } from "../../shared/constants";

describe("PropList", () => {
  it("should work for array", () => {
    const wrapper = shallow(<PropList list={["quality", "good"]} />);
    expect(wrapper.find(PropItem).length).toBe(2);
    expect(wrapper.find(PropItem).at(0).props()).toMatchObject({
      propName: "0",
      propValue: "quality",
    });
    expect(wrapper.find(PropItem).at(1).props()).toMatchObject({
      propName: "1",
      propValue: "good",
    });
  });

  it("should work for object", () => {
    const wrapper = shallow(
      <PropList list={{ quality: "good", hello: "world" }} />
    );
    expect(wrapper.find(PropItem).length).toBe(2);
    expect(wrapper.find(PropItem).at(0).props()).toMatchObject({
      propName: "quality",
      propValue: "good",
    });
    expect(wrapper.find(PropItem).at(1).props()).toMatchObject({
      propName: "hello",
      propValue: "world",
    });
  });

  it("should work for dehydrated with no children", () => {
    const wrapper = shallow(
      <PropList
        list={{
          [PROP_DEHYDRATED]: {
            type: "object",
          },
        }}
      />
    );
    expect(wrapper.find("ul").text()).toBe("");
  });

  it("should work for dehydrated with children", () => {
    const wrapper = shallow(
      <PropList
        list={{
          [PROP_DEHYDRATED]: {
            type: "object",
            children: {
              type: "click",
            },
          },
        }}
      />
    );
    expect(wrapper.find(PropItem).props()).toEqual({
      propName: "type",
      propValue: "click",
    });
  });
});

describe("PropItem", () => {
  it("should work for primitive property value", () => {
    const wrapper = shallow(<PropItem propName="quality" propValue="good" />);
    expect(wrapper.find(PropList).length).toBe(0);
  });

  it("should handle toggle", () => {
    const wrapper = shallow(<PropItem propName="quality" propValue="good" />);
    expect(wrapper.hasClass("expanded")).toBe(false);
    expect(wrapper.find(Icon).prop("icon")).toBe("blank");
    wrapper.find(".prop-item-label").invoke("onClick")(null);
    expect(wrapper.hasClass("expanded")).toBe(true);
    expect(wrapper.find(Icon).prop("icon")).toBe("blank");
    wrapper.find(".prop-item-label").invoke("onClick")(null);
    expect(wrapper.hasClass("expanded")).toBe(false);
    expect(wrapper.find(Icon).prop("icon")).toBe("blank");
  });

  it("should work for complex property value", () => {
    const wrapper = shallow(<PropItem propName="quality" propValue={[1]} />);
    expect(wrapper.find(PropList).length).toBe(0);
    expect(wrapper.find(Icon).prop("icon")).toBe("caret-right");
    wrapper.find(".prop-item-label").invoke("onClick")(null);
    expect(wrapper.find(PropList).prop("list")).toEqual([1]);
    expect(wrapper.find(Icon).prop("icon")).toBe("caret-down");
  });

  it("should work for standalone with primitive property value", () => {
    const wrapper = shallow(<PropItem propValue="good" standalone />);
    expect(wrapper.find(Icon).length).toBe(0);
    expect(wrapper.find(PropList).length).toBe(0);
  });

  it("should work for standalone with complex property value", () => {
    const wrapper = shallow(<PropItem propValue={[1]} standalone />);
    expect(wrapper.find(Icon).prop("icon")).toBe("caret-right");
    wrapper.find(".prop-item-label").invoke("onClick")(null);
    expect(wrapper.find(PropList).prop("list")).toEqual([1]);
    expect(wrapper.find(Icon).prop("icon")).toBe("caret-down");
  });
});
