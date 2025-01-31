import React, { useEffect, useState } from "react";
import { useStorybookApi } from "@storybook/api";

const CssPanel = () => {
  const [currentValues, setCurrentValues] = useState({});
  const api = useStorybookApi();
  useEffect(() => {
    const updateVariables = () => {
      debugger;
      const currentStory = api.getCurrentStoryData();
      const parameters = currentStory?.parameters;
      const args = currentStory?.args;
      console.log(args);
  
      if (parameters?.cssVars) {
        const widgetClasses = localStorage.getItem("activeValue") ? localStorage.getItem("activeValue").split(" ") : [];
        let cssVars = null;
  
        for (let i = 0; i < widgetClasses.length; i++) {
          const widgetClass = widgetClasses[i];
          cssVars = parameters.cssVars[widgetClass];
          if (cssVars) {
            break;
          }
        }
  
        if (cssVars) {
          const filteredCssVars = Object.fromEntries(
            Object.entries(cssVars).filter(([key, value]) => {
              return value !== "undefined" && value != null;
            })
          );
          setCurrentValues(filteredCssVars);
        } else {
          setCurrentValues({});
        }
      } else {
        setCurrentValues({});
      }
    };
  
    // Get the current story and args
    const currentStory = api.getCurrentStoryData();
    const args = currentStory?.args;
  
    // Update variables if args.class exists
    if (args?.class) {
      updateVariables();
    }
  
    // Listen for story changes
    api.on("storyRendered", updateVariables);
  
    // Cleanup listener
    return () => {
      api.off("storyRendered", updateVariables);
    };
  }, [api]); // Only `api` is needed in the dependency array

  const handleChange = (event, variable) => {
    const updatedValue = event.target.value;

    setCurrentValues((prevValues) => ({
      ...prevValues,
      [variable]: updatedValue,
    }));

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

      rootVariables += `\n  ${variable}: ${updatedValue};`;

      newStyleContent = `:root {\n${rootVariables}\n}`;
      styleTag.innerHTML = newStyleContent;
    }
  };

  return (
    <div>
      <div className="wm-token-tab-content">
        {Object.entries(currentValues).length > 0 ? (
          Object.entries(currentValues).map(([key, value]) => (
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
          ))
        ) : (
          <div className="text-center text-info">
            No CSS variables available for this class.
          </div>
        )}
      </div>
    </div>
  );
};

export default CssPanel;