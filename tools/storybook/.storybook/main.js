const path = require('path');
module.exports = {
  "stories": [
    "../../../libs/**/src/*.stories.mdx",
    "../../../libs/**/src/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
    core: {
    builder: "webpack5"
  },
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.less$/,
      use: ["style-loader", "css-loader", "less-loader"],
      // include: path.resolve(__dirname, "../../libs/ui/src/stories/"),
    });
    return config;
  },
}