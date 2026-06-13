# FretMaster Installer Builder
# This script compiles the installer to an EXE file

param(
    [string]$OutputDir = ".\output"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "  FretMaster Installer Builder" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host ""

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "Created output directory: $OutputDir" -ForegroundColor Green
}

# Check if ps2exe is available
$ps2exeAvailable = $false
try {
    Get-Command ps2exe -ErrorAction Stop | Out-Null
    $ps2exeAvailable = $true
    Write-Host "ps2exe module found" -ForegroundColor Green
} catch {
    Write-Host "ps2exe module not found, checking for alternative..." -ForegroundColor Yellow
}

if ($ps2exeAvailable) {
    # Compile PowerShell installer to EXE
    Write-Host ""
    Write-Host "Compiling PowerShell installer to EXE..." -ForegroundColor Cyan
    
    $ps1Path = Join-Path $PSScriptRoot "Install.ps1"
    $exePath = Join-Path $OutputDir "FretMaster-Setup.exe"
    
    if (Test-Path $ps1Path) {
        ps2exe -InputFile $ps1Path -OutputFile $exePath -NoConsole -Title "FretMaster Installer" -Description "Interactive Guitar Coach Installer" -Version "1.0.0" -Copyright "Copyright (C) 2026 FretMaster"
        Write-Host "Created EXE installer: $exePath" -ForegroundColor Green
    } else {
        Write-Host "Install.ps1 not found" -ForegroundColor Red
    }
} else {
    # Create a self-extracting archive using PowerShell
    Write-Host ""
    Write-Host "Creating self-extracting installer..." -ForegroundColor Cyan
    
    # Create the launcher batch file
    $launcherContent = @"
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
powershell -Command "& {$zip = '%~dp0FretMaster.zip'; $dest = '%LOCALAPPDATA%\FretMaster'; if (Test-Path $dest) { Remove-Item -Path $dest -Recurse -Force }; Expand-Archive -Path $zip -DestinationPath $dest -Force; if (Test-Path \"$dest\app\") { Move-Item -Path \"$dest\app\*\" -Destination $dest -Force; Remove-Item -Path \"$dest\app\" -Recurse -Force }; Write-Host 'Files extracted successfully.'}"

REM Create shortcuts
echo Creating shortcuts...
powershell -Command "& {$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\FretMaster\FretMaster.lnk'); $s.TargetPath = '%LOCALAPPDATA%\FretMaster\FretMaster.bat'; $s.WorkingDirectory = '%LOCALAPPDATA%\FretMaster'; $s.Save(); $s = $ws.CreateShortcut('%USERPROFILE%\Desktop\FretMaster.lnk'); $s.TargetPath = '%LOCALAPPDATA%\FretMaster\FretMaster.bat'; $s.WorkingDirectory = '%LOCALAPPDATA%\FretMaster'; $s.Save()}"

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
"@
    
    $launcherPath = Join-Path $OutputDir "FretMaster-Setup.bat"
    $launcherContent | Out-File -FilePath $launcherPath -Encoding ASCII
    Write-Host "Created launcher: $launcherPath" -ForegroundColor Green
}

# Create Android build package
Write-Host ""
Write-Host "Creating Android build package..." -ForegroundColor Cyan

$androidDir = Join-Path $PSScriptRoot "..\android"
$androidZip = Join-Path $OutputDir "FretMaster-Android.zip"

if (Test-Path $androidDir) {
    Compress-Archive -Path "$androidDir\*" -DestinationPath $androidZip -Force
    Write-Host "Created Android package: $androidZip" -ForegroundColor Green
} else {
    Write-Host "Android directory not found" -ForegroundColor Yellow
}

# Create Windows build package
Write-Host ""
Write-Host "Creating Windows build package..." -ForegroundColor Cyan

$windowsDir = Join-Path $PSScriptRoot "..\windows"
$windowsZip = Join-Path $OutputDir "FretMaster-Windows.zip"

if (Test-Path $windowsDir) {
    Compress-Archive -Path "$windowsDir\*" -DestinationPath $windowsZip -Force
    Write-Host "Created Windows package: $windowsZip" -ForegroundColor Green
} else {
    Write-Host "Windows directory not found" -ForegroundColor Yellow
}

# Create website package
Write-Host ""
Write-Host "Creating website package..." -ForegroundColor Cyan

$websiteDir = Join-Path $PSScriptRoot "..\website"
$websiteZip = Join-Path $OutputDir "FretMaster-Website.zip"

if (Test-Path $websiteDir) {
    Compress-Archive -Path "$websiteDir\*" -DestinationPath $websiteZip -Force
    Write-Host "Created website package: $websiteZip" -ForegroundColor Green
} else {
    Write-Host "Website directory not found" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output files in: $OutputDir" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $OutputDir) {
    Get-ChildItem -Path $OutputDir | ForEach-Object {
        Write-Host "  $($_.Name) ($([math]::Round($_.Length / 1KB, 2)) KB)" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "To install FretMaster:" -ForegroundColor Yellow
Write-Host "  1. Run FretMaster-Setup.bat (Windows)" -ForegroundColor White
Write-Host "  2. Install FretMaster-Android.apk (Android)" -ForegroundColor White
Write-Host "  3. Visit the website (Web)" -ForegroundColor White
Write-Host ""