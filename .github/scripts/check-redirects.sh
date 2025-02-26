#!/bin/bash

# This script checks if the source URLs of the redirects in the .gitbook.yaml file are valid in terms of HTTP status code. Anything that is not a 404 is considered valid.

GITBOOK_FILE=".gitbook.yaml"

check_url() {
  local url=$1
  local status_code=$(curl --output /dev/null --silent --head --write-out "%{http_code}" "$url")
  if [ "$status_code" -eq 404 ]; then
    return 1
  else
    return 0
  fi
}

redirects=$(grep -E '^[[:space:]]*[^#[:space:]]+:[[:space:]]*[^#[:space:]]+$' "$GITBOOK_FILE")

while IFS= read -r line; do
  source=$(echo "$line" | awk -F: '{print $1}' | xargs)
  full_source="https://developer.shopware.com/docs/$source"

  if [ -z "$source" ]; then
    echo "Invalid redirect: $line"
    continue
  fi

  if ! check_url "$full_source"; then
    echo "Invalid source URL: $full_source"
  else
    echo "Valid source URL: $full_source"
  fi
done <<< "$redirects"
