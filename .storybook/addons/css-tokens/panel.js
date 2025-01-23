import React, { useState, useEffect } from "react";

const STORAGE_KEY = "storybook_css_tokens";

const TokensPanel = () => {
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem(STORAGE_KEY);
    return savedTokens ? JSON.parse(savedTokens) : getDefaultTokens();
  });

  useEffect(() => {
    injectInitialStyles();
    const timeout = setTimeout(() => {
      fetchCSSVariables();
    }, 1000); // To load iframe before fetching variables
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    applyTokens(tokens);
  }, [tokens]);

  // Default CSS variables
  function getDefaultTokens() {
    return {
      "--wm-btn-color":"#1D1B20",
      "--wm-btn-default-color":"#1D1B20",
      "--wm-app-background": "#fff",
      "--wm-form-control-background": "#fff",
      "--wm-rating-icon-color": "#444",
      "--wm-app-color": "#444",
      "--wm-headings-color": "#444",
      "--wm-color-primary": "#296df6",
    };
  }

  // Inject default CSS styles into the document
  const injectInitialStyles = () => {
    let styleTag = document.getElementById("initial-theme-styles");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "initial-theme-styles";
      document.head.appendChild(styleTag);
    }

    let defaultStyles = `:root {`;
    Object.entries(getDefaultTokens()).forEach(([variable, value]) => {
      defaultStyles += `${variable}: ${value};`;
    });
    defaultStyles += `}`;

    styleTag.innerHTML = defaultStyles;
    console.log("Initial CSS variables injected.");
  };

  // Fetch CSS Variables from Storybook iframe
  const fetchCSSVariables = () => {
    const iframe = document.querySelector("#storybook-preview-iframe");

    // Check if iframe exists
    if (!iframe) {
      console.log("Iframe not found.");
      return;
    }

    // Wait for iframe content to load
    iframe.onload = () => {
      const iframeDoc = iframe.contentWindow.document;
      const rootStyle = getComputedStyle(iframeDoc.documentElement);
      const vars = {};

      for (let i = 0; i < rootStyle.length; i++) {
        const name = rootStyle[i];
        if (name.startsWith("--")) {
          vars[name] = rootStyle.getPropertyValue(name).trim();
        }
      }

      console.log("CSS Variables Found in Iframe:", vars);
      setTokens(vars); // Set tokens for panel display
    };
  };

  // Apply Tokens to the document and Storybook iframe
  const applyTokens = (tokens) => {
    let styleTag = document.getElementById("dynamic-theme-styles");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-theme-styles";
      document.head.appendChild(styleTag);
    }

    let styles = `:root {`;
    Object.entries(tokens).forEach(([variable, value]) => {
      styles += `${variable}: ${value} !important;`;
    });
    styles += `}`;

    styleTag.innerHTML = styles;
    console.log("Updated CSS Variables:", styles);

    // Apply styles inside Storybook’s iframe
    const iframe = document.querySelector("#storybook-preview-iframe");
    if (iframe && iframe.contentWindow) {
      const iframeDoc = iframe.contentWindow.document;
      let iframeStyleTag = iframeDoc.getElementById("iframe-dynamic-theme-styles");

      if (!iframeStyleTag) {
        iframeStyleTag = iframeDoc.createElement("style");
        iframeStyleTag.id = "iframe-dynamic-theme-styles";
        iframeDoc.head.appendChild(iframeStyleTag);
      }

      iframeStyleTag.innerHTML = styles;
      console.log("Applied styles inside Storybook preview.");
    }
  };

  // Handle user input changes
  const handleChange = (variable, value) => {
    debugger
    const newTokens = { ...tokens, [variable]: value };
    setTokens(newTokens);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));

    // Apply new styles immediately
    applyTokens(newTokens);
  };

  // Reload CSS Variables manually
  const reloadVariables = () => {
    fetchCSSVariables();
  };

  return (
    <div style={{ padding: "10px" }}>
      {Object.keys(tokens).length > 0 ? (
        Object.keys(tokens).map((token) => (
          <div key={token} style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>{token}</label>
            <input
              type="text"
              value={tokens[token]}
              onChange={(e) => handleChange(token, e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        ))
      ) : (
        <p>No CSS Variables Found</p>
      )}
    </div>
  );
};

export default TokensPanel;



// import React, { useState, useEffect } from "react";

// const STORAGE_KEY = "storybook_css_tokens";

// const TokensPanel = () => {
//   const [tokens, setTokens] = useState(() => {
//     const savedTokens = localStorage.getItem(STORAGE_KEY);
//     return savedTokens ? JSON.parse(savedTokens) : {};
//   });

//   useEffect(() => {
//     let attempts = 0;
//     const interval = setInterval(() => {
//       if (attempts >= 5) {
//         clearInterval(interval);
//         console.warn("CSS variables could not be loaded after multiple attempts.");
//         return;
//       }
//       fetchCSSVariables();
//       attempts++;
//     }, 1000); // Retry every 1 second, up to 5 times
  
//     return () => clearInterval(interval);
//   }, []);
  

//   useEffect(() => {
//     applyTokens(tokens);
//   }, [tokens]);

//   // Fetch CSS Variables from loaded stylesheets
//   const fetchCSSVariables = () => {
//     const iframe = document.querySelector("#storybook-preview-iframe");
  
//     if (!iframe) {
//       console.warn("Storybook preview iframe not found!");
//       return;
//     }
  
//     const iframeDoc = iframe.contentWindow?.document;
//     if (!iframeDoc) {
//       console.warn("Storybook iframe document not accessible!");
//       return;
//     }
  
//     const rootStyle = getComputedStyle(iframeDoc.documentElement);
//     console.log("Storybook root styles detected:", rootStyle);
  
//     const vars = {};
//     for (let i = 0; i < rootStyle.length; i++) {
//       const name = rootStyle[i];
//       if (name.startsWith("--")) {
//         vars[name] = rootStyle.getPropertyValue(name).trim();
//       }
//     }
  
//     if (Object.keys(vars).length === 0) {
//       console.warn("No CSS variables found. Make sure your styles are loaded correctly.");
//     } else {
//       console.log("CSS Variables Found:", vars);
//     }
  
//     setTokens(vars); // Update panel state
//   };

//   const handleChange = (variable, value) => {
//     const newTokens = { ...tokens, [variable]: value };
//     setTokens(newTokens);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
  
//     // Apply changes immediately
//     applyTokens(newTokens);
//   };

//   // Apply Tokens to the document and iframe
//   const applyTokens = (tokens) => {
//     const iframe = document.querySelector("#storybook-preview-iframe");
//     if (iframe && iframe.contentWindow) {
//       const iframeDoc = iframe.contentWindow.document;
  
//       Object.entries(tokens).forEach(([variable, value]) => {
//         iframeDoc.documentElement.style.setProperty(variable, value);
//       });
  
//       console.log("Updated Storybook Preview with New Styles:", tokens);
//     }
//   };  

//   // Inject styles dynamically
//   const injectCustomStyles = (tokens) => {
//     const iframe = document.querySelector("#storybook-preview-iframe");
//     if (iframe && iframe.contentWindow) {
//       let styleTag = iframe.contentWindow.document.getElementById("dynamic-theme-styles");
  
//       if (!styleTag) {
//         styleTag = iframe.contentWindow.document.createElement("style");
//         styleTag.id = "dynamic-theme-styles";
//         iframe.contentWindow.document.head.appendChild(styleTag);
//       }
  
//       let styles = Object.entries(tokens)
//         .map(([variable, value]) => `${variable}: ${value} !important;`)
//         .join("; ");
  
//       styleTag.innerHTML = `:root { ${styles} }`;
//       console.log("Injected custom styles into Storybook Preview:", styles);
//     }
//   };
  
//   //Reload the variables manually
//   const reloadVariables = () => {
//     fetchCSSVariables();
//   };

//   return (
//     <div style={{ padding: "10px" }}>
//       <h3>CSS Variables</h3>
//       <button onClick={reloadVariables} style={{ marginBottom: "10px" }}>
//         Reload Variables
//       </button>
  
//       {Object.keys(tokens).length === 0 ? (
//         <p style={{ color: "red", fontWeight: "bold" }}>
//           No CSS Variables Found. Try reloading the iframe or checking styles.
//         </p>
//       ) : (
//         <div style={{ maxHeight: "300px", overflowY: "auto" }}>
//           {Object.entries(tokens).map(([token, value]) => (
//             <div key={token} style={{ marginBottom: "10px" }}>
//               <label style={{ display: "block", fontWeight: "bold" }}>
//                 {token}
//               </label>
//               <input
//                 type="text"
//                 value={value}
//                 onChange={(e) => handleChange(token, e.target.value)}
//                 style={{
//                   width: "100%",
//                   padding: "5px",
//                   border: "1px solid #ccc",
//                   borderRadius: "4px",
//                 }}
//               />
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );  
  
