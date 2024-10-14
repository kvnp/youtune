/** @type { import("@babel/core").ConfigFunction } */
export default function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "@babel/plugin-transform-flow-strip-types",
      ["@babel/plugin-proposal-private-methods", { loose: true }],
      ["@babel/plugin-transform-class-properties", { loose: true }],
      ["@babel/plugin-transform-private-property-in-object", { loose: true }],
      ["transform-react-remove-prop-types", {
        removeImport: true,
        additionalLibraries: ["react-style-proptype"]
      }],
    ]
  };
};
