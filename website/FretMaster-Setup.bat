@echo off
title FretMaster Installer
color 0A

echo ==================================================
echo   FretMaster - Interactive Guitar Coach
echo   Installer v1.0.0
echo ==================================================
echo.

REM Extract files
echo Extracting files...
powershell -Command "& { = '%~dp0FretMaster.zip';  = '%LOCALAPPDATA%\FretMaster'; if (Test-Path ) { Remove-Item -Path  -Recurse -Force }; Expand-Archive -Path  -DestinationPath  -Force; if (Test-Path \"\app\") { Move-Item -Path \"\app\*\" -Destination  -Force; Remove-Item -Path \"\app\" -Recurse -Force }; Write-Host 'Files extracted successfully.'}"

REM Create shortcuts
echo Creating shortcuts...
powershell -Command "& { = New-Object -ComObject WScript.Shell;  = .CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\FretMaster\FretMaster.lnk'); .TargetPath = '%LOCALAPPDATA%\FretMaster\FretMaster.bat'; .WorkingDirectory = '%LOCALAPPDATA%\FretMaster'; .Save();  = .CreateShortcut('%USERPROFILE%\Desktop\FretMaster.lnk'); .TargetPath = '%LOCALAPPDATA%\FretMaster\FretMaster.bat'; .WorkingDirectory = '%LOCALAPPDATA%\FretMaster'; .Save()}"

REM Create uninstaller
echo Creating uninstaller...
(
echo @echo off
echo echo Uninstalling FretMaster...
echo rmdir /S /Q "%LOCALAPPDATA%\FretMaster"
echo rmdir /S /Q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\FretMaster"
echo del "%USERPROFILE%\Desktop\FretMaster.lnk"
echo echo FretMaster has been uninstalled.
echo pause
) > "%LOCALAPPDATA%\FretMaster\Uninstall.bat"

echo.
echo ==================================================
echo   Installation Complete!
echo ==================================================
echo.
echo FretMaster has been installed to:
echo   %LOCALAPPDATA%\FretMaster
echo.
echo You can now launch the app from:
echo   - Desktop shortcut
echo   - Start Menu ^> FretMaster
echo.
pause
