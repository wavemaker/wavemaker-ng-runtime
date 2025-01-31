import React, { useEffect, useState } from "react";
import { useStorybookApi } from "@storybook/api";

const CSSVariablesPanel = () => {
  const [currentValues, setCurrentValues] = useState({});
  const api = useStorybookApi();

  useEffect(() => {
    // Update function triggered when a story is rendered
    const updateVariables = () => {
      const parameters = api.getCurrentStoryData().parameters;

      // Log the parameters to check the data
      console.log("Updated parameters:", parameters);

      if (parameters?.cssVars) {
        const storyVariables = parameters.cssVars;
        const updatedVars = JSON.parse(localStorage.getItem('updatedCSSVraiables'));

        // Log the variables to see if they are being updated
        console.log("CSS Variables:", storyVariables);

        // Only update if the variables have changed
        setCurrentValues((prevValues) => {
          //const updatedValues = { ...prevValues, ...storyVariables };
          const updatedValues = {...updatedVars };

          // Check if the previous values are different from the updated ones
          if (JSON.stringify(prevValues) !== JSON.stringify(updatedValues)) {
            console.log("Updated Variables:", updatedValues);
            return updatedValues; // Only update state if values are different
          }

          return prevValues; // No state change if the values are the same
        });
      } else {
        setCurrentValues(null); // No CSS variables found
      }
    };

    // Listen for the 'storyRendered' event
    api.on("storyRendered", updateVariables);

    // Cleanup the listener on component unmount
    return () => {
      api.off("storyRendered", updateVariables);
    };
  }, [api]);

  const handleChange = (event, variable) => {
    const updatedValue = event.target.value;

    // Update local state for the variable being modified
    setCurrentValues((prevValues) => ({
      ...prevValues,
      [variable]: updatedValue,
    }));

    // Modify the CSS variables in the iframe dynamically
    const iframe = document.querySelector("#storybook-preview-iframe");
    const iframeDocument =
      iframe?.contentDocument || iframe?.contentWindow?.document;

    if (iframeDocument) {
      let styleTag = iframeDocument.querySelector("#custom-css-variables");
      if (!styleTag) {
        styleTag = iframeDocument.createElement("style");
        styleTag.id = "custom-css-variables";
        iframeDocument.head.appendChild(styleTag);
      }

      let newStyleContent = styleTag.innerHTML.trim();
      if (!newStyleContent.includes(":root")) {
        newStyleContent = ":root {\n}";
      }

      let rootStartIndex = newStyleContent.indexOf(":root {");
      let rootEndIndex = newStyleContent.indexOf("}", rootStartIndex);

      let rootVariables = newStyleContent.slice(
        rootStartIndex + ":root {".length,
        rootEndIndex
      ).trim();

      const variableRegex = new RegExp(`${variable}:.*?;`, "g");

      if (variableRegex.test(rootVariables)) {
        rootVariables = rootVariables.replace(
          variableRegex,
          `${variable}: ${updatedValue};`
        );
      } else {
        rootVariables += `\n  ${variable}: ${updatedValue};`;
      }

      newStyleContent = `:root {\n${rootVariables}\n}`;
      styleTag.innerHTML = newStyleContent;
    }
  };

  return (
    <div>
      <div className="wm-token-tab-content">
        {currentValues ? (
          Object.entries(currentValues).map(([key, value]) => (
            <div className="content-wrapper" key={key}>
              <label>{key}</label>
              <div className="input-wrapper">
                <input type="text" value={value} onChange={(e) => handleChange(e, key)} className="input-box" />
                <input type="color" value={value} onChange={(e) => handleChange(e, key)} className="color-picker" />
              </div>
            </div>
          ))
        ) : (
          <p>No CSS Variables Found</p>
        )}
      </div>
    </div>
  );
};

export default CSSVariablesPanel;
