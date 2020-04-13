import React from "react";
import { shallow, mount } from "enzyme";
import { Icon } from "@blueprintjs/core";
import {
  PropTree,
  PropItem,
  ValueStringify,
  ValueItemStringify,
} from "./PropTree";

describe("PropTree", () => {
  it("should work for array", () => {
    const wrapper = shallow(<PropTree properties={["quality", "good"]} />);
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
      <PropTree properties={{ quality: "good", hello: "world" }} />
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
});

describe("PropItem", () => {
  it("should work for primitive property value", () => {
    const wrapper = shallow(<PropItem propName="quality" propValue="good" />);
    expect(wrapper.find(PropTree).length).toBe(0);
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
    expect(wrapper.find(PropTree).length).toBe(0);
    expect(wrapper.find(Icon).prop("icon")).toBe("caret-right");
    wrapper.find(".prop-item-label").invoke("onClick")(null);
    expect(wrapper.find(PropTree).prop("properties")).toEqual([1]);
    expect(wrapper.find(Icon).prop("icon")).toBe("caret-down");
  });
});

describe("ValueStringify", () => {
  it("should work for array value when not expanded", () => {
    const wrapper = mount(<ValueStringify value={[1, 2]} />);
    expect(wrapper.text()).toBe(" (2) [1, 2]");
  });

  it("should work for object value when not expanded", () => {
    const wrapper = mount(
      <ValueStringify value={{ quality: "good", hello: "world" }} />
    );
    expect(wrapper.text()).toBe('{quality: "good", hello: "world"}');
  });

  it("should work for array value when expanded", () => {
    const wrapper = mount(<ValueStringify value={[1, 2]} expanded />);
    expect(wrapper.text()).toBe("Array(2)");
  });

  it("should work for object value when expanded", () => {
    const wrapper = mount(
      <ValueStringify value={{ quality: "good", hello: "world" }} expanded />
    );
    expect(wrapper.text()).toBe("");
  });

  it("should work for string value", () => {
    const wrapper = mount(<ValueStringify value="good" />);
    expect(wrapper.childAt(1).hasClass("prop-value-string")).toBe(true);
    expect(wrapper.text()).toBe('"good"');
  });

  it("should work for function value", () => {
    const wrapper = mount(<ValueStringify value={() => 0} />);
    expect(wrapper.childAt(0).hasClass("prop-value-function")).toBe(true);
    expect(wrapper.text()).toBe("ƒ");
  });

  it("should work for null value", () => {
    const wrapper = mount(<ValueStringify value={null} />);
    expect(wrapper.childAt(0).hasClass("prop-value-nil")).toBe(true);
    expect(wrapper.text()).toBe("null");
  });

  it("should work for undefined value", () => {
    const wrapper = mount(<ValueStringify value={undefined} />);
    expect(wrapper.childAt(0).hasClass("prop-value-nil")).toBe(true);
    expect(wrapper.text()).toBe("undefined");
  });

  it("should work for other primitive value", () => {
    const wrapper = mount(<ValueStringify value={0} />);
    expect(wrapper.childAt(0).hasClass("prop-value-nil")).toBe(false);
    expect(wrapper.text()).toBe("0");
  });
});

describe("ValueItemStringify", () => {
  it("should work for array value item", () => {
    const wrapper = shallow(<ValueItemStringify item={[1, 2]} />);
    expect(wrapper.text()).toBe("Array(2)");
  });

  it("should work for object value item", () => {
    const wrapper = shallow(<ValueItemStringify item={{}} />);
    expect(wrapper.text()).toBe("{…}");
  });

  it("should work for string value item", () => {
    const wrapper = shallow(<ValueItemStringify item="good" />);
    expect(wrapper.text()).toBe('"good"');
  });

  it("should work for function value item", () => {
    const wrapper = shallow(<ValueItemStringify item={() => 0} />);
    expect(wrapper.text()).toBe("ƒ");
  });

  it("should work for null value item", () => {
    const wrapper = shallow(<ValueItemStringify item={null} />);
    expect(wrapper.hasClass("prop-value-item-nil")).toBe(true);
    expect(wrapper.text()).toBe("null");
  });

  it("should work for undefined value item", () => {
    const wrapper = shallow(<ValueItemStringify item={undefined} />);
    expect(wrapper.hasClass("prop-value-item-nil")).toBe(true);
    expect(wrapper.text()).toBe("undefined");
  });

  it("should work for other primitive value item", () => {
    const wrapper = shallow(<ValueItemStringify item={0} />);
    expect(wrapper.hasClass("prop-value-item-nil")).toBe(false);
    expect(wrapper.text()).toBe("0");
  });
});
