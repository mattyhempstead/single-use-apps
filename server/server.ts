import autoprefixer from "autoprefixer";
import esbuild from "esbuild";
import express from "express";
import fs from "fs/promises";
// import fetch from "node-fetch";
import path from "path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";

const app = express();
const port = 3001;

// Serve static files (like index.html) from the public directory
// app.use(express.static(path.join(__dirname, "public")));

async function getProject(projectId: string): Promise<string> {
  const response = await fetch(
    `http://localhost:3000/api/renderServer/getProject?projectId=${projectId}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }
  const data = await response.json();
  return data.sourceCode;
}

async function getProjectReactAppCode(projectId: string): Promise<string> {
  const sourceCode = await getProject(projectId);
  return `${sourceCode}

import { renderApp } from "./root";
renderApp(App);`;
}

// Add this near the top of your file
import tailwindConfig from "./tailwind.config.js";

// Route for bundling index.tsx and Tailwind CSS on-the-fly when requested
app.get("/app/:projectId/bundle.js", async (req, res) => {
  const projectId = req.params.projectId;
  console.log(`Requested bundle.js for project ${projectId}`);
  try {
    const reactAppCode = await getProjectReactAppCode(projectId);
    // Use esbuild to bundle the provided code string (JSX + Tailwind CSS)
    const result = await esbuild.build({
      stdin: {
        contents: reactAppCode,
        resolveDir: path.resolve(__dirname, "src"),
        sourcefile: "index.tsx",
        loader: "tsx",
      },
      bundle: true,
      write: false,
      loader: { ".ts": "ts", ".tsx": "tsx" },
      format: "esm",
      sourcemap: true,
      minify: true,
      platform: "browser",
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
app.get("/app/:projectId/bundle.css", async (req, res) => {
  const projectId = req.params.projectId;
  console.log(`Requested bundle.css for project ${projectId}`);
  try {
    // Read the globals.css file
    const globalsCss = await fs.readFile(
      path.join(__dirname, "src", "globals.css"),
      "utf8",
    );

    const reactAppCode = await getProjectReactAppCode(projectId);

    // Process the globals.css using PostCSS and dynamically scan React content
    const result = await postcss([
      tailwindcss({
        ...tailwindConfig,
        content: [
          ...tailwindConfig.content,
          { raw: reactAppCode, extension: "tsx" },
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

// Serve the index.html file on the app route
app.get("/app/:projectId/index.html", (req, res) => {
  const projectId = req.params.projectId;
  console.log(`Requested index.html for project ${projectId}`);
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
