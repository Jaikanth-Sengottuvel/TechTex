# 🚀 TachTex Design Tool - AI Integration Guide

## ✅ **Integration Complete!**

Your TachTex Design Tool now has **professional AI capabilities** integrated with all existing design tools!

## 🔧 **Setup Instructions:**

### 1. **Get Your Gemini API Key**
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy the key

### 2. **Configure the AI Server**
```bash
# Navigate to server directory
cd server

# Rename env.txt to .env
ren env.txt .env

# Edit .env file and add your API key
GEMINI_API_KEY=your_actual_api_key_here
PORT=5000
NODE_ENV=development
```

### 3. **Start Both Servers**

**Option A: Use the Batch Script**
```bash
# Double-click start-servers.bat
# This will start both servers automatically
```

**Option B: Manual Start**
```bash
# Terminal 1 - AI Server
cd server
npm start

# Terminal 2 - Design Tool
npm run dev
```

## 🌟 **New AI Features Available:**

### **🤖 AI Assistant (Purple Button)**
- **Real-time AI chat** for design help
- **Context-aware** - knows your canvas elements
- **Design suggestions** and improvements
- **Code generation** help

### **💻 Design to Code (Green Button)**
- **Multi-framework conversion**: React, Vue, Svelte, Angular, Flutter
- **Real-time code generation** using Gemini AI
- **Code preview** with syntax highlighting
- **Individual file download** for each framework
- **ZIP export** of all generated code

## 🎯 **How to Use:**

### **Step 1: Create a Design**
1. Use the **existing design tools** (shapes, text, images, etc.)
2. **Draw elements** on the canvas
3. **Arrange and style** your design

### **Step 2: Get AI Help**
1. **Click the purple AI button** (bottom-right)
2. **Ask questions** like:
   - "How can I improve this layout?"
   - "Suggest a better color scheme"
   - "Generate code for this button"

### **Step 3: Convert to Code**
1. **Click the green D2C button** (bottom-right)
2. **Click "Convert"** to generate code
3. **Switch between frameworks** using tabs
4. **Copy code** or **download files**
5. **Export all** as a ZIP file

## 🔗 **API Endpoints Available:**

- `GET /` - Server health check
- `GET /api/test` - Test Gemini API
- `POST /api/convert` - Convert design to code
- `POST /api/support` - AI support chat
- `GET /api/export` - Export code as ZIP

## 🚨 **Troubleshooting:**

### **Server Not Starting?**
```bash
# Check if ports are available
netstat -ano | findstr :5000
netstat -ano | findstr :8080

# Kill processes if needed
taskkill /PID <process_id> /F
```

### **API Key Issues?**
- Ensure `.env` file exists in `/server/` directory
- Verify API key is correct and active
- Check Google AI Studio for quota limits

### **Frontend Not Loading?**
- Ensure both servers are running
- Check browser console for errors
- Verify ports 5000 and 8080 are accessible

## 📁 **File Structure:**
```
techtex/layout-creato/
├── server/                    ← AI Backend
│   ├── gemini.js            ← Gemini AI integration
│   ├── index.js             ← Express server
│   ├── package.json         ← Server dependencies
│   ├── .env                 ← API keys (create this)
│   └── env.txt              ← Template file
├── src/components/design-tool/tools/
│   ├── AIAssistant.tsx      ← AI chat interface
│   ├── D2CTool.tsx          ← Design to Code converter
│   └── ... (existing tools)
├── start-servers.bat         ← Easy startup script
└── AI_INTEGRATION_GUIDE.md  ← This file
```

## 🎉 **You're All Set!**

Your TachTex Design Tool now has:
- ✅ **AI-Powered Design Assistance**
- ✅ **Multi-Framework Code Generation**
- ✅ **Real-Time AI Chat Support**
- ✅ **Professional Export Capabilities**
- ✅ **Seamless Integration** with existing tools

**Start designing and let AI help you create amazing things!** 🚀✨
