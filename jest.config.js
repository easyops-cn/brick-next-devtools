module.exports = {
  "transform": {
    "^.+\\.[t|j]sx?$": "babel-jest"
  },
  "setupFilesAfterEnv": [
    "<rootDir>/__jest__/setup.js"
  ],
  "snapshotSerializers": [
    "enzyme-to-json/serializer"
  ]
};