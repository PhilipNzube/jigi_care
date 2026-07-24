const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to inject ABI Splits into android/app/build.gradle
 * This ensures ABI splits config is preserved whenever `expo prebuild` or `expo run:android` runs.
 */
const withAbiSplits = (config) => {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === "groovy") {
      let buildGradle = config.modResults.contents;

      // Only add if not already present
      if (!buildGradle.includes("enableAbiSplits")) {
        const abiSplitsBlock = `
    // ABI Splits — enabled via: gradlew assembleRelease -Pandroid.enableAbiSplits=true
    // Produces a separate, smaller APK per CPU architecture.
    def enableAbiSplits = (findProperty('android.enableAbiSplits') ?: 'false').toBoolean()
    splits {
        abi {
            reset()
            enable enableAbiSplits
            universalApk false
            include "armeabi-v7a", "arm64-v8a", "x86", "x86_64"
        }
    }

    // Assign a unique versionCode per ABI so the Play Store treats them as separate APKs
    def abiVersionCodes = ['armeabi-v7a': 1, 'x86': 2, 'x86_64': 3, 'arm64-v8a': 4]
    applicationVariants.all { variant ->
        variant.outputs.each { output ->
            def abiName = output.getFilter(com.android.build.OutputFile.ABI)
            if (abiName != null) {
                def abiCode = abiVersionCodes.get(abiName)
                if (abiCode != null) {
                    output.versionCodeOverride = abiCode * 1000000 + variant.versionCode
                }
            }
        }
    }`;

        if (buildGradle.includes("androidResources {")) {
          buildGradle = buildGradle.replace(
            "androidResources {",
            `${abiSplitsBlock}\n\n    androidResources {`
          );
        } else {
          buildGradle = buildGradle.replace(
            "android {",
            `android {\n${abiSplitsBlock}`
          );
        }

        config.modResults.contents = buildGradle;
      }
    }
    return config;
  });
};

module.exports = withAbiSplits;
