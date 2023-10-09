interface Window {
  /** A map of versions of core packages. */
  BRICK_NEXT_VERSIONS?: Record<string, string>;

  /** Declare supported features currently. */
  BRICK_NEXT_FEATURES?: string[];

  /** For brick next devtools only */
  __dev_only_getAllContextValues(options: {
    tplStateStoreId?: string;
  }): Record<string, unknown>;

  /** V2 DLL */
  dll?: DLL;
}

interface DLL {
  (moduleId: "tYg3"): {
    developHelper: {
      getAllContextValues(options: {
        tplContextId?: string;
      }): Map<string, { value: unknown }>;
    };
  };
}
