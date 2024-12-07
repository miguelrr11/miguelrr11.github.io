#!/bin/bash

# Check if two arguments are passed
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <destination-folder> <new-project-name>"
  exit 1
fi

# Destination folder where the new folder will be created
DEST_FOLDER="$1"
NEW_FOLDER_NAME="$2"

# Paths relative to the script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BLANCO_FOLDER="$SCRIPT_DIR/BLANCO"
TARGET_FOLDER="$SCRIPT_DIR/../$DEST_FOLDER/$NEW_FOLDER_NAME"

# Check if BLANCO folder exists
if [ ! -d "$BLANCO_FOLDER" ]; then
  echo "BLANCO folder does not exist at: $BLANCO_FOLDER"
  exit 1
fi

# Create the new folder in the destination folder
mkdir -p "$TARGET_FOLDER"

# Copy the contents of BLANCO to the new folder
cp -r "$BLANCO_FOLDER/"* "$TARGET_FOLDER/"

echo "Project $NEW_FOLDER_NAME created at $DEST_FOLDER"

# Open the new project folder in VS Code
code "../../$TARGET_FOLDER"
