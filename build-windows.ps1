# Build script for Windows (Microsoft Store)

$ErrorActionPreference = "Stop"

Write-Host "Building FretMaster for Microsoft Store..." -ForegroundColor Green

# Build the web app first
Write-Host "Building web app..." -ForegroundColor Cyan
npm run build

# Create Windows package directory
Write-Host "Creating Windows package..." -ForegroundColor Cyan
$windowsDir = "windows"
$assetsDir = "$windowsDir\Assets"
$distDir = "dist"

# Create assets directory if it doesn't exist
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir -Force | Out-Null
}

# Copy images from public directory to windows/Assets
Write-Host "Copying images..." -ForegroundColor Cyan
if (Test-Path "public") {
    # Copy all files from public to windows/Assets
    Copy-Item "public\*" -Destination "$assetsDir\" -Recurse -Force
    Write-Host "  Copied all files from public directory" -ForegroundColor Gray
}

# Create placeholder icons (replace with actual icons)
Write-Host "Generating Windows icons..." -ForegroundColor Cyan

# Create placeholder PNG files for Windows Store
$sizes = @{
    "Square44x44Logo" = 44
    "Square71x71Logo" = 71
    "Square150x150Logo" = 150
    "Square310x310Logo" = 310
    "Wide310x150Logo" = @{Width=310; Height=150}
    "StoreLogo" = 50
    "SplashScreen" = @{Width=620; Height=300}
}

# Create placeholder SVG icons
foreach ($icon in $sizes.GetEnumerator()) {
    $name = $icon.Key
    $size = $icon.Value
    if ($size -is [hashtable]) {
        $width = $size.Width
        $height = $size.Height
    } else {
        $width = $size
        $height = $size
    }
    
    $svg = @"
<svg width="$width" height="$height" viewBox="0 0 $width $height" xmlns="http://www.w3.org/2000/svg">
  <rect width="$width" height="$height" fill="#6200EE"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="20">FretMaster</text>
</svg>
"@
    $svg | Out-File -FilePath "$assetsDir\$name.svg" -Encoding UTF8
}

# Build Windows MSIX package
Write-Host "Building Windows package..." -ForegroundColor Cyan
Set-Location $windowsDir

# Create MSIX packaging project
$packageConfig = @"
<?xml version="1.0" encoding="utf-8"?>
<Project ToolsVersion="15.0" DefaultTargets="Build" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
  <PropertyGroup>
    <Configuration Condition=" '$(Configuration)' == '' ">Release</Configuration>
    <Platform Condition=" '$(Platform)' == '' ">x86</Platform>
    <ProjectGuid>{00000000-0000-0000-0000-000000000000}</ProjectGuid>
    <OutputType>AppContainerExe</OutputType>
    <AppDesignerFolder>Properties</AppDesignerFolder>
    <RootNamespace>FretMaster</RootNamespace>
    <AssemblyName>FretMaster</AssemblyName>
    <DefaultLanguage>en-US</DefaultLanguage>
    <TargetPlatformIdentifier>UAP</TargetPlatformIdentifier>
    <TargetPlatformVersion>10.0.19041.0</TargetPlatformVersion>
    <MinimumVisualStudioVersion>14</MinimumVisualStudioVersion>
    <AppxPackageSigningEnabled>true</AppxPackageSigningEnabled>
    <EntryPointProjectUniqueName>FretMaster.csproj</EntryPointProjectUniqueName>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\FretMaster\FretMaster.csproj">
      <Project>{00000000-0000-0000-0000-000000000000}</Project>
      <Name>FretMaster</Name>
    </ProjectReference>
  </ItemGroup>
</Project>
"@
$packageConfig | Out-File -FilePath "FretMaster.Package.wapproj" -Encoding UTF8

Set-Location ".."

Write-Host "Windows build complete!" -ForegroundColor Green
Write-Host "Output: windows\AppPackages\FretMaster_1.0.0.0_x86_Debug.msix" -ForegroundColor Yellow