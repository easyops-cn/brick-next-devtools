[![Travis Status](https://travis-ci.com/easyops-cn/brick-next-devtools.svg?branch=master)](https://travis-ci.com/easyops-cn/brick-next-devtools)

# Brick Next Developer Tools

A Chrome extension for Brick Next developers.

## Development

```
npm install
npm start
```

Follow [Official Tutorial](https://developer.chrome.com/extensions/getstarted), when loading unpacked extension, choose the `brick-next-devtools/extension` directory.

## Testing

```
npm test
```

Testing a specified file in watch mode:

```
npm test src/some-file.spec.ts -- --watch
```

## Publish

```
npm run build
npm zip
```

Upload zip file through Chrome Web Store Developer Dashboard.
