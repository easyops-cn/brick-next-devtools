# Brick Next Developer Tools [![Travis Status](https://travis-ci.com/easyops-cn/brick-next-devtools.svg?branch=master)](https://travis-ci.com/easyops-cn/brick-next-devtools) [![Coverage Status](https://coveralls.io/repos/github/easyops-cn/brick-next-devtools/badge.svg?branch=master)](https://coveralls.io/github/easyops-cn/brick-next-devtools)

A Chrome devtools extension for Brick Next developers.

## Development

```
npm install
npm start
```

Follow [official tutorial](https://developer.chrome.com/extensions/getstarted), when loading unpacked extension, choose the `brick-next-devtools/extension` directory.

## Testing

```
npm test
```

To test a specified file:

```
npm test src/some-file.spec.ts
```

To test a specified file in watch mode:

```
npm test src/some-file.spec.ts -- --watch
```

To test a specified file and collect coverage from related files only:

```
npm test src/some-file.spec.ts -- --no-collect-coverage-from
```

## Publish

```
npm run build
npm zip
```

Upload zip file through Chrome Web Store Developer Dashboard.
