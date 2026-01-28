#!/bin/bash

echo "🔧 Fixing Network Access..."

# Check if UFW is active
if sudo ufw status | grep -q "Status: active"; then
    echo "Firewall is active. Opening ports..."
    
    # Allow ports
    sudo ufw allow 5173/tcp
    sudo ufw allow 8545/tcp
    
    echo "✅ Ports 5173 (Frontend) and 8545 (Blockchain) opened."
    sudo ufw status
else
    echo "⚠️ Firewall is NOT active. The issue might be elsewhere."
    echo "Checking if ports are listening..."
fi

# Check if listening
if netstat -tuln | grep -q "0.0.0.0:5173"; then
    echo "✅ Frontend is listening on all interfaces (0.0.0.0:5173)"
else
    echo "❌ Frontend is NOT listening on network interface!"
    echo "Please restart the frontend with: npm run dev"
fi

echo ""
echo "👉 Try accessing this URL on your other device:"
echo "http://$(hostname -I | awk '{print $1}'):5173"
