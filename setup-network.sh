#!/bin/bash

# TrustChain Voting - Network Access Setup Script

echo "🌐 TrustChain Voting - Network Access Setup"
echo "==========================================="
echo ""

# Get IP address
IP=$(hostname -I | awk '{print $1}')

if [ -z "$IP" ]; then
    echo "❌ Could not determine IP address"
    exit 1
fi

echo "📍 Your Network IP: $IP"
echo ""

# Check if Vite config is updated
if grep -q "host: '0.0.0.0'" frontend/vite.config.js; then
    echo "✅ Vite configured for network access"
else
    echo "⚠️  Vite not configured for network access"
    echo "   Run this script to update: Already done!"
fi

echo ""
echo "🔥 Firewall Configuration"
echo "========================="
echo ""

# Check if ufw is installed
if command -v ufw &> /dev/null; then
    echo "Checking firewall status..."
    
    # Check if ports are allowed
    if sudo ufw status | grep -q "5173"; then
        echo "✅ Port 5173 (Frontend) is allowed"
    else
        echo "⚠️  Port 5173 not allowed in firewall"
        read -p "Allow port 5173? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo ufw allow 5173/tcp
            echo "✅ Port 5173 allowed"
        fi
    fi
    
    if sudo ufw status | grep -q "8545"; then
        echo "✅ Port 8545 (Hardhat) is allowed"
    else
        echo "⚠️  Port 8545 not allowed in firewall"
        read -p "Allow port 8545? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            sudo ufw allow 8545/tcp
            echo "✅ Port 8545 allowed"
        fi
    fi
else
    echo "ℹ️  UFW firewall not detected (you may not need it)"
fi

echo ""
echo "📋 Access Information"
echo "===================="
echo ""
echo "Frontend URL:  http://$IP:5173"
echo "Hardhat RPC:   http://$IP:8545"
echo ""
echo "🔧 Next Steps:"
echo "============="
echo ""
echo "1. Restart your frontend server:"
echo "   cd frontend && npm run dev"
echo ""
echo "2. Restart Hardhat node with network access:"
echo "   npx hardhat node --hostname 0.0.0.0"
echo ""
echo "3. On other devices:"
echo "   - Open browser to: http://$IP:5173"
echo "   - Add MetaMask network with RPC: http://$IP:8545"
echo "   - Chain ID: 31337"
echo ""
echo "📱 MetaMask Configuration for Other Devices:"
echo "==========================================="
echo ""
echo "Network Name:     Hardhat Local"
echo "RPC URL:          http://$IP:8545"
echo "Chain ID:         31337"
echo "Currency Symbol:  ETH"
echo ""
echo "✅ Setup complete! Access your app at: http://$IP:5173"
echo ""
