#!/bin/bash

# VS-NFT Environment Setup Script
echo "🚀 Setting up VS-NFT development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys and configuration"
else
    echo "✅ .env file already exists"
fi

# Check if MetaMask is mentioned in browser extensions
echo "🦊 Please ensure MetaMask is installed in your browser"

# Display next steps
echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Edit .env file with your API keys:"
echo "   - VITE_INFURA_KEY (from infura.io)"
echo "   - VITE_PINATA_JWT (from pinata.cloud)"
echo "   - PRIVATE_KEY (your wallet private key for deployment)"
echo ""
echo "2. Get test ETH from Sepolia faucet:"
echo "   https://sepoliafaucet.com/"
echo ""
echo "3. Deploy smart contract:"
echo "   npm run deploy:sepolia"
echo ""
echo "4. Start development server:"
echo "   npm run dev"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"