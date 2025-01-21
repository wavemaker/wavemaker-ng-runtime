import React, { useState, useEffect } from "react";

const STORAGE_KEY = "storybook_css_tokens";

const TokensPanel = () => {
  const defaultTokens = {
    "--wm-app-background": "#ffffff",
    "--wm-form-control-background": "#ffffff",
    "--wm-rating-icon-color": "#444444",
    "--wm-app-color": "#444444",
    "--wm-headings-color": "#444444",
    "--wm-color-primary": "#296df6",
  };

  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem(STORAGE_KEY);
    return savedTokens ? JSON.parse(savedTokens) : defaultTokens;
  });

  useEffect(() => {
    applyTokens(tokens);
  }, [tokens]);

  const handleChange = (variable, value) => {
    document.documentElement.style.setProperty(variable, value);
    const newTokens = { ...tokens, [variable]: value };
    setTokens(newTokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));

    applyTokens(newTokens);
  };

  // Apply Tokens to Sunfi Styles Dynamically
  const applyTokens = (tokens) => {
    Object.entries(tokens).forEach(([variable, value]) => {
      document.documentElement.style.setProperty(variable, value);
    });

    //Force update Sunfi components by injecting styles manually
    injectCustomStyles(tokens);
  };

  // Inject styles dynamically
  const injectCustomStyles = (tokens) => {
    let styleTag = document.getElementById("dynamic-theme-styles");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-theme-styles";
      document.head.appendChild(styleTag);
    }

    let styles = `
      body { background-color: ${tokens["--wm-app-background"]} !important; }
      .some-sunfi-class { color: ${tokens["--wm-app-color"]} !important; }
    `;

    styleTag.innerHTML = styles;
  };

  return (
    <div style={{ padding: "10px" }}>
      <h3>Update CSS Tokens</h3>
      {Object.keys(tokens).map((token) => (
        <div key={token} style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>{token}</label>
          <input
            type="color"
            value={tokens[token]}
            onChange={(e) => handleChange(token, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default TokensPanel;
