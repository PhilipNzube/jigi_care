// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure PNG and other image assets are recognized
if (!config.resolver.assetExts.includes('png')) {
  config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp', 'svg');
}

// Ensure TypeScript files can be resolved from node_modules
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// Enable watching node_modules for changes (helps with asset resolution)
config.watchFolders = [__dirname];

// Add node_modules to resolver paths to help Metro find assets
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = config;

