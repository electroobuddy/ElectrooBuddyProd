const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add OneSignal to the resolver
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-onesignal': 'react-native-onesignal',
};

// Add OneSignal to the asset extensions
config.resolver.assetExts.push(...[
  // Add any additional asset extensions if needed
]);

// Configure the transformer to handle OneSignal
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Add OneSignal to the watchFolders
config.watchFolders = [
  ...config.watchFolders,
  // Add any additional watch folders if needed
];

module.exports = config;
