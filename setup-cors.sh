#!/bin/bash

# Setup CORS for Firebase Storage bucket
# This script configures CORS for the eatappmain-e7503.appspot.com bucket

PROJECT_ID="eatappmain-e7503"
BUCKET_NAME="${PROJECT_ID}.appspot.com"

echo "Setting up CORS for bucket: gs://${BUCKET_NAME}"

# Create temporary CORS config file
cat > /tmp/cors.json << 'EOF'
[
  {
    "origin": ["https://eatappmain-e7503.web.app", "http://localhost:5173", "http://localhost:3000"],
    "method": ["GET", "HEAD", "DELETE", "PUT", "POST"],
    "responseHeader": ["Content-Type", "x-goog-meta-*"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Apply CORS config using gsutil
if command -v gsutil &> /dev/null; then
    gsutil cors set /tmp/cors.json gs://${BUCKET_NAME}
    echo "✅ CORS configured successfully!"
else
    echo "❌ gsutil not found. Please install Google Cloud SDK:"
    echo "   https://cloud.google.com/sdk/docs/install"
    echo ""
    echo "Alternative: Configure CORS manually in Firebase Console:"
    echo "   1. Go to Firebase Storage Rules"
    echo "   2. In the left sidebar, find CORS settings"
    echo "   3. Paste the config from /tmp/cors.json"
fi

rm /tmp/cors.json
