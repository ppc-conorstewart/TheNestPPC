// ==============================
// FILE: client/craco.config.js
// ==============================
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.plugins = webpackConfig.plugins.filter((plugin) => {
        return !(
          plugin &&
          plugin.constructor &&
          plugin.constructor.name === 'ESLintWebpackPlugin'
        );
      });
      return webpackConfig;
    },
  },
  devServer: {
    allowedHosts: 'all',
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/auth': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
};
