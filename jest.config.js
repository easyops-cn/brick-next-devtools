module.exports = {
  transform: {
    "^.+\\.[t|j]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/__jest__/setup.js"],
  snapshotSerializers: ["enzyme-to-json/serializer"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}"],
  coverageDirectory: "<rootDir>/.coverage",
  coverageReporters: ["lcov", "text-summary"],
  coveragePathIgnorePatterns: ["/node_modules/", "/extension/"],
  testPathIgnorePatterns: ["/node_modules/", "/extension/"],
  testEnvironment: "jest-environment-jsdom-sixteen",
};
