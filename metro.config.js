// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure PNG and other image assets are recognized
if (!config.resolver.assetExts.includes("png")) {
  config.resolver.assetExts.push("png", "jpg", "jpeg", "gif", "webp", "svg");
}
// Audio assets for ringtones (WAV, MP3, etc.)
["wav", "mp3", "m4a", "ogg"].forEach((ext) => {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
});

// Ensure TypeScript files can be resolved from node_modules
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// Enable watching node_modules for changes (helps with asset resolution)
config.watchFolders = [__dirname];

// Add node_modules to resolver paths to help Metro find assets
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Expo-recommended alias mapping using a custom resolver
const ALIASES = {
  'react-native-webrtc': '@livekit/react-native-webrtc',
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Intercept the vanilla import and swap it with LiveKit's version
  const mappedModuleName = ALIASES[moduleName] ?? moduleName;
  return context.resolveRequest(context, mappedModuleName, platform);
};

module.exports = config;
