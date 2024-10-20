const express = require("express");
const path = require("path");
const esbuild = require("esbuild");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const fs = require("fs").promises;

const app = express();
const port = 3000;

// Serve static files (like index.html) from the public directory
app.use(express.static(path.join(__dirname, "public")));

// String containing the React code you want to bundle
const reactAppCode = `
import { format } from "https://cdn.skypack.dev/date-fns";
import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";

const App: React.FC = () => {
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [formatIndex, setFormatIndex] = useState<number>(0);
  const dateFormats: string[] = ["MMMM do, yyyy", "yyyy-MM-dd", "dd/MM/yyyy"];

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Date-fns in React with ES Modules!</h1>
      <div id="result" className="text-xl mb-4">Today's date is {formattedDate}</div>
      <Button 
        onClick={cycleFormat}
      >
        Change Date Format
      </Button>
    </div>
  );
};

import { renderApp } from "./root";
renderApp(App);
`;

// Add this near the top of your file
const tailwindConfig = require("./tailwind.config.js");

// Route for bundling index.tsx and Tailwind CSS on-the-fly when requested
app.get("/bundle.js", async (req, res) => {
  try {
    // Use esbuild to bundle the provided code string (JSX + Tailwind CSS)
    const result = await esbuild.build({
      stdin: {
        contents: reactAppCode, // The provided React app code as a string
        resolveDir: path.resolve(__dirname, "src"), // Resolve relative imports from 'src'
        sourcefile: "index.tsx", // Virtual filename for the in-memory build
        loader: "tsx", // Loader for TypeScript JSX (TSX)
      },
      bundle: true, // Bundle everything
      write: false, // Don't write to the file system, return the output in-memory
      loader: { ".ts": "ts", ".tsx": "tsx" }, // Handle TypeScript and TSX files
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

// Update the "/bundle.css" route
app.get("/bundle.css", async (req, res) => {
  try {
    // Read the globals.css file
    const globalsCss = await fs.readFile(
      path.join(__dirname, "src", "globals.css"),
      "utf8",
    );

    // Process the globals.css using PostCSS and dynamically scan React content
    const result = await postcss([
      tailwindcss({
        ...tailwindConfig, // Spread your Tailwind config here
        content: [
          ...tailwindConfig.content, // Spread the existing content from tailwind config
          { raw: reactAppCode, extension: "tsx" },
          // Add any other content sources from your tailwind.config.js here
        ],
      }),
      autoprefixer,
    ])
      .process(globalsCss, { from: path.join(__dirname, "src", "globals.css") })
      .then((result) => result.css);

    // Set content type to CSS
    res.setHeader("Content-Type", "text/css");

    // Send the processed CSS to the client
    res.send(result);
  } catch (error) {
    console.error("Error during CSS processing:", error);
    res.status(500).send("Error processing CSS.");
  }
});

// Serve the index.html file on the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
