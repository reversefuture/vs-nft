# VS-NFT Deployment Guide

A comprehensive guide to run the VS-NFT project locally and deploy it to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Smart Contract Deployment](#smart-contract-deployment)
5. [IPFS Configuration](#ipfs-configuration)
6. [Production Deployment](#production-deployment)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **MetaMask**: Browser extension for Web3 interactions

### Required Accounts

- **Ethereum Wallet**: MetaMask or similar (for testnet interactions)
- **Infura Account**: For Ethereum node access
- **Pinata Account**: For IPFS storage
- **Vercel Account**: For production deployment (optional)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/reversefuture/vs-nft.git
cd vs-nft
git checkout dev-openHands
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Ethereum Configuration
VITE_CONTRACT_ADDRESS=your_deployed_contract_address
VITE_INFURA_KEY=your_infura_project_id

# IPFS Configuration
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_GATEWAY=https://gateway.pinata.cloud

# Development
NODE_ENV=development
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Environment Configuration

### Getting Required API Keys

#### 1. Infura Setup

1. Visit [Infura.io](https://infura.io)
2. Create an account and new project
3. Select "Web3 API" → "Ethereum"
4. Copy the Project ID
5. Add to `.env` as `VITE_INFURA_KEY`

#### 2. Pinata Setup

1. Visit [Pinata.cloud](https://pinata.cloud)
2. Create an account
3. Go to API Keys section
4. Create new API key with pinning permissions
5. Copy the JWT token
6. Add to `.env` as `VITE_PINATA_JWT`

#### 3. MetaMask Setup

1. Install MetaMask browser extension
2. Create or import wallet
3. Add Sepolia testnet:
   - Network Name: Sepolia
   - RPC URL: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
   - Chain ID: 11155111
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia.etherscan.io

## Smart Contract Deployment

### 1. Configure Hardhat

Create `hardhat.config.ts` (already included):

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.VITE_INFURA_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
```

### 2. Add Private Key

Add your wallet private key to `.env`:

```env
PRIVATE_KEY=your_wallet_private_key_here
```

⚠️ **Security Warning**: Never commit private keys to version control!

### 3. Get Test ETH

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH

### 4. Deploy Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia
```

Copy the deployed contract address and update `.env`:

```env
VITE_CONTRACT_ADDRESS=0x_your_deployed_contract_address
```

### 5. Verify Deployment

```bash
# Check contract on Etherscan
# Visit: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

## IPFS Configuration

### Testing IPFS Connection

Create a test file to verify IPFS setup:

```bash
# Create test file
echo "Test IPFS upload" > test.txt

# Test upload using curl
curl -X POST \
  -F "file=@test.txt" \
  -H "Authorization: Bearer YOUR_PINATA_JWT" \
  "https://api.pinata.cloud/pinning/pinFileToIPFS"
```

Expected response:
```json
{
  "IpfsHash": "QmHash...",
  "PinSize": 123,
  "Timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Production Deployment

### Option 1: Vercel Deployment (Recommended)

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Configure Environment Variables

In Vercel dashboard or via CLI:

```bash
vercel env add VITE_CONTRACT_ADDRESS
vercel env add VITE_INFURA_KEY
vercel env add VITE_PINATA_JWT
vercel env add VITE_PINATA_GATEWAY
```

#### 4. Deploy

```bash
# Build and deploy
vercel --prod
```

#### 5. Custom Domain (Optional)

```bash
vercel domains add your-domain.com
```

### Option 2: Manual Build Deployment

#### 1. Build for Production

```bash
npm run build
```

#### 2. Test Production Build

```bash
npm run preview
```

#### 3. Deploy to Static Hosting

Upload the `dist/` folder to your hosting provider:

- **Netlify**: Drag and drop `dist` folder
- **GitHub Pages**: Push `dist` to `gh-pages` branch
- **AWS S3**: Upload `dist` contents to S3 bucket

### Option 3: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Build and Run

```bash
# Build Docker image
docker build -t vs-nft .

# Run container
docker run -p 80:80 vs-nft
```

## Testing

### 1. Unit Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### 2. Smart Contract Tests

```bash
# Test contracts
npx hardhat test

# Test with gas reporting
REPORT_GAS=true npx hardhat test
```

### 3. End-to-End Testing

```bash
# Install Playwright (if not already installed)
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e
```

### 4. Manual Testing Checklist

#### Frontend Testing

- [ ] Home page loads correctly
- [ ] Navigation works between all pages
- [ ] Create Post form validation works
- [ ] Image upload functionality works
- [ ] Text input with character counter works
- [ ] Responsive design on mobile devices
- [ ] Error handling displays properly

#### Web3 Integration Testing

- [ ] MetaMask connection works
- [ ] Contract interaction functions
- [ ] Transaction signing works
- [ ] NFT minting process completes
- [ ] IPFS upload succeeds
- [ ] Gallery displays NFTs correctly

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. Build failures

```bash
# Check TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix
```

#### 3. MetaMask connection issues

- Ensure MetaMask is installed and unlocked
- Check network is set to Sepolia
- Verify contract address is correct
- Check browser console for errors

#### 4. IPFS upload failures

- Verify Pinata JWT token is correct
- Check API key permissions
- Ensure file size is under limits
- Test with curl command first

#### 5. Contract deployment issues

```bash
# Check network configuration
npx hardhat console --network sepolia

# Verify account balance
npx hardhat run scripts/check-balance.ts --network sepolia
```

#### 6. Environment variable issues

```bash
# Check if variables are loaded
node -e "console.log(process.env.VITE_CONTRACT_ADDRESS)"

# Restart development server after .env changes
```

### Performance Optimization

#### 1. Bundle Size Optimization

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/assets/*.js
```

#### 2. Image Optimization

- Use WebP format for images
- Implement lazy loading
- Compress images before upload

#### 3. Caching Strategy

- Configure proper cache headers
- Use service workers for offline support
- Implement IPFS caching

### Security Considerations

#### 1. Environment Variables

- Never commit `.env` files
- Use different keys for development/production
- Rotate API keys regularly

#### 2. Smart Contract Security

- Audit contract code before mainnet deployment
- Use OpenZeppelin contracts
- Implement proper access controls

#### 3. Frontend Security

- Validate all user inputs
- Sanitize data before IPFS upload
- Implement rate limiting

## Monitoring and Maintenance

### 1. Application Monitoring

- Set up error tracking (Sentry)
- Monitor API usage (Infura, Pinata)
- Track user analytics

### 2. Smart Contract Monitoring

- Monitor contract events
- Track gas usage
- Set up alerts for unusual activity

### 3. Regular Maintenance

- Update dependencies monthly
- Monitor security advisories
- Backup important data

## Support

For additional support:

1. Check the [GitHub Issues](https://github.com/reversefuture/vs-nft/issues)
2. Review the [README.md](./README.md) file
3. Contact the development team

---

**Last Updated**: January 2024
**Version**: 1.0.0