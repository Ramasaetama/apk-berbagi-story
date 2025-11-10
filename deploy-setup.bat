@echo off
echo.
echo ========================================
echo    DEPLOYMENT SETUP - GITHUB PAGES
echo ========================================
echo.
echo Langkah yang akan dilakukan:
echo 1. Initialize Git repository
echo 2. Add dan commit semua file
echo 3. Setup remote origin
echo 4. Push ke GitHub
echo.
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git tidak terinstall!
    echo Silakan install Git terlebih dahulu dari: https://git-scm.com/
    echo.
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
git init
if %ERRORLEVEL% NEQ 0 (
    echo Git repository sudah ada.
)

echo.
echo [2/5] Adding all files...
git add .

echo.
echo [3/5] Creating commit...
git commit -m "Initial commit: PWA Berbagi Story - Dicoding Submission"

echo.
echo [4/5] Setting main branch...
git branch -M main

echo.
echo ========================================
echo.
echo PENTING! Sekarang Anda perlu:
echo.
echo 1. Buka: https://github.com/new
echo 2. Buat repository baru (PUBLIC)
echo 3. Copy URL repository-nya
echo.
set /p REPO_URL="Paste URL repository (contoh: https://github.com/username/repo-name.git): "
echo.

if "%REPO_URL%"=="" (
    echo ERROR: URL repository tidak boleh kosong!
    pause
    exit /b 1
)

echo [5/5] Adding remote origin...
git remote add origin %REPO_URL% 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Remote origin sudah ada, updating...
    git remote set-url origin %REPO_URL%
)

echo.
echo ========================================
echo.
echo Siap untuk push! Tekan Enter untuk melanjutkan...
pause >nul

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo.
if %ERRORLEVEL% EQU 0 (
    echo ✓ SUCCESS! Code berhasil di-push ke GitHub!
    echo.
    echo Langkah selanjutnya:
    echo 1. Buka repository di GitHub
    echo 2. Settings → Pages → Source: GitHub Actions
    echo 3. Tunggu workflow selesai di tab Actions
    echo 4. Akses website di: https://username.github.io/repo-name/
    echo.
    echo JANGAN LUPA:
    echo - Update 'base' di vite.config.js dengan nama repo
    echo - Update STUDENT.txt dengan URL deployment
) else (
    echo ✗ ERROR: Push gagal!
    echo.
    echo Kemungkinan masalah:
    echo - URL repository salah
    echo - Belum login ke Git (git config user.name dan user.email)
    echo - Tidak punya akses ke repository
    echo.
    echo Coba push manual:
    echo   git push -u origin main
)

echo.
echo ========================================
echo.
pause
