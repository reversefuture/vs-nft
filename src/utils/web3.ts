import { ethers } from 'ethers';
import { WalletState, ContractConfig, TransactionStatus } from '../types';
import { ENV } from '../config/env';

// Contract ABI (simplified for the main functions we need)
export const CONTRACT_ABI = [
  "function mintPost(string memory imageHash, string memory textContent, string memory tokenURI) external payable returns (uint256 tokenId, bool isNewMint)",
  "function generateTokenId(string memory imageHash, string memory textContent) public pure returns (uint256)",
  "function checkContentExists(string memory imageHash, string memory textContent) external view returns (bool exists, uint256 tokenId)",
  "function getPost(uint256 tokenId) external view returns (tuple(string imageHash, string textContent, address creator, uint256 createdAt, uint256 updatedAt, bool exists))",
  "function getTokensByOwner(address owner) external view returns (uint256[] memory)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function mintingFee() external view returns (uint256)",
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "event PostMinted(uint256 indexed tokenId, address indexed creator, string imageHash, string textContent, string tokenURI, uint256 timestamp)"
];

// Network configurations
export const NETWORKS: Record<number, ContractConfig> = {
  11155111: { // Sepolia testnet
    address: ENV.CONTRACT_ADDRESS || '',
    chainId: 11155111,
    rpcUrl: `https://sepolia.infura.io/v3/${ENV.INFURA_KEY}`,
    explorerUrl: 'https://sepolia.etherscan.io'
  },
  1337: { // Local hardhat
    address: ENV.CONTRACT_ADDRESS || '',
    chainId: 1337,
    rpcUrl: 'http://localhost:8545',
    explorerUrl: 'http://localhost:8545'
  }
};

/**
 * Get Web3 provider
 * @returns ethers.BrowserProvider | null
 */
export const getProvider = (): ethers.BrowserProvider | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};

/**
 * Get signer from provider
 * @returns Promise<ethers.JsonRpcSigner | null>
 */
export const getSigner = async (): Promise<ethers.JsonRpcSigner | null> => {
  const provider = getProvider();
  if (!provider) return null;
  
  try {
    return await provider.getSigner();
  } catch (error) {
    console.error('Failed to get signer:', error);
    return null;
  }
};

/**
 * Connect to MetaMask wallet
 * @returns Promise<WalletState>
 */
export const connectWallet = async (): Promise<WalletState> => {
  const defaultState: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  };

  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  try {
    const provider = getProvider();
    if (!provider) throw new Error('Failed to get provider');

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const signer = await getSigner();
    if (!signer) throw new Error('Failed to get signer');

    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);

    return {
      isConnected: true,
      address,
      chainId: Number(network.chainId),
      balance: ethers.formatEther(balance)
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return defaultState;
  }
};

/**
 * Get current wallet state
 * @returns Promise<WalletState>
 */
export const getWalletState = async (): Promise<WalletState> => {
  const defaultState: WalletState = {
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  };

  if (!window.ethereum) return defaultState;

  try {
    const provider = getProvider();
    if (!provider) return defaultState;

    const accounts = await provider.listAccounts();
    if (accounts.length === 0) return defaultState;

    const address = accounts[0].address;
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(address);

    return {
      isConnected: true,
      address,
      chainId: Number(network.chainId),
      balance: ethers.formatEther(balance)
    };
  } catch (error) {
    console.error('Failed to get wallet state:', error);
    return defaultState;
  }
};

/**
 * Switch to specific network
 * @param chainId Target chain ID
 * @returns Promise<boolean> Success status
 */
export const switchNetwork = async (chainId: number): Promise<boolean> => {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      return await addNetwork(chainId);
    }
    console.error('Failed to switch network:', error);
    return false;
  }
};

/**
 * Add network to MetaMask
 * @param chainId Chain ID to add
 * @returns Promise<boolean> Success status
 */
export const addNetwork = async (chainId: number): Promise<boolean> => {
  if (!window.ethereum) return false;

  const networkConfig = NETWORKS[chainId];
  if (!networkConfig) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainId.toString(16)}`,
        chainName: chainId === 11155111 ? 'Sepolia Testnet' : 'Localhost',
        nativeCurrency: {
          name: 'ETH',
          symbol: 'ETH',
          decimals: 18
        },
        rpcUrls: [networkConfig.rpcUrl],
        blockExplorerUrls: [networkConfig.explorerUrl]
      }]
    });
    return true;
  } catch (error) {
    console.error('Failed to add network:', error);
    return false;
  }
};

/**
 * Get contract instance
 * @param chainId Chain ID
 * @returns ethers.Contract | null
 */
export const getContract = async (chainId: number): Promise<ethers.Contract | null> => {
  const networkConfig = NETWORKS[chainId];
  if (!networkConfig || !networkConfig.address) return null;

  try {
    const signer = await getSigner();
    if (!signer) return null;

    return new ethers.Contract(networkConfig.address, CONTRACT_ABI, signer);
  } catch (error) {
    console.error('Failed to get contract:', error);
    return null;
  }
};

/**
 * Get read-only contract instance
 * @param chainId Chain ID
 * @returns ethers.Contract | null
 */
export const getReadOnlyContract = (chainId: number): ethers.Contract | null => {
  const networkConfig = NETWORKS[chainId];
  if (!networkConfig || !networkConfig.address) return null;

  try {
    const provider = new ethers.JsonRpcProvider(networkConfig.rpcUrl);
    return new ethers.Contract(networkConfig.address, CONTRACT_ABI, provider);
  } catch (error) {
    console.error('Failed to get read-only contract:', error);
    return null;
  }
};

/**
 * Wait for transaction confirmation
 * @param txHash Transaction hash
 * @param confirmations Number of confirmations to wait for
 * @returns Promise<TransactionStatus>
 */
export const waitForTransaction = async (
  txHash: string,
  confirmations: number = 1
): Promise<TransactionStatus> => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  try {
    const receipt = await provider.waitForTransaction(txHash, confirmations);
    
    if (!receipt) {
      return {
        hash: txHash,
        status: 'failed',
        confirmations: 0
      };
    }

    return {
      hash: txHash,
      status: receipt.status === 1 ? 'confirmed' : 'failed',
      confirmations: await receipt.confirmations(),
      gasUsed: receipt.gasUsed.toString(),
      effectiveGasPrice: receipt.gasPrice?.toString()
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    return {
      hash: txHash,
      status: 'failed',
      confirmations: 0
    };
  }
};

/**
 * Format address for display
 * @param address Ethereum address
 * @param chars Number of characters to show on each side
 * @returns string Formatted address
 */
export const formatAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

/**
 * Format token amount
 * @param amount Amount in wei
 * @param decimals Number of decimal places
 * @returns string Formatted amount
 */
export const formatTokenAmount = (amount: string, decimals: number = 4): string => {
  return parseFloat(ethers.formatEther(amount)).toFixed(decimals);
};

/**
 * Get transaction URL for explorer
 * @param txHash Transaction hash
 * @param chainId Chain ID
 * @returns string Explorer URL
 */
export const getTransactionUrl = (txHash: string, chainId: number): string => {
  const networkConfig = NETWORKS[chainId];
  if (!networkConfig) return '';
  return `${networkConfig.explorerUrl}/tx/${txHash}`;
};

/**
 * Get address URL for explorer
 * @param address Ethereum address
 * @param chainId Chain ID
 * @returns string Explorer URL
 */
export const getAddressUrl = (address: string, chainId: number): string => {
  const networkConfig = NETWORKS[chainId];
  if (!networkConfig) return '';
  return `${networkConfig.explorerUrl}/address/${address}`;
};