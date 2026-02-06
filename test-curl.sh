#!/bin/bash

# QR Engine - cURL Test Script
# This script tests the Port Clearance PDF API

echo "🧪 Testing QR Engine API..."
echo ""

API_URL="http://localhost:3000/api/generate-port-clearance"

echo "📡 Sending request to: $API_URL"
echo ""

# Make the API request
response=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "MARINE_AFFAIRS_NO": "MA-2024-001",
    "MARINE_AFFAIRS_NO_FA": "۰۰۱-۲۰۲۴-MA",
    "SERIAL_NO": "PC-12345",
    "SERIAL_NO_FA": "۱۲۳۴۵-PC",
    "ISSUE_DATE_TIME": "2024-10-16 14:30",
    "ISSUE_DATE_TIME_FA": "۱۴۰۳/۰۷/۲۵ ۱۴:۳۰",
    "PORT_CLEARANCE_NO": "PCN-2024-5678",
    "PORT_CLEARANCE_NO_FA": "۵۶۷۸-۲۰۲۴-PCN",
    "CUSTOM_LEAVE_NO": "CL-9876",
    "CUSTOM_LEAVE_NO_FA": "۹۸۷۶-CL",
    "AGENT": "Maritime Services Co.",
    "AGENT_FA": "شرکت خدمات دریایی",
    "VESSEL_NAME": "MV Ocean Star",
    "VESSEL_NAME_FA": "ستاره اقیانوس",
    "ARRIVED_FROM": "Dubai Port",
    "ARRIVED_FROM_FA": "بندر دبی",
    "ON_DATE": "2024-10-15",
    "ON_DATE_FA": "۱۴۰۳/۰۷/۲۴",
    "IMO_NO": "IMO 9234567",
    "IMO_NO_FA": "۹۲۳۴۵۶۷ IMO",
    "SHIPS_FLAG": "Panama",
    "SHIPS_FLAG_FA": "پاناما",
    "REGISTRY_PORT": "Panama City",
    "REGISTRY_PORT_FA": "پاناما سیتی",
    "GROSS_TONNAGE": "45000 GT",
    "GROSS_TONNAGE_FA": "۴۵۰۰۰ تن",
    "MASTER": "Captain John Smith",
    "MASTER_FA": "کاپیتان جان اسمیت",
    "PERMITTED_TO_SAIL": "Bandar Abbas",
    "PERMITTED_TO_SAIL_FA": "بندر عباس",
    "HEAD_OF_MARITIME": "Ali Rezaei",
    "HEAD_OF_MARITIME_FA": "علی رضایی",
    "PORT": "Khorramshahr",
    "PORT_FA": "خرمشهر",
    "SIGNATURE": "Digitally Signed",
    "SIGNATURE_FA": "امضا شده دیجیتال"
  }')

# Check if request was successful
if [ $? -eq 0 ]; then
    echo "✅ Response received:"
    echo ""
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    echo ""
    
    # Extract PDF URL if successful
    pdf_url=$(echo "$response" | grep -o '"pdfUrl":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$pdf_url" ]; then
        echo "🎉 Success! PDF generated:"
        echo "📄 PDF URL: $pdf_url"
        echo ""
        echo "💡 To view the PDF, open this URL in your browser:"
        echo "   $pdf_url"
        echo ""
        echo "📱 Or scan the QR code in the PDF to verify it works!"
    fi
else
    echo "❌ Request failed. Make sure the server is running on port 3000."
    echo "   Start server with: npm start"
fi