// };
// export default TokensPanel;



// import React, { useState, useEffect } from "react";

// const STORAGE_KEY = "storybook_css_tokens";

// const TokensPanel = () => {
//   const [tokens, setTokens] = useState(() => {
//     const savedTokens = localStorage.getItem(STORAGE_KEY);
//     return savedTokens ? JSON.parse(savedTokens) : {};
//   });

//   useEffect(() => {
//     fetchCSSVariables();
//   }, []);

//   useEffect(() => {
//     applyTokens(tokens);
//   }, [tokens]);

//   // Fetch CSS Variables from loaded stylesheets
//   const fetchCSSVariables = () => {
//     console.log("Fetching CSS Variables...");
//     setTimeout(() => {
//       const rootStyle = getComputedStyle(document.documentElement);
//       const vars = {};
//       for (let i = 0; i < rootStyle.length; i++) {
//         const name = rootStyle[i];
//         if (name.startsWith("--")) {
//           vars[name] = rootStyle.getPropertyValue(name).trim();
//         }
//       }
  
//       const savedTokens = localStorage.getItem(STORAGE_KEY);
//       console.log("CSS Variables Found:", vars);
//       setTokens(savedTokens ? JSON.parse(savedTokens) : vars);
//     }, 500); // Delay fetching variables
//   };

