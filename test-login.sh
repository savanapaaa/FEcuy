#!/bin/bash

# Laravel Sanctum Login Test Script
# This script demonstrates the correct workflow for Laravel Sanctum authentication

echo "=== Laravel Sanctum Login Test ==="
echo

# Step 1: Get CSRF Cookie
echo "Step 1: Getting CSRF Cookie..."
COOKIE_JAR="cookies.txt"

# Clear any existing cookies
rm -f $COOKIE_JAR

# Get CSRF cookie
curl -v -c $COOKIE_JAR \
  'https://be-savana.budiutamamandiri.com/sanctum/csrf-cookie' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json'

echo
echo "Cookies saved to $COOKIE_JAR:"
cat $COOKIE_JAR
echo

# Step 2: Extract XSRF-TOKEN from cookies
XSRF_TOKEN=$(grep XSRF-TOKEN $COOKIE_JAR | cut -f7)
if [ -z "$XSRF_TOKEN" ]; then
    echo "❌ XSRF-TOKEN not found in cookies!"
    exit 1
fi

# URL decode the token
DECODED_TOKEN=$(python3 -c "import urllib.parse; print(urllib.parse.unquote('$XSRF_TOKEN'))" 2>/dev/null || echo "$XSRF_TOKEN")

echo "Extracted XSRF-TOKEN: ${DECODED_TOKEN:0:20}..."
echo

# Step 3: Login with CSRF token
echo "Step 2: Logging in with CSRF token..."
curl -v -b $COOKIE_JAR -c $COOKIE_JAR \
  -X POST \
  'https://be-savana.budiutamamandiri.com/api/auth/login' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -H "X-XSRF-TOKEN: $DECODED_TOKEN" \
  -H "X-CSRF-TOKEN: $DECODED_TOKEN" \
  -d '{
    "username": "superadmin",
    "password": "super123"
  }'

echo
echo "=== Test Complete ==="

# Cleanup
rm -f $COOKIE_JAR
