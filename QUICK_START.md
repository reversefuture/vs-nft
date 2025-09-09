# VS-NFT Quick Start Guide

Get your VS-NFT project running in 5 minutes!

## 🚀 Quick Setup

### 1. Prerequisites Check

```bash
# Check Node.js version (requires 18+)
node --version

# Check npm version
npm --version
```

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/reversefuture/vs-nft.git
cd vs-nft
git checkout dev-openHands

# Run automated setup
npm run setup
```

### 3. Configure Environment

Edit `.env` file with your API keys:

```env
# Get from https://infura.io
VITE_INFURA_KEY=your_infura_project_id

# Get from https://pinata.cloud
VITE_PINATA_JWT=your_pinata_jwt_token

# Your wallet private key (for contract deployment)
PRIVATE_KEY=your_wallet_private_key
```

### 4. Get Test ETH

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH

### 5. Deploy Smart Contract

```bash
npm run deploy:sepolia
```

Copy the contract address and add to `.env`:

```env
VITE_CONTRACT_ADDRESS=0x_your_deployed_contract_address
```

### 6. Start Development

```bash
npm run dev
```

Visit `http://localhost:12000` 🎉

## 📱 Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build and run
npm run docker:build
npm run docker:run
```

Visit `http://localhost:3000`

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run setup` | Automated environment setup |
| `npm run deploy:sepolia` | Deploy contract to Sepolia |
| `npm run verify:contract` | Verify contract on Etherscan |
| `npm run check:balance` | Check wallet balance |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |

## 🆘 Need Help?

- 📖 Read the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 🐛 Check [GitHub Issues](https://github.com/reversefuture/vs-nft/issues)
- 📚 Review the [README.md](./README.md)

## 🎯 What's Next?

1. **Connect MetaMask**: Install MetaMask browser extension
2. **Create Your First NFT**: Upload an image and add text
3. **Explore Gallery**: View all created NFTs
4. **Customize**: Modify the UI to match your brand

Happy building! 🚀