# TechTex AI Tools - Server

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the server directory with the following content:

```env
# Gemini API Configuration
# Get your API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration (optional, defaults to 5000)
PORT=5000
```

### 3. Start the Server
```bash
npm start
```

The server will start on http://localhost:5000

## API Endpoints

- `GET /` - Health check
- `GET /api/test` - Test Gemini API
- `POST /api/convert` - Convert design to code
- `POST /api/support` - AI support chat
- `GET /api/export` - Export generated code as ZIP

## Troubleshooting

If you get a "models/gemini-flash is not found" error:
1. Make sure you have a valid Gemini API key
2. The model name has been updated to "gemini-1.5-flash"
3. Check that your API key has access to the Gemini API 