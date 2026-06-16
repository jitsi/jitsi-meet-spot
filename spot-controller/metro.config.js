// Expo Metro config with monorepo support and react-native-svg-transformer.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Monorepo: watch the workspace root and resolve modules from both the project's
// own node_modules and the hoisted root node_modules.
config.watchFolders = [ workspaceRoot ];
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules')
];

// react-native-svg-transformer: import `.svg` files under assets/ as React components.
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [ ...config.resolver.sourceExts, 'svg' ];

module.exports = config;
