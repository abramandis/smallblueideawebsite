#!/bin/bash

echo "Deploying updated contact form with enhanced bot protection..."

# Deploy Firebase functions
echo "Deploying Firebase functions..."
firebase deploy --only functions

echo "Deploying Firebase hosting..."
firebase deploy --only hosting

echo "Deployment complete!"
echo ""
echo "Bot protection features now active:"
echo "✅ Rate limiting (3 requests per 15 minutes per IP)"
echo "✅ Honeypot field (hidden trap for bots)"
echo "✅ Human verification checkbox"
echo "✅ Email format validation"
echo "✅ Suspicious content detection"
echo "✅ Timestamp validation (prevents instant submissions)"
echo "✅ Client-side form protection"
echo "✅ Required field validation"
echo "✅ AJAX form submission (no page redirect)"
echo "✅ Dynamic success/error popups"
echo "✅ CORS fixed for www subdomain"
echo "✅ Modern black-themed form styling"
echo ""
echo "Your contact form is now much more secure and user-friendly!"