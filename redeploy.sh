#!/bin/bash

# TrustChain Voting - Automated Contract Redeployment Script
# This script redeploys the contract and updates the frontend automatically

echo "🚀 TrustChain Voting - Contract Redeployment"
echo "============================================"
echo ""

# Check if Hardhat node is running
echo "1️⃣ Checking Hardhat node..."
if ! lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "❌ Hardhat node is NOT running!"
    echo "   Please start it first: npx hardhat node"
    exit 1
fi
echo "✅ Hardhat node is running"
echo ""

# Deploy contract
echo "2️⃣ Deploying contract..."
OUTPUT=$(npx hardhat run scripts/deploy.cjs --network localhost --config hardhat.config.cjs 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    echo "$OUTPUT"
    exit 1
fi

echo "$OUTPUT"
echo ""

# Extract contract address
ADDRESS=$(echo "$OUTPUT" | grep -oP 'Voting contract deployed to: \K0x[a-fA-F0-9]+')

if [ -z "$ADDRESS" ]; then
    echo "❌ Failed to extract contract address from output"
    exit 1
fi

echo "📍 New contract address: $ADDRESS"
echo ""

# Update constants.js
echo "3️⃣ Updating frontend/src/constants.js..."
if [ ! -f "frontend/src/constants.js" ]; then
    echo "❌ constants.js not found!"
    exit 1
fi

# Create backup
cp frontend/src/constants.js frontend/src/constants.js.backup

# Update the address
sed -i "s/export const contractAddress = \"0x[a-fA-F0-9]*\"/export const contractAddress = \"$ADDRESS\"/" frontend/src/constants.js

if [ $? -eq 0 ]; then
    echo "✅ Updated frontend/src/constants.js"
    echo "   Old backup saved as constants.js.backup"
else
    echo "❌ Failed to update constants.js"
    exit 1
fi

echo ""
echo "✅ Deployment Complete!"
echo "======================="
echo ""
echo "📋 Next Steps:"
echo "1. Hard refresh your browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)"
echo "2. Reset MetaMask account: Settings → Advanced → Reset Account"
echo "3. Try adding a candidate in the Admin Panel"
echo ""
echo "📍 Contract Address: $ADDRESS"
echo ""
