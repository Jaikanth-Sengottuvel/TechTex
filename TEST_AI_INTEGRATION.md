# 🧪 Test Your AI Integration

## ✅ **Step-by-Step Testing Guide**

### **1. Verify Frontend is Running**
- ✅ Development server: http://localhost:8080/
- ✅ Open in browser and check for errors

### **2. Test AI Components**
- ✅ **Purple AI Button** should appear (bottom-right)
- ✅ **Green D2C Button** should appear (bottom-right)
- ✅ Click buttons to open AI tools

### **3. Test AI Server (After Setup)**
```bash
# Terminal 1: Start AI Server
cd server
npm start

# Should see: "🚀 TachTex AI Server started on http://localhost:5000"
```

### **4. Test API Endpoints**
```bash
# Test server health
curl http://localhost:5000/

# Test Gemini API (requires API key)
curl http://localhost:5000/api/test
```

### **5. Test AI Features**
1. **Create a simple design** on canvas
2. **Click purple AI button** → Ask a question
3. **Click green D2C button** → Convert design to code

## 🚨 **Common Issues & Solutions**

### **Frontend Errors:**
- Check browser console for import errors
- Verify all components are properly imported
- Check if Tabs component exists

### **AI Server Errors:**
- Ensure `.env` file exists with API key
- Check if port 5000 is available
- Verify all dependencies are installed

### **API Connection Errors:**
- Check if AI server is running on port 5000
- Verify CORS is enabled
- Check network requests in browser dev tools

## 🎯 **Expected Behavior:**

### **AI Assistant (Purple Button):**
- Opens chat interface
- Shows design context
- Connects to Gemini API (when configured)

### **Design to Code (Green Button):**
- Shows canvas element count
- Generates code in multiple frameworks
- Provides copy/download options

## 🔧 **Quick Fix Commands:**

```bash
# Kill processes on ports
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

netstat -ano | findstr :8080
taskkill /PID <process_id> /F

# Restart servers
cd server && npm start
cd .. && npm run dev
```

## 📱 **Test URLs:**
- **Frontend**: http://localhost:8080/
- **AI Server**: http://localhost:5000/
- **API Test**: http://localhost:5000/api/test

**Your AI integration should now be fully functional!** 🚀✨
