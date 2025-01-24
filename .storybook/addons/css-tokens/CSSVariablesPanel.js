import React, { useEffect, useState } from "react";
import { useStorybookApi } from "@storybook/api";

const CSSVariablesPanel = () => {
  const [currentValues, setCurrentValues] = useState({});
  const api = useStorybookApi();

  useEffect(() => {
    // Initialize the default CSS variables
    const initialVariables = {};

    setCurrentValues(initialVariables);
  }, []);

  useEffect(() => {
    const updateVariables = () => {
      const parameters = api.getCurrentStoryData().parameters;

      // Check if story has custom CSS variables defined
      const storyVariables = parameters?.cssVars || {};
      setCurrentValues((prevValues) => ({
        ...prevValues,
        ...storyVariables,
      }));
    };

    api.on("storyRendered", updateVariables);

    return () => {
      api.off("storyRendered", updateVariables);
    };
  }, [api]);

  const handleChange = (event, variable) => {
    const updatedValue = event.target.value;

    // Update the state with the new value
    setCurrentValues((prevValues) => ({
      ...prevValues,
      [variable]: updatedValue,
    }));

    // Access the preview iframe document
    const iframe = document.querySelector("#storybook-preview-iframe");
    const iframeDocument =
      iframe?.contentDocument || iframe?.contentWindow?.document;

    if (iframeDocument) {
      // Create a new <style> tag if not already there
      let styleTag = iframeDocument.querySelector("#custom-css-variables");
      if (!styleTag) {
        styleTag = iframeDocument.createElement("style");
        styleTag.id = "custom-css-variables"; // Set an ID so we can update it later
        iframeDocument.head.appendChild(styleTag);
      }

      // Get the current CSS variables from the style tag
      let newStyleContent = styleTag.innerHTML.trim();

      // Check if the :root block exists, if not, create it
      if (!newStyleContent.includes(":root")) {
        newStyleContent = ":root {\n}";
      }

      // Ensure all variables are inside the :root block
      let rootStartIndex = newStyleContent.indexOf(":root {");
      let rootEndIndex = newStyleContent.indexOf("}", rootStartIndex);

      // Extract the variables inside the :root block and update
      let rootVariables = newStyleContent.slice(
        rootStartIndex + ":root {".length,
        rootEndIndex
      ).trim();

      const variableRegex = new RegExp(`${variable}:.*?;`, "g");

      if (variableRegex.test(rootVariables)) {
        // If the variable exists, replace it
        rootVariables = rootVariables.replace(
          variableRegex,
          `${variable}: ${updatedValue};`
        );
      } else {
        // If the variable doesn't exist, add it inside the :root block
        rootVariables += `\n  ${variable}: ${updatedValue};`;
      }

      // Reassemble the entire style content with the updated variables inside :root
      newStyleContent = `:root {\n${rootVariables}\n}`;

      // Apply the changes to the style tag
      styleTag.innerHTML = newStyleContent;
    }
  };

  return (
    <div>
      <div className="wm-token-tab-content">
        {Object.entries(currentValues).map(([key, value]) => (
          <div className="content-wrapper" key={key}>
            <label>{key}</label>
            <div className="input-wrapper">
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(e, key)}
                className="input-box"
              />
              <input
                type="color"
                value={value}
                onChange={(e) => handleChange(e, key)}
                className="color-picker"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CSSVariablesPanel;
