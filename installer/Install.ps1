# FretMaster Installer Script
# This script can be compiled to EXE using ps2exe or similar tools

param(
    [switch]$Silent,
    [switch]$Uninstall
)

$AppName = "FretMaster - Interactive Guitar Coach"
$AppVersion = "1.0.0"
$Publisher = "FretMaster"
$InstallDir = "$env:LOCALAPPDATA\FretMaster"
$StartMenuDir = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\FretMaster"
$DesktopShortcut = "$env:USERPROFILE\Desktop\FretMaster.lnk"

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Reset = "`e[0m"

function Write-Header {
    Clear-Host
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Orange
    Write-Host "  $AppName" -ForegroundColor Orange
    Write-Host "  Version $AppVersion" -ForegroundColor Gray
    Write-Host "==================================================" -ForegroundColor Orange
    Write-Host ""
}

function Test-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Install-App {
    Write-Header
    Write-Host "Installing $AppName..." -ForegroundColor Cyan
    Write-Host ""

    # Create installation directory
    if (!(Test-Path $InstallDir)) {
        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        Write-Host "Created installation directory: $InstallDir" -ForegroundColor Green
    }

    # Copy application files
    $SourceDir = Join-Path $PSScriptRoot "app"
    if (Test-Path $SourceDir) {
        Copy-Item -Path "$SourceDir\*" -Destination $InstallDir -Recurse -Force
        Write-Host "Copied application files" -ForegroundColor Green
    } else {
        Write-Host "Warning: Application files not found in $SourceDir" -ForegroundColor Yellow
    }

    # Create Start Menu shortcut
    if (!(Test-Path $StartMenuDir)) {
        New-Item -ItemType Directory -Path $StartMenuDir -Force | Out-Null
    }

    $WScriptShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WScriptShell.CreateShortcut($StartMenuDir + "\FretMaster.lnk")
    $Shortcut.TargetPath = "$InstallDir\FretMaster.exe"
    $Shortcut.WorkingDirectory = $InstallDir
    $Shortcut.Description = "Interactive Guitar Coach"
    $Shortcut.Save()
    Write-Host "Created Start Menu shortcut" -ForegroundColor Green

    # Create Desktop shortcut
    $Shortcut = $WScriptShell.CreateShortcut($DesktopShortcut)
    $Shortcut.TargetPath = "$InstallDir\FretMaster.exe"
    $Shortcut.WorkingDirectory = $InstallDir
    $Shortcut.Description = "Interactive Guitar Coach"
    $Shortcut.Save()
    Write-Host "Created Desktop shortcut" -ForegroundColor Green

    # Create uninstaller
    $UninstallScript = @"
`$AppName = "$AppName"
`$InstallDir = "$InstallDir"
`$StartMenuDir = "$StartMenuDir"
`$DesktopShortcut = "$DesktopShortcut"

Write-Host "Uninstalling `$AppName..." -ForegroundColor Cyan

if (Test-Path `$InstallDir) {
    Remove-Item -Path `$InstallDir -Recurse -Force
    Write-Host "Removed installation directory" -ForegroundColor Green
}

if (Test-Path `$StartMenuDir) {
    Remove-Item -Path `$StartMenuDir -Recurse -Force
    Write-Host "Removed Start Menu folder" -ForegroundColor Green
}

if (Test-Path `$DesktopShortcut) {
    Remove-Item -Path `$DesktopShortcut -Force
    Write-Host "Removed Desktop shortcut" -ForegroundColor Green
}

# Remove registry entries
`$UninstallKey = "HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\FretMaster"
if (Test-Path `$UninstallKey) {
    Remove-Item -Path `$UninstallKey -Force
    Write-Host "Removed registry entries" -ForegroundColor Green
}

Write-Host ""
Write-Host "`$AppName has been uninstalled." -ForegroundColor Green
Write-Host "Press any key to exit..."
`$null = `$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
"@
    $UninstallScript | Out-File -FilePath "$InstallDir\Uninstall.ps1" -Encoding UTF8

    # Create uninstaller EXE launcher
    $UninstallBat = @"
@echo off
powershell -ExecutionPolicy Bypass -File "%~dp0Uninstall.ps1"
"@
    $UninstallBat | Out-File -FilePath "$InstallDir\Uninstall.bat" -Encoding ASCII

    # Add registry entries for Add/Remove Programs
    $UninstallKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\FretMaster"
    New-Item -Path $UninstallKey -Force | Out-Null
    Set-ItemProperty -Path $UninstallKey -Name "DisplayName" -Value $AppName
    Set-ItemProperty -Path $UninstallKey -Name "DisplayVersion" -Value $AppVersion
    Set-ItemProperty -Path $UninstallKey -Name "Publisher" -Value $Publisher
    Set-ItemProperty -Path $UninstallKey -Name "InstallLocation" -Value $InstallDir
    Set-ItemProperty -Path $UninstallKey -Name "UninstallString" -Value "`"$InstallDir\Uninstall.bat`""
    Set-ItemProperty -Path $UninstallKey -Name "NoModify" -Value 1
    Set-ItemProperty -Path $UninstallKey -Name "NoRepair" -Value 1
    Write-Host "Added registry entries for Add/Remove Programs" -ForegroundColor Green

    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  Installation Complete!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "$AppName has been installed to:" -ForegroundColor Cyan
    Write-Host "  $InstallDir" -ForegroundColor White
    Write-Host ""
    Write-Host "You can now launch the app from:" -ForegroundColor Cyan
    Write-Host "  - Desktop shortcut" -ForegroundColor White
    Write-Host "  - Start Menu > $AppName" -ForegroundColor White
    Write-Host ""
}

function Uninstall-App {
    Write-Header
    Write-Host "Uninstalling $AppName..." -ForegroundColor Cyan
    Write-Host ""

    $confirm = Read-Host "Are you sure you want to uninstall? (Y/N)"
    if ($confirm -ne 'Y') {
        Write-Host "Uninstall cancelled." -ForegroundColor Yellow
        return
    }

    if (Test-Path $InstallDir) {
        Remove-Item -Path $InstallDir -Recurse -Force
        Write-Host "Removed installation directory" -ForegroundColor Green
    }

    if (Test-Path $StartMenuDir) {
        Remove-Item -Path $StartMenuDir -Recurse -Force
        Write-Host "Removed Start Menu folder" -ForegroundColor Green
    }

    if (Test-Path $DesktopShortcut) {
        Remove-Item -Path $DesktopShortcut -Force
        Write-Host "Removed Desktop shortcut" -ForegroundColor Green
    }

    $UninstallKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\FretMaster"
    if (Test-Path $UninstallKey) {
        Remove-Item -Path $UninstallKey -Force
        Write-Host "Removed registry entries" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  Uninstall Complete!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
}

# Main script
if ($Uninstall) {
    Uninstall-App
} else {
    if (!$Silent) {
        Write-Header
        Write-Host "Welcome to the $AppName installer!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "This will install $AppName to your computer." -ForegroundColor White
        Write-Host ""
        Write-Host "Installation directory: $InstallDir" -ForegroundColor Gray
        Write-Host ""
        
        $confirm = Read-Host "Do you want to install? (Y/N)"
        if ($confirm -ne 'Y') {
            Write-Host "Installation cancelled." -ForegroundColor Yellow
            exit 0
        }
    }
    
    Install-App
    
    if (!$Silent) {
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}