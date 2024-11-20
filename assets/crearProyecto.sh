#!/bin/bash

# Check if two arguments are passed
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <destination-folder> <new-project-name>"
  exit 1
fi

# Destination folder where the new folder will be created
DEST_FOLDER="$1"
NEW_FOLDER_NAME="$2"
BLANCO_FOLDER="BLANCO"
GIT_REPO_PATH="https://github.com/miguelrr11/miguelrr11.github.io"

# Create the new folder in the destination folder with the name passed as the second argument
mkdir -p "$DEST_FOLDER/$NEW_FOLDER_NAME"

# Check if BLANCO folder exists
if [ ! -d "$BLANCO_FOLDER" ]; then
  echo "BLANCO folder does not exist at: $BLANCO_FOLDER"
  exit 1
fi

# Copy the contents of BLANCO to the new folder
cp -r "$BLANCO_FOLDER/"* "$DEST_FOLDER/$NEW_FOLDER_NAME/"

echo "Project $2 created at $DEST_FOLDER"

# Open the new project folder in Sublime Text
subl "$DEST_FOLDER/$NEW_FOLDER_NAME"
