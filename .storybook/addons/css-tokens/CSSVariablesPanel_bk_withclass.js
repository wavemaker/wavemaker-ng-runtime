import React, { useEffect, useState } from "react";
import { useStorybookApi } from "@storybook/api";

const CSSVariablesPanel = () => {
  const [currentValues, setCurrentValues] = useState({});
  const api = useStorybookApi();
  useEffect(() => {
    const updateVariables = () => {
      const currentStory = api.getCurrentStoryData();
      const parameters = currentStory?.parameters;
      const args = currentStory?.args;
        
     
  
      console.log("Current Story Data:", currentStory);
      console.log("Parameters:", parameters); 
      console.log("Args:", args);
  
      if (parameters?.cssVars) {
        console.log("Found cssVars in parameters:", parameters.cssVars);
        
        const widgetClasses = args?.class ? args.class.split(" ") : [];
        console.log("Widget Classes (split):", widgetClasses);
  
        let cssVars = null;
  
        for (let i = 0; i < widgetClasses.length; i++) {
          const widgetClass = widgetClasses[i];
          console.log(`Checking CSS Vars for class: ${widgetClass}`);
          cssVars = parameters.cssVars[widgetClass];
          if (cssVars) {
            console.log(`Found CSS Vars for class "${widgetClass}":`, cssVars);
            break;
          }
        }
  
        if (cssVars) {
          if (Object.keys(cssVars).length === 0) {
            console.log("No valid CSS variables found for this class.");
          } else {
            const filteredCssVars = Object.fromEntries(
              Object.entries(cssVars).filter(([key, value]) => {
                console.log(`Checking variable "${key}":`, value);
                const isValidValue = value !== "undefined" && value != null;
                console.log(`Is "${key}" valid?`, isValidValue);
                return isValidValue;
              })
            );
            console.log("Filtered CSS Variables:", filteredCssVars);
            setCurrentValues(filteredCssVars);
            
          }
        } else {
          console.log("No CSS variables found for the specified class(es).");
          setCurrentValues({});
        }
      } else {
        console.log("No cssVars defined in parameters.");
        setCurrentValues({});
      }
    };
  
    // Listen for changes to args
    const currentStory = api.getCurrentStoryData();
    const args = currentStory?.args;
    if (args?.class) {
      updateVariables();
    }
  
    api.on("storyRendered", updateVariables);
    return () => {
      api.off("storyRendered", updateVariables);
    };
  }, [api]); 


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
          <div className="text-center text-info">No CSS variables available for this class.</div>
        )}
      </div>
    </div>
  );
};

export default CSSVariablesPanel;
