@echo off
title Deploy Readora to GitHub (hars7itIT/Readora)
cd /d "%~dp0"

echo ========================================================
echo    Deploying Readora to GitHub: hars7itIT/Readora
echo    Team: Techno-Squard ^| Leader: Aryan khanna
echo ========================================================
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your system PATH!
    echo Please install Git from https://git-scm.com/download/win
    echo After installing, double-click this script again.
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
if not exist ".git" (
    git init
)

echo [2/5] Configuring Remote origin...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/hars7itIT/Readora.git

echo [3/5] Staging project files...
git add .

echo [4/5] Committing changes...
git commit -m "feat: complete Readora application, PS-003 solution and interactive presentation deck"

echo [5/5] Pushing to main branch on GitHub...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Readora successfully deployed to GitHub!
    echo  URL: https://github.com/hars7itIT/Readora
    echo ========================================================
) else (
    echo.
    echo [NOTE] If GitHub asked for authentication:
    echo 1. Enter your GitHub Username: hars7itIT
    echo 2. For Password, enter your GitHub Personal Access Token (PAT)
    echo    (Create one at: https://github.com/settings/tokens)
)

echo.
pause
