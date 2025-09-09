export interface Post {
  imageHash: string;
  textContent: string;
  creator: string;
  createdAt: number;
  updatedAt: number;
  exists: boolean;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  animation_url?: string;
}

export interface MintResult {
  tokenId: string;
  isNewMint: boolean;
  transactionHash: string;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
}

export interface ContractConfig {
  address: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
}

export interface IPFSUploadResult {
  hash: string;
  url: string;
  size: number;
}

export interface NFTToken {
  tokenId: string;
  owner: string;
  tokenURI: string;
  metadata?: NFTMetadata;
  post?: Post;
}

export interface CreatePostForm {
  image: File | null;
  textContent: string;
  title: string;
  description: string;
}

export interface GalleryFilters {
  owner?: string;
  creator?: string;
  sortBy: 'newest' | 'oldest' | 'tokenId';
  searchTerm?: string;
}

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
}