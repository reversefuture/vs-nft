import { create } from 'ipfs-http-client';
import { NFTMetadata, IPFSUploadResult } from '../types';
import { ENV } from '../config/env';

// IPFS configuration
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
const PINATA_GATEWAY = ENV.PINATA_GATEWAY + '/ipfs/';

// Create IPFS client (using public gateway for demo)
// In production, you should use your own IPFS node or service like Pinata
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: ENV.INFURA_KEY ? `Basic ${btoa(':' + ENV.INFURA_KEY)}` : ''
  }
});

/**
 * Upload file to IPFS
 * @param file File to upload
 * @returns Promise<IPFSUploadResult> Upload result with hash and URL
 */
export const uploadFileToIPFS = async (file: File): Promise<IPFSUploadResult> => {
  try {
    const result = await ipfs.add(file, {
      progress: (prog) => console.log(`Upload progress: ${prog}`),
      pin: true
    });

    return {
      hash: result.cid.toString(),
      url: `${IPFS_GATEWAY}${result.cid.toString()}`,
      size: result.size
    };
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Upload JSON metadata to IPFS
 * @param metadata NFT metadata object
 * @returns Promise<IPFSUploadResult> Upload result with hash and URL
 */
export const uploadMetadataToIPFS = async (metadata: NFTMetadata): Promise<IPFSUploadResult> => {
  try {
    const metadataString = JSON.stringify(metadata, null, 2);
    const result = await ipfs.add(metadataString, {
      pin: true
    });

    return {
      hash: result.cid.toString(),
      url: `${IPFS_GATEWAY}${result.cid.toString()}`,
      size: result.size
    };
  } catch (error) {
    console.error('IPFS metadata upload error:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
};

/**
 * Fetch content from IPFS
 * @param hash IPFS hash
 * @returns Promise<string> Content as string
 */
export const fetchFromIPFS = async (hash: string): Promise<string> => {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    const content = new TextDecoder().decode(chunks[0]);
    return content;
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw new Error('Failed to fetch content from IPFS');
  }
};

/**
 * Create NFT metadata object
 * @param params Metadata parameters
 * @returns NFTMetadata Complete metadata object
 */
export const createNFTMetadata = (params: {
  name: string;
  description: string;
  imageUrl: string;
  imageHash: string;
  textContent: string;
  creator: string;
  createdAt: number;
}): NFTMetadata => {
  const { name, description, imageUrl, imageHash, textContent, creator, createdAt } = params;
  
  return {
    name,
    description,
    image: imageUrl,
    external_url: window.location.origin,
    attributes: [
      {
        trait_type: "Creator",
        value: creator
      },
      {
        trait_type: "Image Hash",
        value: imageHash
      },
      {
        trait_type: "Text Length",
        value: textContent.length
      },
      {
        trait_type: "Created At",
        value: new Date(createdAt * 1000).toISOString()
      },
      {
        trait_type: "Content Type",
        value: "Post"
      },
      {
        trait_type: "Platform",
        value: "VS NFT"
      }
    ]
  };
};

/**
 * Get IPFS URL from hash
 * @param hash IPFS hash
 * @param useGateway Gateway to use
 * @returns string Complete IPFS URL
 */
export const getIPFSUrl = (hash: string, useGateway: 'ipfs' | 'pinata' = 'ipfs'): string => {
  const gateway = useGateway === 'pinata' ? PINATA_GATEWAY : IPFS_GATEWAY;
  return `${gateway}${hash}`;
};

/**
 * Extract IPFS hash from URL
 * @param url IPFS URL
 * @returns string IPFS hash
 */
export const extractIPFSHash = (url: string): string => {
  const match = url.match(/\/ipfs\/([a-zA-Z0-9]+)/);
  return match ? match[1] : '';
};

/**
 * Pin content to IPFS (requires authentication)
 * @param hash IPFS hash to pin
 * @returns Promise<boolean> Success status
 */
export const pinToIPFS = async (hash: string): Promise<boolean> => {
  try {
    await ipfs.pin.add(hash);
    return true;
  } catch (error) {
    console.error('IPFS pin error:', error);
    return false;
  }
};

/**
 * Upload complete NFT (image + metadata) to IPFS
 * @param file Image file
 * @param metadata NFT metadata (without image URL)
 * @returns Promise<{imageHash: string, metadataHash: string, metadataUrl: string}>
 */
export const uploadCompleteNFT = async (
  file: File,
  metadata: Omit<NFTMetadata, 'image'>
): Promise<{
  imageHash: string;
  metadataHash: string;
  metadataUrl: string;
}> => {
  try {
    // Upload image first
    const imageResult = await uploadFileToIPFS(file);
    
    // Create complete metadata with image URL
    const completeMetadata: NFTMetadata = {
      ...metadata,
      image: imageResult.url
    };
    
    // Upload metadata
    const metadataResult = await uploadMetadataToIPFS(completeMetadata);
    
    return {
      imageHash: imageResult.hash,
      metadataHash: metadataResult.hash,
      metadataUrl: metadataResult.url
    };
  } catch (error) {
    console.error('Complete NFT upload error:', error);
    throw new Error('Failed to upload NFT to IPFS');
  }
};