//   const handleChange = (variable, value) => {
//     const newTokens = { ...tokens, [variable]: value };
//     setTokens(newTokens);
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(newTokens));
  
//     // Apply new styles immediately
//     applyTokens(newTokens);
//   };

//   // Apply Tokens to the document
//   const applyTokens = (tokens) => {
//     Object.entries(tokens).forEach(([variable, value]) => {
//       document.documentElement.style.setProperty(variable, value);
//     });
  
//     // Force styles update inside Storybook’s iframe
//     const iframe = document.querySelector("#storybook-preview-iframe");
//     if (iframe) {
//       const iframeDoc = iframe.contentWindow.document;
//       Object.entries(tokens).forEach(([variable, value]) => {
//         iframeDoc.documentElement.style.setProperty(variable, value);
//       });
//     }
  
//     injectCustomStyles(tokens); // Ensure additional styles update
//   }; 

//   // Inject styles dynamically
//   const injectCustomStyles = (tokens) => {
//     let styleTag = document.getElementById("dynamic-theme-styles");
//     if (!styleTag) {
//       styleTag = document.createElement("style");
//       styleTag.id = "dynamic-theme-styles";
//       document.head.appendChild(styleTag);
//     }
  
//     let styles = Object.entries(tokens)
//       .map(([variable, value]) => `${variable}: ${value} !important;`)
//       .join("; ");
  
//     styleTag.innerHTML = `:root { ${styles} }`;
//   };

//   return (
//     <div style={{ padding: "10px" }}>
//       <h3>Update CSS Tokens</h3>
//       {Object.keys(tokens).map((token) => (
//         <div key={token} style={{ marginBottom: "10px" }}>
//           <label style={{ display: "block", marginBottom: "5px" }}>{token}</label>
//           <input
//             type="text"
//             value={tokens[token]}
//             onChange={(e) => handleChange(token, e.target.value)}
//             style={{ width: "100%" }}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// export default TokensPanel;
