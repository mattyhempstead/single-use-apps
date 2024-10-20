const express = require("express");
const path = require("path");
const esbuild = require("esbuild");

const app = express();
const port = 3000;

// Serve static files (like index.html) from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Route for bundling index.jsx on-the-fly when requested
app.get("/bundle.js", async (req, res) => {
  console.log("bundling!");
  try {
    // Use esbuild to bundle index.jsx when requested
    const result = await esbuild.build({
      entryPoints: ["src/index.jsx"], // The React app entry file
      bundle: true, // Bundle everything
      write: false, // Don't write to file system, we'll return the bundle as a response
      loader: { ".js": "jsx" }, // Handle JSX files
      // external: ["https://cdn.skypack.dev/date-fns"], // Keep date-fns as an external dependency
      format: "esm", // Output as ES modules
      sourcemap: true, // Optional: Generate sourcemaps for debugging
      minify: true, // Minify the bundle
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
