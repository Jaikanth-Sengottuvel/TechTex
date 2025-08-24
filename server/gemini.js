// gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  throw new Error("❌ GEMINI_API_KEY is missing. Please check your .env file.");
}

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use gemini-1.5-flash model (latest stable version)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to generate content
export async function runGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    throw error;
  }
}

// Function to convert a text prompt to code
export async function convertPrompt(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const code = await result.response.text();
    return { code };
  } catch (error) {
    console.error("❌ Gemini API Error in convertPrompt:", error);
    throw error;
  }
}

// Function to convert design JSON to code in multiple frameworks
export async function convertDesign(designJson) {
  try {
    const prompt = `
    You are a design-to-code generator. 
    Convert the following design JSON into production-ready components in multiple frameworks: 
    - React (with TailwindCSS) 
    - Vue 3 
    - Svelte 
    - Angular 
    - Flutter 
    
    Requirements: 
    1. Components must be reusable with props (size, variant, text). 
    2. Add responsive layouts for mobile, tablet, desktop. 
    3. Use a clean folder structure (/components, /pages). 
    4. Return the result in JSON with separate keys: 
    { react_tailwind, vue, svelte, angular, flutter }
    
    Design JSON: ${JSON.stringify(designJson)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    try {
      // Try to parse the response as JSON
      return JSON.parse(response);
    } catch (parseError) {
      // If parsing fails, return a structured response with the raw text
      console.warn("Failed to parse Gemini response as JSON, returning raw text");
      return {
        react_tailwind: response,
        vue: "Error: Could not generate Vue code",
        svelte: "Error: Could not generate Svelte code",
        angular: "Error: Could not generate Angular code",
        flutter: "Error: Could not generate Flutter code"
      };
    }
  } catch (error) {
    console.error("❌ Gemini API Error in convertDesign:", error);
    throw error;
  }
}

// Support function for AI chat
export async function geminiSupport(prompt, maxRetries = 2) {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      // Use a specific prompt format for the support endpoint
      const formattedPrompt = `
      You are an AI assistant inside a design tool.
      Tasks: fix alignment issues, suggest code improvements, generate docs, add accessibility fixes.
      Use the design context if provided.
      
      ${prompt}
      `;

      const result = await model.generateContent(formattedPrompt);
      return await result.response.text();
    } catch (error) {
      retries++;
      console.error(`❌ Gemini API Error in geminiSupport (attempt ${retries}/${maxRetries + 1}):`, error);

      if (retries > maxRetries) {
        throw new Error(`Failed after ${maxRetries + 1} attempts: ${error.message}`);
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }
}

// Function to handle export requests
export async function prepareExport(generatedCode) {
  // This function can be used to prepare code for export
  // It's called from the /api/export endpoint

  if (!generatedCode) {
    throw new Error("No generated code provided for export");
  }

  // You could add additional processing here if needed
  return generatedCode;
}
