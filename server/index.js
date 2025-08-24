// /server/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import archiver from "archiver";
import { convertDesign, convertPrompt, geminiSupport, prepareExport } from "./gemini.js";

dotenv.config();

const app = express();

// Store the latest generated code
let latestGeneratedCode = null;

// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(morgan("dev"));

// Root route
app.get("/", (req, res) => {
  res.send("✅ TachTex AI Backend Server is running...");
});

// Test Gemini route
app.get("/api/test", async (req, res) => {
  try {
    const prompt = "Generate a React button using TailwindCSS that says Login";
    const result = await convertPrompt(prompt);
    res.json({ success: true, output: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Main conversion route
app.post("/api/convert", async (req, res) => {
  try {
    const designJson = req.body;
    if (!designJson || typeof designJson !== "object") {
      return res.status(400).json({ success: false, error: "Design JSON is required" });
    }

    const result = await convertDesign(designJson);
    // Store the latest generated code for export
    latestGeneratedCode = result;
    res.json({ success: true, output: result });
  } catch (error) {
    console.error("❌ Gemini API error in /api/convert:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Support route
app.post("/api/support", async (req, res) => {
  try {
    const { query, designContext } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    const prompt = `User query: ${query}
    ${designContext ? `Design context: ${JSON.stringify(designContext)}` : ''}`;

    const response = await geminiSupport(prompt);
    res.json({ success: true, response });
  } catch (error) {
    console.error("❌ Gemini API error in /api/support:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export code as ZIP
app.get("/api/export", async (req, res) => {
  try {
    if (!latestGeneratedCode) {
      return res.status(400).json({ error: "No code has been generated yet. Please convert a design first." });
    }

    // Prepare the code for export
    const codeToExport = await prepareExport(latestGeneratedCode);
    
    res.attachment('generated-code.zip');
    
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });
    
    archive.pipe(res);
    
    // Add React + Tailwind code
    if (codeToExport.react_tailwind) {
      archive.append(codeToExport.react_tailwind, { name: 'react-tailwind/component.jsx' });
    }
    
    // Add Vue code
    if (codeToExport.vue) {
      archive.append(codeToExport.vue, { name: 'vue/component.vue' });
    }
    
    // Add Svelte code
    if (codeToExport.svelte) {
      archive.append(codeToExport.svelte, { name: 'svelte/component.svelte' });
    }
    
    // Add Angular code
    if (codeToExport.angular) {
      archive.append(codeToExport.angular, { name: 'angular/component.ts' });
    }
    
    // Add Flutter code
    if (codeToExport.flutter) {
      archive.append(codeToExport.flutter, { name: 'flutter/widget.dart' });
    }
    
    // Add a README
    const readme = `# Generated Components
This ZIP contains components generated from your design in multiple frameworks:

- React + Tailwind: /react-tailwind/component.jsx
- Vue: /vue/component.vue
- Svelte: /svelte/component.svelte
- Angular: /angular/component.ts
- Flutter: /flutter/widget.dart

Generated on: ${new Date().toISOString()}
`;
    
    archive.append(readme, { name: 'README.md' });
    
    archive.finalize();
  } catch (error) {
    console.error("❌ Error in /api/export:", error);
    res.status(500).json({ error: error.message });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 TachTex AI Server started on http://localhost:${PORT}`);
});

