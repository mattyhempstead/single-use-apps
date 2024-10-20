const express = require("express");
const path = require("path");
const esbuild = require("esbuild");

const app = express();
const port = 3000;

// Serve static files (like index.html) from the public directory
app.use(express.static(path.join(__dirname, "public")));

// String containing the code you want to bundle
const reactAppCode =
  `
import { format } from "https://cdn.skypack.dev/date-fns";
import React, { useEffect, useState } from "react";

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
      <button 
        onClick={cycleFormat}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Change Date Format
      </button>
    </div>
  );
};
` +
  `
import { renderApp } from "./root";
renderApp(App);
`;

// Route for bundling index.tsx on-the-fly when requested
app.get("/bundle.js", async (req, res) => {
  console.log("bundling!!");
  try {
    // Use esbuild to bundle the provided code string
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

// Serve the index.html file on the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
