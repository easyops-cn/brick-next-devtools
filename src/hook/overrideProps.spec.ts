import { overrideProps } from "./overrideProps";
import { BrickElement } from "../shared/interfaces";

describe("overrideProps", () => {
  it("should work", () => {
    overrideProps(undefined, "showCard", false);
    const element =
      {
        tagName: "YOUR.awesome-brick",
      } as BrickElement;
    overrideProps(element, "showCard", false);
    expect(element).toEqual({
      tagName: "YOUR.awesome-brick",
      showCard: false,
    });
  });
});
