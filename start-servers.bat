@echo off
echo Starting TachTex AI Server...
start "AI Server" cmd /k "cd server && npm start"

echo Starting TachTex Design Tool...
start "Design Tool" cmd /k "npm run dev"

echo Both servers are starting...
echo AI Server will be on http://localhost:5000
echo Design Tool will be on http://localhost:8080
pause
