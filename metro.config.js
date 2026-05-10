const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ✅ Add ONNX file support
config.resolver.assetExts.push("onnx");

module.exports = withNativeWind(config, {
  input: "./app/globals.css",
});