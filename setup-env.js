#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("🔧 Setting up environment file for DeepSeek Chat App\n");

const backendDir = path.join(__dirname, "backend");
const envExamplePath = path.join(backendDir, "env.example");
const envPath = path.join(backendDir, ".env");

// Check if backend directory exists
if (!fs.existsSync(backendDir)) {
  console.error("❌ Backend directory not found!");
  console.log("Please run this script from the project root directory.");
  process.exit(1);
}

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log("✅ .env file already exists in backend directory");
  console.log("📍 Location:", envPath);

  // Check if it has the required key
  const envContent = fs.readFileSync(envPath, "utf8");
  if (
    envContent.includes("DEEPSEEK_API_KEY=") &&
    !envContent.includes("your_deepseek_api_key_here")
  ) {
    console.log("✅ DEEPSEEK_API_KEY appears to be configured");
  } else {
    console.log("⚠️  Please make sure to add your actual DeepSeek API key to:");
    console.log("   DEEPSEEK_API_KEY=your_actual_api_key_here");
  }
} else {
  // Copy env.example to .env
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("✅ Created .env file from template");
    console.log("📍 Location:", envPath);
    console.log(
      "\n📝 IMPORTANT: Edit the .env file and add your DeepSeek API key:"
    );
    console.log("   DEEPSEEK_API_KEY=your_actual_api_key_here");
  } else {
    // Create basic .env file
    const envContent = `# DeepSeek API Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
`;
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Created .env file");
    console.log("📍 Location:", envPath);
    console.log(
      "\n📝 IMPORTANT: Edit the .env file and add your DeepSeek API key:"
    );
    console.log("   DEEPSEEK_API_KEY=your_actual_api_key_here");
  }
}

console.log("\n🚀 Next steps:");
console.log("1. Edit backend/.env and add your DeepSeek API key");
console.log("2. Run: npm run install:backend");
console.log("3. Run: npm run dev:backend");
console.log("\n💡 Tip: Your .env file should look like:");
console.log("   DEEPSEEK_API_KEY=sk-1234567890abcdef...");
