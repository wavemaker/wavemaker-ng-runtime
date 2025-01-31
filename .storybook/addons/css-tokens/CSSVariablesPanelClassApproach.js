import React, { useEffect, useState } from "react";
import { useStorybookApi } from "@storybook/api";

const Spinner = () => (
  <div className="spinner text-center text-info">Loading...</div> 
);

const CSSVariablesPanel = () => {
  const [currentValues, setCurrentValues] = useState({});
  const [loading, setLoading] = useState(true);
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
        debugger;
        
        // Get current selected class
        const widgetClass =
          (api.getChannel().data?.updateStoryArgs &&
            api.getChannel().data?.updateStoryArgs[0].updatedArgs?.class) ??
          (args.class ? args.class : "");
    
          let cssVars = parameters.cssVars[widgetClass] ?? parameters.cssVars;
    
        if (cssVars) {
          if (Object.keys(cssVars).length === 0) {
            console.log("No valid CSS variables found for this class.");
          } else {
            // ✅ Fetch computed CSS variable values from :root
            const computedStyles = getComputedStyle(document.documentElement);
            const updatedCssVars = Object.fromEntries(
              Object.entries(cssVars).map(([key, value]) => {
                const computedValue = computedStyles.getPropertyValue(key).trim() || value;
                console.log(`Computed value for ${key}:`, computedValue);
                return [key, computedValue];
              })
            );
    
            console.log("Updated CSS Variables with Computed Values:", updatedCssVars);
            setCurrentValues(updatedCssVars);
          }
        } else {
          console.log("No CSS variables found for the specified class.");
          setCurrentValues({});
        }
      } else {
        console.log("No cssVars defined in parameters.");
        setCurrentValues({});
      }
      setLoading(false);
    };
    
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
    debugger;
    let updatedValue = event.target.value.trim(); 
  
    // Validate hex color format if needed
    if (event.target.type === "color" && !/^#[0-9A-Fa-f]{6}$/.test(updatedValue)) {
      return;
    }
  
    // Update state
    setCurrentValues((prevValues) => ({
      ...prevValues,
      [variable]: updatedValue,
    }));
  
    // Update CSS variables dynamically
    const iframe = document.querySelector("#storybook-preview-iframe");
    const iframeDocument = iframe?.contentDocument || iframe?.contentWindow?.document;
  
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
  
      // Replace or add CSS variable
      let updatedRootVariables = newStyleContent.replace(
        new RegExp(`${variable}: .*?;`, "g"), 
        `${variable}: ${updatedValue};`
      );
  
      if (!updatedRootVariables.includes(`${variable}:`)) {
        updatedRootVariables = updatedRootVariables.replace(
          ":root {",
          `:root {\n  ${variable}: ${updatedValue};`
        );
      }
  
      styleTag.innerHTML = updatedRootVariables;
    }
    
    setTimeout(() => {
      const computedValue = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
      console.log(`Computed value for ${variable} after update:`, computedValue);
  
      setCurrentValues((prevValues) => ({
        ...prevValues,
        [variable]: computedValue || updatedValue,
      }));
    }, 100); 
  };
  
  return (
    <div>
      <div className="wm-token-tab-content">
        {loading ? (
          <Spinner /> // Show spinner while loading
        ) : Object.entries(currentValues).length > 0 ? (
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
                  value={value.startsWith("#") ? value : ""}
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
