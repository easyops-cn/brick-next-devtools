import { dehydrate } from "./dehydrate";
import { PROP_DEHYDRATED } from "../shared/constants";

describe("dehydrate", () => {
  const circularObject: Record<string, any> = {};
  circularObject.refOthers = {
    refSelf: circularObject,
    refSelfAgain: [circularObject],
  };

  const circularArray: any[] = [];
  circularArray[0] = circularArray;

  it.each<[any, any, any[]]>([
    // Returns original value if it's serializable.
    ["hello", "hello", []],
    [1, 1, []],
    [true, true, []],
    [null, null, []],
    [
      {
        quality: "good",
      },
      {
        quality: "good",
      },
      [],
    ],
    [["quality", "good"], ["quality", "good"], []],

    // Returns a dehydrated wrapper if it's not serializable.
    [
      undefined,
      {
        [PROP_DEHYDRATED]: {
          type: "undefined",
        },
      },
      [],
    ],
    [
      NaN,
      {
        [PROP_DEHYDRATED]: {
          type: "NaN",
        },
      },
      [],
    ],
    [
      Infinity,
      {
        [PROP_DEHYDRATED]: {
          type: "Infinity",
        },
      },
      [],
    ],
    [
      -Infinity,
      {
        [PROP_DEHYDRATED]: {
          type: "-Infinity",
        },
      },
      [],
    ],
    [
      function noop() {
        /* noop */
      },
      {
        [PROP_DEHYDRATED]: {
          type: "function",
        },
      },
      [],
    ],
    [
      new Event("click"),
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
    ],
    [
      new CustomEvent("click", { detail: "good" }),
      {
        [PROP_DEHYDRATED]: {
          type: "object",
          constructorName: "CustomEvent",
          children: {
            type: "click",
            detail: "good",
          },
        },
      },
      [],
    ],
    [
      new RegExp("pattern"),
      {
        [PROP_DEHYDRATED]: {
          type: "object",
          constructorName: "RegExp",
        },
      },
      [],
    ],
    [
      Symbol("good"),
      {
        [PROP_DEHYDRATED]: {
          type: "symbol",
        },
      },
      [],
    ],
    [
      {
        fromNoWhere: Object.create(null),
      },
      {
        fromNoWhere: {
          [PROP_DEHYDRATED]: {
            type: "object",
            constructorName: "null",
          },
        },
      },
      [],
    ],
    [
      circularObject,
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
      [
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
      ],
    ],
    [
      circularArray,
      [
        {
          [PROP_DEHYDRATED]: {
            type: "ref",
            ref: 0,
          },
        },
      ],
      [
        [
          {
            [PROP_DEHYDRATED]: {
              type: "ref",
              ref: 0,
            },
          },
        ],
      ],
    ],
  ])(
    "`%j` should be dehydrated as `{ value: %j, repo: %j }`",
    (value, result, expectedRepo) => {
      const repo: any[] = [];
      expect(dehydrate(value, repo)).toEqual(result);
      expect(repo).toEqual(expectedRepo);
    }
  );
});
