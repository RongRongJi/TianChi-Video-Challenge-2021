/*
 * vue config
 * */
const fs = require("fs-extra");
const path = require("path");
module.exports = {
  publicPath: "/",
  devServer: {
    port: 8020,
    public: "http://localhost:8020",
    hot: true,
    overlay: {
      warnings: false,
      errors: true,
    },
    https: {
      key: fs.readFileSync(path.join(__dirname, "./cert/server.key")),
      cert: fs.readFileSync(path.join(__dirname, "./cert/server.cert")),
    },
    openPage: "#/?path=MainView",
    proxy: {
      "/socket.io": {
        target: "https://localhost:5000/",
        changeOrigin: true,
        ws: true,
      },
      "/server": {
        target: "https://localhost:5000/",
        changeOrigin: true,
        pathRewrite: {
          "^/server": "",
        },
      },
    },
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "development") {
      config.devtool = "eval-source-map";
    }
  },
};
