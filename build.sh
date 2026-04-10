#!/usr/bin/env bash
set -euo pipefail

# Multi-platform build script for Go project
# Exit immediately on error, with proper error code handling

export CC=clang
export CXX=clang++
# CGO_ENABLED set per-platform below

# Color output for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create output directory
mkdir -p builds

# Track failures
FAILED_BUILDS=()
SUCCESSFUL_BUILDS=()

# Error handler
handle_error() {
    local platform=$1
    local exit_code=$2
    echo -e "${RED}✗ $platform build failed with exit code $exit_code${NC}" >&2
    FAILED_BUILDS+=("$platform")
    return 1
}

# Build functions
build_windows() {
    echo -e "${YELLOW}Building for Windows (amd64)...${NC}"
    export GOOS=windows
    export GOARCH=amd64
    export CGO_ENABLED=1
    if go build -ldflags "-H windowsgui" -o builds/oilempire.exe . ; then
        echo -e "${GREEN}✓ Windows build successful!${NC}"
        SUCCESSFUL_BUILDS+=("Windows")
    else
        handle_error "Windows" $?
    fi
}

build_linux() {
    echo -e "${YELLOW}Building for Linux (amd64)...${NC}"
    export GOOS=linux
    export GOARCH=amd64
    export CGO_ENABLED=0
    if go build -o builds/oilempire-linux . ; then
        echo -e "${GREEN}✓ Linux build successful!${NC}"
        SUCCESSFUL_BUILDS+=("Linux")
    else
        handle_error "Linux" $?
    fi
}

build_macos() {
    echo -e "${YELLOW}Building for macOS (amd64)...${NC}"
    export GOOS=darwin
    export GOARCH=amd64
    export CGO_ENABLED=0
    if go build -o builds/oilempire-macos . ; then
        echo -e "${GREEN}✓ macOS (Intel) build successful!${NC}"
        SUCCESSFUL_BUILDS+=("macOS (Intel)")
    else
        handle_error "macOS (Intel)" $?
    fi
}

build_macos_arm() {
    echo -e "${YELLOW}Building for macOS (arm64)...${NC}"
    export GOOS=darwin
    export GOARCH=arm64
    export CGO_ENABLED=0
    if go build -o builds/oilempire-macos-arm64 . ; then
        echo -e "${GREEN}✓ macOS (ARM64) build successful!${NC}"
        SUCCESSFUL_BUILDS+=("macOS (ARM64)")
    else
        handle_error "macOS (ARM64)" $?
    fi
}

# Main execution
echo -e "${YELLOW}Starting multi-platform build...${NC}\n"

build_windows
# Note: Linux and macOS builds require platform-specific dependencies
# and cannot be cross-compiled from Windows with Fyne GUI library

# Summary
echo ""
echo -e "${YELLOW}======== Build Summary ========${NC}"
echo -e "${GREEN}Successful: ${#SUCCESSFUL_BUILDS[@]}${NC}"
for build in "${SUCCESSFUL_BUILDS[@]}"; do
    echo "  ✓ $build"
done

if [ ${#FAILED_BUILDS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Failed: ${#FAILED_BUILDS[@]}${NC}"
    for build in "${FAILED_BUILDS[@]}"; do
        echo "  ✗ $build"
    done
    echo ""
    echo -e "${RED}Build failed - some platforms did not compile successfully${NC}" >&2
    exit 1
fi

echo ""
echo -e "${GREEN}All builds completed successfully!${NC}"
echo -e "${YELLOW}Binaries location: ./builds/${NC}"
ls -lh builds/

# Copy Windows build to root directory
cp builds/oilempire.exe ./oilempire.exe
echo -e "${GREEN}✓ Copied oilempire.exe to root directory${NC}"

exit 0