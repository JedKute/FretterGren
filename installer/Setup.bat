@echo off
title FretMaster Installer
color 0A

echo ==================================================
echo   FretMaster - Interactive Guitar Coach
echo   Installer v1.0.0
echo ==================================================
echo.

REM Check for admin privileges
net session >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [INFO] Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

REM Set installation directory
set "INSTALL_DIR=%LOCALAPPDATA%\FretMaster"
set "SOURCE_DIR=%~dp0app"
set "START_MENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs\FretMaster"
set "DESKTOP=%USERPROFILE%\Desktop"

echo Installation Directory: %INSTALL_DIR%
echo.

REM Create installation directory
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo [OK] Created installation directory
)

REM Copy application files
if exist "%SOURCE_DIR%" (
    xcopy "%SOURCE_DIR%\*" "%INSTALL_DIR%\" /E /I /Y
    echo [OK] Copied application files
) else (
    echo [WARNING] Application files not found in %SOURCE_DIR%
    echo Copying files from current directory...
    xcopy "%~dp0*" "%INSTALL_DIR%\" /E /I /Y /EXCLUDE:%~dp0exclude.txt
    echo [OK] Copied files from current directory
)

REM Create Start Menu folder
if not exist "%START_MENU%" (
    mkdir "%START_MENU%"
    echo [OK] Created Start Menu folder
)

REM Create Start Menu shortcut
echo Set WshShell = CreateObject("WScript.Shell") > "%TEMP%\create_shortcut.vbs"
echo Set shortcut = WshShell.CreateShortcut("%START_MENU%\FretMaster.lnk") >> "%TEMP%\create_shortcut.vbs"
echo shortcut.TargetPath = "%INSTALL_DIR%\FretMaster.bat" >> "%TEMP%\create_shortcut.vbs"
echo shortcut.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\create_shortcut.vbs"
echo shortcut.Description = "Interactive Guitar Coach" >> "%TEMP%\create_shortcut.vbs"
echo shortcut.Save >> "%TEMP%\create_shortcut.vbs"
cscript //nologo "%TEMP%\create_shortcut.vbs"
del "%TEMP%\create_shortcut.vbs"
echo [OK] Created Start Menu shortcut

REM Create Desktop shortcut
echo Set WshShell = CreateObject("WScript.Shell") > "%TEMP%\create_desktop_shortcut.vbs"
echo Set shortcut = WshShell.CreateShortcut("%DESKTOP%\FretMaster.lnk") >> "%TEMP%\create_desktop_shortcut.vbs"
echo shortcut.TargetPath = "%INSTALL_DIR%\FretMaster.bat" >> "%TEMP%\create_desktop_shortcut.vbs"
echo shortcut.WorkingDirectory = "%INSTALL_DIR%" >> "%TEMP%\create_desktop_shortcut.vbs"
echo shortcut.Description = "Interactive Guitar Coach" >> "%TEMP%\create_desktop_shortcut.vbs"
echo shortcut.Save >> "%TEMP%\create_desktop_shortcut.vbs"
cscript //nologo "%TEMP%\create_desktop_shortcut.vbs"
del "%TEMP%\create_desktop_shortcut.vbs"
echo [OK] Created Desktop shortcut

REM Create uninstaller
echo @echo off > "%INSTALL_DIR%\Uninstall.bat"
echo title FretMaster Uninstaller >> "%INSTALL_DIR%\Uninstall.bat"
echo echo Uninstalling FretMaster... >> "%INSTALL_DIR%\Uninstall.bat"
echo echo. >> "%INSTALL_DIR%\Uninstall.bat"
echo rmdir /S /Q "%INSTALL_DIR%" >> "%INSTALL_DIR%\Uninstall.bat"
echo rmdir /S /Q "%START_MENU%" >> "%INSTALL_DIR%\Uninstall.bat"
echo del "%DESKTOP%\FretMaster.lnk" >> "%INSTALL_DIR%\Uninstall.bat"
echo echo. >> "%INSTALL_DIR%\Uninstall.bat"
echo echo FretMaster has been uninstalled. >> "%INSTALL_DIR%\Uninstall.bat"
echo pause >> "%INSTALL_DIR%\Uninstall.bat"
echo [OK] Created uninstaller

REM Add registry entries for Add/Remove Programs
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\FretMaster" /v "DisplayName" /t REG_SZ /d "FretMaster - Interactive Guitar Coach" /f >nul 2>nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\FretMaster" /v "DisplayVersion" /t REG_SZ /d "1.0.0" /f >nul 2>nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\FretMaster" /v "Publisher" /t REG_SZ /d "FretMaster" /f >nul 2>nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\FretMaster" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul 2>nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\FretMaster" /v "UninstallString" /t REG_SZ /d "%INSTALL_DIR%\Uninstall.bat" /f >nul 2>nul
echo [OK] Added registry entries

echo.
echo ==================================================
echo   Installation Complete!
echo ==================================================
echo.
echo FretMaster has been installed to:
echo   %INSTALL_DIR%
echo.
echo You can now launch the app from:
echo   - Desktop shortcut
echo   - Start Menu ^> FretMaster
echo.
echo Press any key to exit...
pause >nul