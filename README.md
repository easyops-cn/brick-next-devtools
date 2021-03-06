# Brick Next Developer Tools [![CI Status](https://github.com/easyops-cn/brick-next-devtools/workflows/CI/badge.svg?event=push)](https://github.com/easyops-cn/brick-next-devtools/actions?query=workflow%3ACI) [![Coverage Status](https://coveralls.io/repos/github/easyops-cn/brick-next-devtools/badge.svg?branch=master)](https://coveralls.io/github/easyops-cn/brick-next-devtools)

A Chrome devtools extension for Brick Next developers. [Check it out on Chrome Webstore](https://chrome.google.com/webstore/detail/brick-next-developer-tool/imfbjbfcldgkdbfgeoppalofbjfihpdp).

![Extension screenshot](./devtools.jpg)

## Development

```
npm install
npm start
```

Follow [official tutorial](https://developer.chrome.com/extensions/getstarted), when loading unpacked extension, choose the `brick-next-devtools/extension` directory.

## Supported Browsers

Supports Chrome >= 57 in production, and last 2 Chrome versions in development.

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
npm run release
npm run build
npm run zip
```

Upload zip file through Chrome Web Store Developer Dashboard.
