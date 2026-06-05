const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withExcludeWebrtc(config) {
  return withProjectBuildGradle(config, (config) => {
    let buildGradle = config.modResults.contents;
    
    // 1. Fix the Jitsi Conflict (Bypass Jitsi's WebRTC binary compilation)
    if (!buildGradle.includes('org.jitsi:webrtc')) {
      const resolutionBlock = `
allprojects {
    configurations.all {
        resolutionStrategy.eachDependency { DependencyResolveDetails details ->
            if (details.requested.group == 'org.jitsi' && details.requested.name == 'webrtc') {
                details.useTarget("io.github.webrtc-sdk:android:144.7559.05")
            }
        }
    }
}
`;
      buildGradle = buildGradle + resolutionBlock;
    }

    // 2. Fix the LiveKit Duplication Conflict (Redirect native dependencies cleanly)
    if (!buildGradle.includes('project(\':react-native-webrtc\')')) {
      const livekitBlock = `
allprojects {
    configurations.all {
        resolutionStrategy.dependencySubstitution {
            // Tells Android to ignore standard react-native-webrtc and route through livekit's module instead
            substitute project(':react-native-webrtc') using project(':livekit_react-native-webrtc')
        }
    }
}
`;
      buildGradle = buildGradle + livekitBlock;
    }
    
    config.modResults.contents = buildGradle;
    return config;
  });
};
