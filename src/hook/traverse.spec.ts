import { getBricks, getBrickByUid, getBrickInfo } from "./traverse";
import {
  MountPointElement,
  BrickElement,
  DehydratedBrickInfo,
} from "../shared/interfaces";

customElements.define("your.awesome-tpl", class Tmp1 extends HTMLElement {});
customElements.define("your.inner-brick", class Tmp1 extends HTMLElement {});
customElements.define(
  "your.awesome-provider",
  class Tmp1 extends HTMLElement {}
);
customElements.define(
  "your.another-provider",
  class Tmp1 extends HTMLElement {}
);

describe("traverse", () => {
  beforeEach(() => {
    const main = document.createElement("div");
    const portal = document.createElement("div");
    const bg = document.createElement("div");
    main.id = "main-mount-point";
    portal.id = "portal-mount-point";
    bg.id = "bg-mount-point";
    document.body.appendChild(main);
    document.body.appendChild(portal);
    document.body.appendChild(bg);

    const BrickProto = {
      constructor: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        _dev_only_definedProperties: ["propA", "propB"],
      },
    };

    const nativeElement = document.createElement("div") as BrickElement;
    const internalContainer = document.createElement("div");
    const internalNativeBrick = document.createElement("span") as BrickElement;
    internalNativeBrick.$$typeof = "native";
    nativeElement.$$typeof = "brick";
    nativeElement.id = "span-1";
    nativeElement.appendChild(internalContainer);
    internalContainer.appendChild(internalNativeBrick);

    (main as MountPointElement).$$rootBricks = [
      {
        $$brick: {
          element: Object.assign(Object.create(BrickProto), {
            tagName: "YOUR.AWESOME-TPL",
            $$typeof: "custom-template",
            propB: "b in tpl",
            propA: "a in tpl",
            id: "tpl-1",
            $$eventListeners: [],
          }),
        },
        children: [
          {
            $$brick: {
              element: Object.assign(Object.create(BrickProto), {
                tagName: "YOUR.INNER-BRICK",
                $$typeof: "brick",
                propA: "a in brick",
                propB: "b in brick",
                slot: "slot-a",
                $$eventListeners: [
                  [
                    "click",
                    function () {
                      /* noop */
                    },
                    { action: "console.log" },
                  ],
                ],
                children: [],
              }),
            },
            children: [],
          },
          {
            $$brick: {
              element: {
                tagName: "DIV",
                propA: "a in brick",
                propB: "b in brick",
                children: [],
              },
            },
            children: null,
          },
          // Mocking no brick element.
          {} as any,
        ],
      },
      {
        $$brick: {
          element: nativeElement,
        },
        children: [],
      },
    ];

    (bg as MountPointElement).$$rootBricks = [
      {
        $$brick: {
          element: Object.assign(Object.create(BrickProto), {
            tagName: "YOUR.AWESOME-PROVIDER",
            $$typeof: "provider",
            propA: "a in provider",
            propB: "b in provider",
            hidden: false,
            children: [],
          }),
        },
        children: null,
      },
      {
        $$brick: {
          // Mocking no defined properties.
          element: Object.assign(Object.create(null), {
            tagName: "YOUR.ANOTHER-PROVIDER",
            $$typeof: "provider",
            propA: "a in provider",
            propB: "b in provider",
            hidden: true,
            children: [],
          }),
        },
        children: [],
      },
    ];
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should work", () => {
    expect(getBricks()).toEqual({
      main: [
        {
          uid: 1,
          tagName: "your.awesome-tpl",
          invalid: false,
          children: [
            {
              uid: 2,
              tagName: "your.inner-brick",
              invalid: false,
              children: [],
            },
            {
              uid: 3,
              tagName: "div",
              invalid: false,
              children: [],
            },
          ],
        },
        {
          uid: 4,
          tagName: "div",
          invalid: false,
          children: [
            {
              uid: 7,
              includesInternalBricks: true,
              children: [
                {
                  uid: 5,
                  tagName: "span",
                  invalid: false,
                  children: [],
                },
              ],
            },
          ],
        },
      ],
      portal: [],
      bg: [
        {
          uid: 8,
          tagName: "your.awesome-provider",
          invalid: false,
          children: [],
        },
        {
          uid: 9,
          tagName: "your.another-provider",
          invalid: false,
          children: [],
        },
      ],
    });

    const emptyBrickInfo: DehydratedBrickInfo = {
      info: {
        nativeProperties: {},
        properties: {},
        events: [],
      },
      repo: [],
    };

    expect(getBrickByUid(1).tagName).toBe("YOUR.AWESOME-TPL");

    expect(getBrickInfo(1)).toEqual({
      info: {
        nativeProperties: {
          id: "tpl-1",
        },
        properties: {
          propA: "a in tpl",
          propB: "b in tpl",
        },
        events: [],
      },
      repo: [],
    });

    expect(getBrickInfo(2)).toEqual({
      info: {
        nativeProperties: {
          slot: "slot-a",
        },
        properties: {
          propA: "a in brick",
          propB: "b in brick",
        },
        events: [["click", { action: "console.log" }]],
      },
      repo: [],
    });

    expect(getBrickInfo(3)).toEqual(emptyBrickInfo);
    expect(getBrickInfo(4)).toEqual({
      info: {
        nativeProperties: {
          id: "span-1",
        },
        properties: {},
        events: [],
      },
      repo: [],
    });
    expect(getBrickInfo(5)).toEqual(emptyBrickInfo);
    expect(getBrickInfo(6)).toEqual(emptyBrickInfo);
    expect(getBrickInfo(7)).toEqual(emptyBrickInfo);

    expect(getBrickInfo(8)).toEqual({
      info: {
        nativeProperties: {},
        properties: {
          propA: "a in provider",
          propB: "b in provider",
        },
        events: [],
      },
      repo: [],
    });

    expect(getBrickInfo(9)).toEqual({
      info: {
        nativeProperties: {
          hidden: true,
        },
        properties: {},
        events: [],
      },
      repo: [],
    });
  });
});
