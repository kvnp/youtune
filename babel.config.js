/** @type { import("@babel/core").ConfigFunction } */
export default function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: []
  };
};
