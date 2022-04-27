/** @type {import('next').NextConfig} */
const path = require("path");
const { i18n } = require("./next-i18next.config");

const nextConfig = {
  // reactStrictMode: true,
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  i18n,
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};

module.exports = nextConfig;
