@echo off
title FretMaster EXE Builder
color 0A

echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║        Building FretMaster Executable                    ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.

REM Find the C# compiler
set "CSC="

REM Check .NET Framework 4.x
if exist "%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe" (
    set "CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    echo [OK] Found .NET Framework 64-bit
) else if exist "%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe" (
    set "CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
    echo [OK] Found .NET Framework 32-bit
)

REM Check .NET 6/7/8
where dotnet >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Found dotnet CLI
    goto :build_with_dotnet
)

if "%CSC%"=="" (
    echo [ERROR] C# compiler not found.
    echo Please install .NET Framework or .NET SDK.
    echo.
    pause
    exit /b 1
)

echo [OK] Using: %CSC%
echo.

REM Compile the C# code to EXE
echo Compiling FretMaster.exe...
"%CSC%" /target:winexe /out:FretMaster.exe /reference:System.dll /reference:System.Windows.Forms.dll /reference:System.Drawing.dll FretMaster.cs

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Compilation failed!
    pause
    exit /b 1
)

echo [OK] Created FretMaster.exe
goto :done

:build_with_dotnet
echo.
echo Building with dotnet CLI...

REM Create a project file
(
echo ^<Project Sdk="Microsoft.NET.Sdk"^>
echo   ^<PropertyGroup^>
echo     ^<OutputType^>WinExe^</OutputType^>
echo     ^<TargetFramework^>net6.0-windows^</TargetFramework^>
echo     ^<UseWindowsForms^>true^</UseWindowsForms^>
echo     ^<AssemblyName^>FretMaster^</AssemblyName^>
echo     ^<RootNamespace^>FretMaster^</RootNamespace^>
echo   ^</PropertyGroup^>
echo ^</Project^>
) > FretMaster.csproj

dotnet build -c Release

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo [OK] Created FretMaster.exe

:done
echo.
echo  ╔═══════════════════════════════════════════════════════════╗
echo  ║                    BUILD COMPLETE!                       ║
echo  ╚═══════════════════════════════════════════════════════════╝
echo.
echo  Output: FretMaster.exe
echo.
echo  To create installer:
echo  1. Copy FretMaster.exe to the output folder
echo  2. Users can run it directly - no installation needed
echo.
pause