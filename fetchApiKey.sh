#!/bin/bash

# check if stage is provided as argument
if [ -z "$1" ]; then
  echo "Usage: $0 <stage>"
  exit 1
fi

# set the stage from the first argument
STAGE=$1

# set the API Key name pattern based on the stage
API_KEY_NAME="notes-api-key-${STAGE}"

# Retrieve the API Key ID
API_KEY_ID=$(aws apigateway get-api-keys --query "items[?name=='${API_KEY_NAME}'].id" --output text)

# check if API_KEY_ID was successfully retrieved
if [ -z "$API_KEY_ID" ]; then
  echo "API Key ID not found for stage: ${STAGE}"
  exit 1
fi

# Retrieve the API Key value using the API Key ID
API_KEY_VALUE=$(aws apigateway get-api-key --api-key "$API_KEY_ID" --include-value --query "value" --output text)

# Check if API_KEY_VALUE was successfully retrieved
if [ -z "$API_KEY_VALUE" ]; then
  echo "API Key value not found for API Key ID: ${API_KEY_ID}"
  exit 1
fi

# Print the API Key value of the endpoint
echo "API Key for stage ${STAGE}: ${API_KEY_VALUE}"