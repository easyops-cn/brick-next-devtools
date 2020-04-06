const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  // mode: "production",
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  devtool: process.env.NODE_ENV === "development" ? "inline-source-map" : undefined,
  context: __dirname,
  entry: {
    devtools: "./src/devtools",
    panel: "./src/panel",
    background: "./src/background",
    content: "./src/content",
    hook: "./src/hook",
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    symlinks: false
  },
  module: {
    rules: [
      {
        // Include ts, tsx, js, and jsx files.
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          rootMode: "upward"
        }
      },
      {
        test: /\.css$/,
        // Ref https://github.com/webpack-contrib/mini-css-extract-plugin/issues/118
        sideEffects: true,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(woff(2)?|ttf|eot)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              // publicPath: distPublicPath
            }
          }
        ]
      },
    ]
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "Brick Next Developer Tools Panel",
      // inject: false,
      chunks: ["panel"],
      filename: "panel.html"
    }),
    new HtmlWebpackPlugin({
      title: "Brick Next Developer Tools",
      // inject: false,
      chunks: ["devtools"],
      filename: "devtools.html"
    }),
    new CopyPlugin([
      "manifest.json",
      "icon.png"
    ]),
  ]
};
