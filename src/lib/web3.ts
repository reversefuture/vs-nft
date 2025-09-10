import { ethers } from 'ethers';

// Sepolia testnet configuration
export const SEPOLIA_CHAIN_ID = '0xaa36a7';
export const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

// NFT Contract ABI (simplified ERC-721)
export const NFT_CONTRACT_ABI = [
  "function mintNFT(address to, string memory tokenURI, string memory contentHash) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function getTokenByContentHash(string memory contentHash) public view returns (uint256)",
  "function contentHashExists(string memory contentHash) public view returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

// Deployed contract address (you'll need to deploy this)
export const NFT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual deployed address

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not found. Please install MetaMask.');
    }

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Switch to Sepolia testnet
      await this.switchToSepolia();
      
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      
      // Initialize contract
      this.contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, this.signer);
      
      return address;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  private async switchToSepolia(): Promise<void> {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: unknown) {
      // This error code indicates that the chain has not been added to MetaMask
      const error = switchError as { code?: number };
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [SEPOLIA_RPC_URL],
              blockExplorerUrls: ['https://sepolia.etherscan.io/'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  async mintNFT(tokenURI: string, contentHash: string): Promise<string> {
    if (!this.contract || !this.signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const address = await this.signer.getAddress();
      const tx = await this.contract.mintNFT(address, tokenURI, contentHash);
      const receipt = await tx.wait();
      
      return receipt.hash;
    } catch (error) {
      console.error('Failed to mint NFT:', error);
      throw error;
    }
  }

  async checkContentHashExists(contentHash: string): Promise<boolean> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      return await this.contract.contentHashExists(contentHash);
    } catch (error) {
      console.error('Failed to check content hash:', error);
      return false;
    }
  }

  async getTokenByContentHash(contentHash: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tokenId = await this.contract.getTokenByContentHash(contentHash);
      return Number(tokenId);
    } catch (error) {
      console.error('Failed to get token by content hash:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.signer !== null;
  }

  async getAddress(): Promise<string> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }
    return await this.signer.getAddress();
  }
}

// Global instance
export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}