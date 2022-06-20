import React from "react";

import Demo from ".";

export default {
  component: Demo,
  title: "@supdesign/Demo",
};

const Template = (args) => <Demo {...args} />;

export const Default = Template.bind({});
Default.args = {
  children: "HELLO WORLD",
  primary:false,
};