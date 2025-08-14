// client/craco.config.js
const { ESLintWebpackPlugin } = require('eslint-webpack-plugin');

module.exports = {
  // 1) remove CRA's ESLint plugin from webpack
  webpack: {
       configure: (webpackConfig) => {
     webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
       // drop any plugin whose constructor is named "ESLintWebpackPlugin"
       return !(
         plugin &&
         plugin.constructor &&
         plugin.constructor.name === 'ESLintWebpackPlugin'
       );
     });
     return webpackConfig;
   },
  },

  // 2) your existing devServer proxy bits
  devServer: {
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
};
