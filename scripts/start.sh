#!/bin/sh

# Node.js version check
REQUIRED_NODE_VERSION=23
CURRENT_NODE_VERSION=$(node -v | cut -d'.' -f1 | sed 's/v//')

# Compare Node versions
if [ "$(expr "$CURRENT_NODE_VERSION" \< "$REQUIRED_NODE_VERSION")" -eq 1 ]; then
    echo "\033[1;31mError: Node.js version must be $REQUIRED_NODE_VERSION or higher. Current version is $CURRENT_NODE_VERSION.\033[0m"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm >/dev/null 2>&1; then
    echo "\033[1;31mError: pnpm is not installed. Please install pnpm before running the script.\033[0m"
    exit 1
fi

# Store the root directory path
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Navigate to project root
cd "$ROOT_DIR" || exit 1

# Clean cache
echo "\033[1mCleaning cache...\033[0m"
if ! pnpm clean; then
    echo "\033[1;31mFailed to clean cache.\033[0m"
    exit 1
fi

# Install dependencies
echo "\033[1mInstalling dependencies...\033[0m"
if ! pnpm install; then
    echo "\033[1;31mFailed to install dependencies.\033[0m"
    exit 1
fi

# Build project
echo "\033[1mBuilding project...\033[0m"
if ! pnpm build; then
    echo "\033[1;31mFailed to build project.\033[0m"
    exit 1
fi

# Navigate to nft generation package
cd "$ROOT_DIR/packages/plugin-nft-generation" || exit 1

# Build nft generation package
echo "\033[1mBuilding NFT generation package...\033[0m"
if ! pnpm build; then
    echo "\033[1;31mFailed to build nft generation package.\033[0m"
    exit 1
fi

# Navigate back to root
cd "$ROOT_DIR" || exit 1

# Start project
echo "\033[1mStarting project...\033[0m"
if ! pnpm start; then
    echo "\033[1;31mFailed to start project.\033[0m"
    exit 1
fi

# Start client
echo "\033[1mStarting client...\033[0m"
if ! pnpm start:client; then
    echo "\033[1;31mFailed to start client.\033[0m"
    exit 1
fi

# Open webpage
echo "\033[1mOpening webpage at http://localhost:5173...\033[0m"
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:5173"
elif command -v open >/dev/null 2>&1; then
    open "http://localhost:5173"
else
    echo "\033[1;33mPlease open http://localhost:5173 in your browser.\033[0m"
fi