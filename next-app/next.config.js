/** @type {import('next').NextConfig} */
const path = require("path");
const { i18n } = require("./next-i18next.config");
const withAntdLess = require("next-plugin-antd-less")

const nextConfig = withAntdLess({
  // reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true
      }
    ]
  },
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
  lessVarsFilePath: "./src/styles/antd_variables.less"
});

module.exports = nextConfig;
