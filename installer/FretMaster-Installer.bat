@echo off
title FretMaster - Interactive Guitar Coach
color 0A
mode con: cols=60 lines=30

echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                                                           ║
echo  ║   🎸 FretMaster - Interactive Guitar Coach               ║
echo  ║   Version 1.0.0                                          ║
echo  ║                                                           ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo.
    echo After installing Node.js, run this installer again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version
echo.

REM Set installation directory
set "INSTALL_DIR=%LOCALAPPDATA%\FretMaster"
set "SOURCE_DIR=%~dp0"

echo Installing FretMaster to: %INSTALL_DIR%
echo.

REM Create installation directory
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo [OK] Created installation directory
)

REM Copy application files
echo Copying application files...
xcopy "%SOURCE_DIR%index.html" "%INSTALL_DIR%\" /Y >nul 2>nul
xcopy "%SOURCE_DIR%styles.css" "%INSTALL_DIR%\" /Y >nul 2>nul
xcopy "%SOURCE_DIR%server.js" "%INSTALL_DIR%\" /Y >nul 2>nul
xcopy "%SOURCE_DIR%fretmaster-windows.zip" "%INSTALL_DIR%\" /Y >nul 2>nul
xcopy "%SOURCE_DIR%fretmaster-android.zip" "%INSTALL_DIR%\" /Y >nul 2>nul
echo [OK] Copied application files

REM Create launcher batch file
(
echo @echo off
echo title FretMaster - Interactive Guitar Coach
echo color 0A
echo cd /d "%%~dp0"
echo node server.js
echo pause
) > "%INSTALL_DIR%\FretMaster.bat"
echo [OK] Created launcher

REM Create Start Menu shortcut
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs\FretMaster"
if not exist "%START_MENU%" mkdir "%START_MENU%"

echo Set WshShell = CreateObject^("WScript.Shell"^) > "%TEMP%\shortcut.vbs"
echo Set shortcut = WshShell.CreateShortcut^("%START_MENU%\FretMaster.lnk"^) >> "%TEMP%\shortcut.vbs"
echo shortcut.TargetPath = "%INSTALL_DIR%\FretMaster.bat" >> "%TEMP%\shortcut.vbs"
echo shortcut.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\shortcut.vbs"
echo shortcut.Description = "Interactive Guitar Coach" >> "%TEMP%\shortcut.vbs"
echo shortcut.IconLocation = "%INSTALL_DIR%\FretMaster.bat,0" >> "%TEMP%\shortcut.vbs"
echo shortcut.Save >> "%TEMP%\shortcut.vbs"
cscript //nologo "%TEMP%\shortcut.vbs" >nul 2>nul
del "%TEMP%\shortcut.vbs" >nul 2>nul
echo [OK] Created Start Menu shortcut

REM Create Desktop shortcut
echo Set WshShell = CreateObject^("WScript.Shell"^) > "%TEMP%\shortcut2.vbs"
echo Set shortcut = WshShell.CreateShortcut^("%USERPROFILE%\Desktop\FretMaster.lnk"^) >> "%TEMP%\shortcut2.vbs"
echo shortcut.TargetPath = "%INSTALL_DIR%\FretMaster.bat" >> "%TEMP%\shortcut2.vbs"
echo shortcut.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\shortcut2.vbs"
echo shortcut.Description = "Interactive Guitar Coach" >> "%TEMP%\shortcut2.vbs"
echo shortcut.IconLocation = "%INSTALL_DIR%\FretMaster.bat,0" >> "%TEMP%\shortcut2.vbs"
echo shortcut.Save >> "%TEMP%\shortcut2.vbs"
cscript //nologo "%TEMP%\shortcut2.vbs" >nul 2>nul
del "%TEMP%\shortcut2.vbs" >nul 2>nul
echo [OK] Created Desktop shortcut

REM Create uninstaller
(
echo @echo off
echo title FretMaster Uninstaller
echo color 0C
echo echo.
echo echo  Uninstalling FretMaster...
echo echo.
echo rmdir /S /Q "%INSTALL_DIR%"
echo rmdir /S /Q "%START_MENU%"
echo del "%USERPROFILE%\Desktop\FretMaster.lnk" 2^>nul
echo reg delete "HKCU\Software\FretMaster" /f 2^>nul
echo echo.
echo echo  FretMaster has been uninstalled.
echo echo.
echo pause
) > "%INSTALL_DIR%\Uninstall.bat"
echo [OK] Created uninstaller

REM Add registry entries
reg add "HKCU\Software\FretMaster" /v "InstallPath" /t REG_SZ /d "%INSTALL_DIR%" /f >nul 2>nul
reg add "HKCU\Software\FretMaster" /v "Version" /t REG_SZ /d "1.0.0" /f >nul 2>nul
echo [OK] Added registry entries

echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                    INSTALLATION COMPLETE!                ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.
echo  FretMaster has been installed to:
echo  %INSTALL_DIR%
echo.
echo  You can now launch the app from:
echo    - Desktop shortcut
echo    - Start Menu ^> FretMaster
echo.
echo  Would you like to launch FretMaster now? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    echo.
    echo Starting FretMaster...
    start "" "%INSTALL_DIR%\FretMaster.bat"
)
echo.
pause