#! /usr/bin/env bash

# Set the path to the snippets folder
WATCHER_PATH=$1
echo 0 > error.txt

# Find all files in the snippets folder
find $WATCHER_PATH -type f -print0 | while IFS= read -r -d '' file; do
  
  # Check if the file contains the string "WATCHER_URL" and is therefore a watcher file
  cat "$file" | grep 'WATCHER_URL' >> /dev/null || continue 
  
  # Get the JSON from the first line of the file
  HEAD=$(cat "$file" | grep 'WATCHER_URL')
  JSON=$(sed "s/# //g" <<< "$HEAD")
  
  # Get the values from the JSON
  WATCHER_URL=$(echo $JSON | jq -r '.WATCHER_URL')
  WATCHER_HASH=$(echo $JSON | jq -r '.WATCHER_HASH')
  WATCHER_CONTAINS=$(echo $JSON | jq -r '.WATCHER_CONTAINS')   
  
  # Get the hash of the URL
  EVAL_HASH="curl -sl $WATCHER_URL | md5sum | cut -d ' ' -f 1"    
  CALLED_HASH="$(eval $EVAL_HASH)"
    
  # Check if the hashes are equal
  if [ "$WATCHER_HASH" == "$CALLED_HASH" ]; then
      echo "Both hashes are equal."
  else
      echo "Hashes are not equal."
      
      FILE_CONTENT=$(curl -sl $WATCHER_URL)
          
      # Check if $WATCHER_CONTAINS contains the string "null" and is therefore empty or not set
      if [[ $WATCHER_CONTAINS == "null" ]]; then
        echo 1 > error.txt
      fi
      # Check if $WATCHER_CONTAINS contains the string $WATCHER_CONTAINS and if not call the Slack webhook
      if [[ $FILE_CONTENT == *"$WATCHER_CONTAINS"* ]]; then
        echo "String found!"
      else
        echo "String not found! Please check $WATCHER_URL"
        echo "Sourcefile: https://github.com/shopware/docs/blob/main/$file"
        echo 1 > error.txt
      fi
  fi
done

ERROR_FOUND=$(cat error.txt)

if [ "$ERROR_FOUND" -eq 1 ]
  then
    echo "Error found, exiting..."
    exit 1
  else
    echo "$ERROR_FOUND No error found, exiting..."
    exit 0
  fi
