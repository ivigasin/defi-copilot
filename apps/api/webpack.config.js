const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = function (options) {
  return {
    ...options,
    externals: [
      nodeExternals({
        allowlist: [/^@defi-copilot\//],
      }),
    ],
    resolve: {
      ...options.resolve,
      alias: {
        '@defi-copilot/domain': path.resolve(__dirname, '../../packages/domain/src'),
        '@defi-copilot/shared': path.resolve(__dirname, '../../packages/shared/src'),
        '@defi-copilot/provider-sdk': path.resolve(__dirname, '../../packages/provider-sdk/src'),
        '@defi-copilot/recommendation-engine': path.resolve(__dirname, '../../packages/recommendation-engine/src'),
        '@defi-copilot/alert-engine': path.resolve(__dirname, '../../packages/alert-engine/src'),
      },
      extensions: ['.ts', '.js'],
    },
  };
};
