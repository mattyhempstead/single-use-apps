const express = require("express");
const path = require("path");
const esbuild = require("esbuild");

const app = express();
const port = 3000;

// Serve static files (like index.html) from the public directory
app.use(express.static(path.join(__dirname, "public")));

// String containing the code you want to bundle
const reactAppCode = `
import { format } from "https://cdn.skypack.dev/date-fns";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  const [formattedDate, setFormattedDate] = useState("");
  const [formatIndex, setFormatIndex] = useState(0);
  const dateFormats = ["MMMM do, yyyy", "yyyy-MM-dd", "dd/MM/yyyy"];

  useEffect(() => {
    updateFormattedDate();
  }, [formatIndex]);

  const updateFormattedDate = () => {
    const date = new Date();
    const formatted = format(date, dateFormats[formatIndex]);
    setFormattedDate(formatted);
  };

  const cycleFormat = () => {
    setFormatIndex((prevIndex) => (prevIndex + 1) % dateFormats.length);
  };

  return (
    <div>
      <h1>Date-fns in React with ES Modules!</h1>
      <div id="result">Today's date is {formattedDate}</div>
      <button onClick={cycleFormat}>Change Date Format</button>
    </div>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
`;

// Route for bundling index.jsx on-the-fly when requested
app.get("/bundle.js", async (req, res) => {
  console.log("bundling!!");
  try {
    // Use esbuild to bundle the provided code string
    const result = await esbuild.build({
      stdin: {
        contents: reactAppCode, // The provided React app code as a string
        resolveDir: path.resolve(__dirname, "src"), // Resolve relative imports from 'src'
        sourcefile: "index.jsx", // Virtual filename for the in-memory build
        loader: "jsx", // Loader for JSX
      },
      bundle: true, // Bundle everything
      write: false, // Don't write to the file system, return the output in-memory
      loader: { ".js": "jsx" }, // Handle JSX files
      // external: ["react", "react-dom"], // Externalize React dependencies to be fetched from node_modules
      format: "esm", // Output as ES modules
      sourcemap: true, // Optional: Generate sourcemaps for debugging
      minify: true, // Minify the bundle
      platform: "browser", // Target the browser platform
    });

    // Set content type to JavaScript
    res.setHeader("Content-Type", "application/javascript");

    // Send the bundled JavaScript to the client
    res.send(result.outputFiles[0].text);
  } catch (error) {
    console.error("Error during build:", error);
    res.status(500).send("Error bundling the app.");
  }
});

// Serve the index.html file on the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
