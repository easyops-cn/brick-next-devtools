import { getBricks, getBrickByUid, getBrickInfo } from "./traverse";
import { MountPointElement } from "../shared/interfaces";

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

    (main as MountPointElement).$$rootBricks = [
      {
        $$brick: {
          element: Object.assign(Object.create(BrickProto), {
            tagName: "YOUR.AWESOME-TPL",
            $$typeof: "custom-template",
            propB: "b in tpl",
            propA: "a in tpl",
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
                $$eventListeners: [
                  [
                    "click",
                    function () {
                      /* noop */
                    },
                    { action: "console.log" },
                  ],
                ],
              }),
            },
            children: [],
          },
          {
            $$brick: {
              element: Object.assign(
                {},
                {
                  tagName: "DIV",
                  propA: "a in brick",
                  propB: "b in brick",
                }
              ),
            },
            children: [],
          },
          // Mocking no brick element.
          {} as any,
        ],
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
          children: [
            {
              uid: 2,
              tagName: "your.inner-brick",
              children: [],
            },
            {
              uid: 3,
              tagName: "div",
              children: [],
            },
          ],
        },
      ],
      portal: [],
      bg: [
        {
          uid: 4,
          tagName: "your.awesome-provider",
          children: [],
        },
        {
          uid: 5,
          tagName: "your.another-provider",
          children: [],
        },
      ],
    });

    expect(getBrickByUid(1).tagName).toBe("YOUR.AWESOME-TPL");

    expect(getBrickInfo(1)).toEqual({
      info: {
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
        properties: {
          propA: "a in brick",
          propB: "b in brick",
        },
        events: [["click", { action: "console.log" }]],
      },
      repo: [],
    });

    expect(getBrickInfo(3)).toEqual({
      info: {
        properties: {},
        events: [],
      },
      repo: [],
    });

    expect(getBrickInfo(4)).toEqual({
      info: {
        properties: {
          propA: "a in provider",
          propB: "b in provider",
        },
        events: [],
      },
      repo: [],
    });

    expect(getBrickInfo(5)).toEqual({
      info: {
        properties: {},
        events: [],
      },
      repo: [],
    });
  });
});
