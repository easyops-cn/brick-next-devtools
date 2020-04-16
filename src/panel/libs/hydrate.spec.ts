import { hydrate } from "./hydrate";
import { PROP_DEHYDRATED } from "../../shared/constants";

describe("hydrate", () => {
  const circularObject: Record<string, any> = {};
  circularObject.refOthers = {
    refSelf: circularObject,
    refSelfAgain: [circularObject],
  };

  it.each<[any, any[], any]>([
    // Returns original value if it's serializable.
    ["hello", [], "hello"],
    [1, [], 1],
    [true, [], true],
    [null, [], null],
    [
      {
        quality: "good",
      },
      [],
      {
        quality: "good",
      },
    ],
    [["quality", "good"], [], ["quality", "good"]],

    // Returns a dehydrated wrapper if it's not serializable.
    [
      {
        [PROP_DEHYDRATED]: {
          type: "undefined",
        },
      },
      [],
      undefined,
    ],
    [
      {
        [PROP_DEHYDRATED]: {
          type: "NaN",
        },
      },
      [],
      NaN,
    ],
    [
      {
        [PROP_DEHYDRATED]: {
          type: "Infinity",
        },
      },
      [],
      Infinity,
    ],
    [
      {
        [PROP_DEHYDRATED]: {
          type: "-Infinity",
        },
      },
      [],
      -Infinity,
    ],
    [
      {
        [PROP_DEHYDRATED]: {
          type: "object",
          constructorName: "Event",
          children: {
            type: "click",
          },
        },
      },
      [],
      {
        [PROP_DEHYDRATED]: {
          type: "object",
          constructorName: "Event",
          children: {
            type: "click",
          },
        },
      },
    ],
  ])("hydrate(%j, %j) should return %j", (dehydrated, repo, hydrated) => {
    expect(hydrate(dehydrated, repo)).toEqual(hydrated);
  });

  it("should work for symbol", () => {
    const dehydrated = {
      [PROP_DEHYDRATED]: {
        type: "symbol",
      },
    };
    expect(typeof hydrate(dehydrated, [])).toBe("symbol");
  });

  it("should work for symbol", () => {
    const dehydrated = {
      [PROP_DEHYDRATED]: {
        type: "function",
      },
    };
    expect(typeof hydrate(dehydrated, [])).toBe("function");
  });

  it("should work for circular referenced object", () => {
    const dehydrated = {
      refOthers: {
        refSelf: {
          [PROP_DEHYDRATED]: {
            type: "ref",
            ref: 0,
          },
        },
        refSelfAgain: [
          {
            [PROP_DEHYDRATED]: {
              type: "ref",
              ref: 0,
            },
          },
        ],
      },
    };
    const repo = [
      {
        refOthers: {
          refSelf: {
            [PROP_DEHYDRATED]: {
              type: "ref",
              ref: 0,
            },
          },
          refSelfAgain: [
            {
              [PROP_DEHYDRATED]: {
                type: "ref",
                ref: 0,
              },
            },
          ],
        },
      },
    ];
    const hydrated = hydrate(dehydrated, repo);
    expect(hydrated.refOthers.refSelf).toStrictEqual(hydrated);
    expect(hydrated.refOthers.refSelfAgain[0]).toStrictEqual(hydrated);
  });

  it("should work for circular referenced array", () => {
    const dehydrated = [
      {
        [PROP_DEHYDRATED]: {
          type: "ref",
          ref: 0,
        },
      },
    ];
    const repo = [
      [
        {
          [PROP_DEHYDRATED]: {
            type: "ref",
            ref: 0,
          },
        },
      ],
    ];
    const hydrated = hydrate(dehydrated, repo);
    expect(hydrated[0]).toStrictEqual(hydrated);
  });
});
