const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  devtool:
    // DevTools page doesn't support separated source-map yet.
    // Use inline-source-map in development only.
    process.env.NODE_ENV === "development"
      ? "cheap-module-source-map"
      : undefined,
  context: __dirname,
  entry: {
    devtools: "./src/devtools",
    panel: "./src/panel",
    background: "./src/background",
    content: "./src/content",
    hook: "./src/hook",
  },
  output: {
    path: path.join(__dirname, "extension/build"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    symlinks: false,
  },
  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        // Todo(steve): remove these plugins after update webpack@5
        // Ref https://github.com/webpack/webpack/issues/10227
        options: {
          plugins: [
            "@babel/plugin-proposal-optional-chaining",
            "@babel/plugin-proposal-nullish-coalescing-operator",
            [
              "@babel/plugin-proposal-decorators",
              {
                legacy: true,
              },
            ],
            ["@babel/plugin-proposal-class-properties", { loose: true }],
          ],
        },
      },
      {
        test: /\.css$/,
        // Ref https://github.com/webpack-contrib/mini-css-extract-plugin/issues/118
        sideEffects: true,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(woff(2)?|ttf|eot)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              // publicPath: distPublicPath
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false,
    }),
    new HtmlWebpackPlugin({
      title: "Brick Next Developer Tools Panel",
      chunks: ["panel"],
      filename: "panel.html",
    }),
    new HtmlWebpackPlugin({
      title: "Brick Next Developer Tools",
      chunks: ["devtools"],
      filename: "devtools.html",
    }),
    new MiniCssExtractPlugin(),
  ],
};
