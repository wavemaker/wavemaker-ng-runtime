import { addons, types } from "@storybook/addons";
import { AddonPanel } from "@storybook/components";
import React from "react";
import TokensPanel from "./panel";

const ADDON_ID = "storybook/css-tokens";
const PANEL_ID = `${ADDON_ID}/panel`;

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    title: "CSS Variables",
    type: types.PANEL,
    render: ({ active, key }) => (
      <AddonPanel active={active} key={key}>
        <TokensPanel />
      </AddonPanel>
    ),
  });
});

// import { addons, types } from '@storybook/addons';
// import { Panel } from './panel'; // Import the panel for the custom tab

// // Define your addon ID and panel ID
// const ADDON_ID = 'css-tokens';
// const PANEL_ID = `${ADDON_ID}/panel`;

// addons.register(ADDON_ID, () => {
//   // Register the panel (this will show the custom tab)
//   addons.add(PANEL_ID, {
//     type: types.PANEL,
//     title: 'CSS Tokens',  // Title of the tab
//     render: ({ active, key }) => <Panel active={active} key={key} />,
//   });
// });

