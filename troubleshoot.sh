#!/bin/bash

# TrustChain Voting - Candidate Addition Troubleshooting Script
# This script helps diagnose and fix the candidate addition issue

echo "🔍 TrustChain Voting - Troubleshooting Candidate Addition Issue"
echo "================================================================"
echo ""

# Check if Hardhat node is running
echo "1️⃣ Checking if Hardhat node is running..."
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Hardhat node is running on port 8545"
else
    echo "❌ Hardhat node is NOT running on port 8545"
    echo "   Please start it with: npx hardhat node"
    exit 1
fi

echo ""

# Check if frontend is running
echo "2️⃣ Checking if frontend is running..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Frontend is running on port 5173"
else
    echo "⚠️  Frontend is NOT running on port 5173"
    echo "   Please start it with: cd frontend && npm run dev"
fi

echo ""

# Display current contract address
echo "3️⃣ Current contract address in constants.js:"
CONTRACT_ADDRESS=$(grep -oP 'contractAddress = "\K[^"]+' frontend/src/constants.js)
echo "   📍 $CONTRACT_ADDRESS"

echo ""

# Instructions
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Open your browser to http://localhost:5173"
echo "2. Open DevTools (F12) and go to the Console tab"
echo "3. Try adding a candidate"
echo "4. Watch for these log messages:"
echo "   - 🚀 Starting candidate addition process..."
echo "   - 📤 Transaction sent! Hash: 0x..."
echo "   - ✅ Transaction confirmed! Block: ..."
echo "   - ✅ CandidateAdded event received: ..."
echo "   - 🔄 Fetching updated candidate list..."
echo "   - ✅ Verification: Current candidate count: X"
echo ""
echo "5. If you see all these messages, the candidate should appear"
echo "6. If not, check for error messages in the console"
echo ""
echo "🔧 Common Fixes:"
echo "==============="
echo ""
echo "Fix 1: Restart everything"
echo "  Terminal 1: npx hardhat node"
echo "  Terminal 2: npx hardhat run scripts/deploy.js --network localhost"
echo "  Terminal 3: Update contract address in frontend/src/constants.js"
echo "  Terminal 4: cd frontend && npm run dev"
echo "  Browser: Hard refresh (Ctrl+Shift+R)"
echo ""
echo "Fix 2: Reset MetaMask account"
echo "  MetaMask → Settings → Advanced → Reset Account"
echo "  (This clears transaction history for local network)"
echo ""
echo "Fix 3: Check you're using the admin account"
echo "  The first Hardhat account (0xf39Fd...) is the admin"
echo "  Make sure this account is selected in MetaMask"
echo ""
echo "Fix 4: Verify election state"
echo "  Candidates can only be added when Election State = 'Not Scheduled'"
echo "  If election is Open or Closed, you cannot add candidates"
echo ""

echo "✅ Troubleshooting script complete!"
echo ""
