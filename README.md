# TechTex AI Tools

A comprehensive AI-powered design-to-code conversion tool with AI support features.

## Project Structure

```
features/
├── client/          # React frontend application
├── server/          # Node.js backend API server
└── README.md        # This file
```

## Quick Start

### 1. Backend Setup
```bash
cd server
npm install
# Create .env file with your GEMINI_API_KEY
npm start
```

### 2. Frontend Setup
```bash
cd client
npm install
npm start
```

## Features

- **Design to Code Converter**: Convert design specifications to production-ready code in multiple frameworks:
  - React + TailwindCSS
  - Vue 3
  - Svelte
  - Angular
  - Flutter

- **AI Support**: Get intelligent assistance for design and code questions

- **Code Export**: Download generated code as organized ZIP files

## API Endpoints

- `GET /` - Health check
- `GET /api/test` - Test Gemini API
- `POST /api/convert` - Convert design to code
- `POST /api/support` - AI support chat
- `GET /api/export` - Export generated code

## Environment Variables

Create a `.env` file in the server directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

## Technologies Used

- **Backend**: Node.js, Express, Google Generative AI (Gemini)
- **Frontend**: React, TailwindCSS
- **AI**: Google Gemini 1.5 Flash model

## Troubleshooting

### Common Issues

1. **"models/gemini-flash is not found" error**
   - Solution: The model name has been updated to "gemini-1.5-flash"
   - Ensure you have a valid Gemini API key

2. **Port conflicts**
   - Backend runs on port 5000
   - Frontend runs on port 3000
   - Check that these ports are available

3. **API connection errors**
   - Ensure the backend server is running
   - Check that the proxy configuration in client/package.json points to the correct backend URL

## Getting Help

If you encounter issues:
1. Check the server and client README files
2. Verify your Gemini API key is valid
3. Ensure all dependencies are installed
4. Check the console for error messages 