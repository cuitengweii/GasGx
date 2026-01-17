@echo off
echo ==========================================
echo       GasGx Website - One Click Update
echo ==========================================
echo.

:: 1. Scan for changes
echo [1/3] Scanning for new files...
git add .

:: 2. Ask for a note (Optional)
set /p msg="Enter update note (Press Enter for default): "
if "%msg%"=="" set msg="Auto Update by Gemini"

:: 3. Save version
echo [2/3] Saving version...
git commit -m "%msg%"

:: 4. Upload to GitHub
echo [3/3] Uploading to GitHub (main branch)...
git push origin main

echo.
echo ==========================================
echo       SUCCESS! Your website is live.
echo ==========================================
pause