# NFT Project MVP Todo

## Core Features to Implement:
1. **Post Creation Interface** - Allow users to upload images and input text
2. **MD5 Hash Generation** - Generate consistent hashes for same image+text combinations
3. **Web3 Integration** - Connect to Ethereum testnet (Sepolia)
4. **NFT Smart Contract** - ERC-721 contract for minting NFTs
5. **IPFS Integration** - Store metadata and images on IPFS
6. **Transaction Handling** - Mint NFTs on blockchain

## Files to Create/Modify:

### Frontend Components (7 files):
1. **src/pages/Index.tsx** - Main NFT creation page with upload and text input
2. **src/components/PostCreator.tsx** - Component for creating posts with image upload
3. **src/components/NFTPreview.tsx** - Preview component for generated NFT
4. **src/components/WalletConnect.tsx** - Web3 wallet connection component
5. **src/lib/web3.ts** - Web3 utilities and contract interactions
6. **src/lib/ipfs.ts** - IPFS upload utilities
7. **src/lib/nft-contract.ts** - Smart contract ABI and interactions

### Configuration:
- **package.json** - Add Web3, Ant Design, and crypto dependencies
- **index.html** - Update title and metadata

## Tech Stack:
- Frontend: React + TypeScript + Tailwind CSS + Ant Design
- Web3: ethers.js, MetaMask integration
- Storage: IPFS via Pinata
- Blockchain: Ethereum Sepolia testnet
- Deployment: Vercel-ready

## Smart Contract Features:
- ERC-721 standard
- Metadata URI storage
- Duplicate prevention via hash mapping
- Ownership tracking