import { addons, types } from "@storybook/addons";
import { AddonPanel } from "@storybook/components";
import React from "react";
import CSSVariablesPanel from "./CSSVariablesPanel";

const ADDON_ID = "storybook/css-tokens";
const PANEL_ID = `${ADDON_ID}/panel`;

//console.log('Registering CSS Variables Addon');

addons.register(ADDON_ID, () => {
  //console.log('Addon Registered');
  addons.add(PANEL_ID, {
    title: "CSS Variables",
    type: types.PANEL,
    render: ({ active }) => (
      <AddonPanel active={active}>
        <CSSVariablesPanel />
      </AddonPanel>
    ),
  });
});
