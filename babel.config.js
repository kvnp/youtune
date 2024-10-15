/** @type { import("@babel/core").ConfigFunction } */
export default function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["transform-react-remove-prop-types", {
        removeImport: true,
        additionalLibraries: ["react-style-proptype"]
      }],
    ]
  };
};
