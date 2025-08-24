import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

console.log("Gemini Key:", process.env.GEMINI_API_KEY);


// Check if GEMINI_API_KEY exists in .env file
// If undefined, it means either:
// 1. .env file is missing
// 2. GEMINI_API_KEY is not set in .env
// 3. dotenv failed to load the .env file
console.log('Loading environment variables...');
const API_KEY = process.env.GEMINI_API_KEY || '';
if (!API_KEY) {
  console.log('Environment variables loaded:', process.env);
  console.log('Current working directory:', process.cwd());
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('.env file contents:', envContent);
  } catch (err) {
    console.log('.env file read error:', err);
  }
}
console.log('Current GEMINI_API_KEY value:', process.env.GEMINI_API_KEY);

// Validate environment setup
if (!API_KEY) {
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    throw new Error("❌ .env file not found in project root");
  }
  
  console.error("Environment Setup Error:");
  console.error("- GEMINI_API_KEY is undefined");
  console.error("- Make sure you have created a .env file in the project root");
  console.error("- Ensure .env file contains: GEMINI_API_KEY=your_api_key_here");
  console.error("- Verify that dotenv is properly loading the .env file");
  throw new Error("GEMINI_API_KEY is not properly configured");
}

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Use the latest Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello from Gemini!");
    const response = await result.response.text();
    console.log("✅ Gemini Response:", response);
  } catch (err) {
    console.error("❌ Error:", err.message);
    throw err;
  }
}

// Execute the function and handle any unhandled promise rejections
run().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
