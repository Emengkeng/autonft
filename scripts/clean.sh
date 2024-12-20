#!/bin/bash

# Navigate to the script's directory
cd "$(dirname "$0")"/..
echo "Cleanup started."
# Find and remove node_modules directories, dist directories.
find . -type d -name "node_modules" -exec rm -rf {} + \
    -o -type d -name "dist" -exec rm -rf {} +
# Clean cache in all packages
for pkg in packages/*/; do
    if [ -d "$pkg.turbo" ]; then
        rm -rf "$pkg.turbo"
        echo "✅ Removed .turbo cache in ${pkg%/}"
    fi
done
echo "Cleanup completed."
