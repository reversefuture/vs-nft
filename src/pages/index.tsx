import React, { useState } from 'react';
import { Layout, Typography, Space, Steps, Alert, Spin } from 'antd';
import { WalletConnect } from '../components/WalletConnect';
import { PostCreator } from '../components/PostCreator';
import { NFTPreview } from '../components/NFTPreview';
import { web3Service } from '../lib/web3';
import { ipfsService, NFTMetadata } from '../lib/ipfs';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

interface NFTData {
  imageFile: File;
  text: string;
  contentHash: string;
  imageUrl?: string;
  metadataUrl?: string; // for PINATA
  tokenId?: number;
  transactionHash?: string;
  isExisting?: boolean;
}

export default function NFTMinterApp() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [nftData, setNftData] = useState<NFTData | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleWalletConnection = (connected: boolean, address?: string) => {
    setIsWalletConnected(connected);
    setWalletAddress(address || '');
    if (connected) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
      setNftData(null);
    }
  };

  const handlePostCreate = async (imageFile: File, text: string, contentHash: string) => {
    setIsProcessing(true);
    setError('');

    try {
      // Check if this content hash already exists
      const exists = await web3Service.checkContentHashExists(contentHash);
      
      if (exists) {
        // Get existing token ID
        const tokenId = await web3Service.getTokenByContentHash(contentHash);
        
        setNftData({
          imageFile,
          text,
          contentHash,
          imageUrl: URL.createObjectURL(imageFile),
          tokenId,
          isExisting: true
        });
      } else {
        // New NFT - prepare for minting
        setNftData({
          imageFile,
          text,
          contentHash,
          imageUrl: URL.createObjectURL(imageFile)
        });
      }
      
      setCurrentStep(2);
    } catch (error: unknown) {
      console.error('Error processing post:', error);
      setError('Failed to process post. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMintNFT = async () => {
    if (!nftData || nftData.isExisting) return;

    setIsMinting(true);
    setError('');

    try {
      // Upload image to IPFS
      const imageUrl = await ipfsService.uploadImage(nftData.imageFile);
      
      // Create metadata
      const metadata: NFTMetadata = {
        name: `NFT Post #${nftData.contentHash.slice(0, 8)}`,
        description: nftData.text,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Type",
            value: "Post"
          },
          {
            trait_type: "Content Hash",
            value: nftData.contentHash
          },
          {
            trait_type: "Created",
            value: new Date().toISOString().split('T')[0]
          }
        ],
        external_url: window.location.href
      };

      // Upload metadata to IPFS
      // const metadataUrl = await ipfsService.uploadMetadata(metadata);

      // Mint NFT
      const transactionHash = await web3Service.mintNFT(imageUrl, nftData.contentHash);

      setNftData({
        ...nftData,
        imageUrl,
        transactionHash
      });

      setCurrentStep(3);
    } catch (error: unknown) {
      console.error('Error minting NFT:', error);
      setError('Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const steps = [
    {
      title: 'Connect Wallet',
      description: 'Connect your MetaMask wallet'
    },
    {
      title: 'Create Post',
      description: 'Upload image and enter text'
    },
    {
      title: 'Preview NFT',
      description: 'Review and mint your NFT'
    },
    {
      title: 'Complete',
      description: 'NFT minted successfully'
    }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Title level={2} className="m-0 text-blue-600">
            🎨 NFT Post Minter
          </Title>
          <Text className="text-gray-600">
            Create unique NFTs from your posts
          </Text>
        </div>
      </Header>

      <Content className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <Steps current={currentStep} items={steps} />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              closable
              onClose={() => setError('')}
              className="mb-6"
            />
          )}

          {/* Processing Spinner */}
          {isProcessing && (
            <div className="text-center mb-6">
              <Spin size="large" />
              <Text className="block mt-2">Processing your post...</Text>
            </div>
          )}

          {/* Step 1: Wallet Connection */}
          <WalletConnect onConnectionChange={handleWalletConnection} />

          {/* Step 2: Post Creation */}
          {isWalletConnected && (
            <PostCreator
              onPostCreate={handlePostCreate}
              disabled={isProcessing || isMinting}
            />
          )}

          {/* Step 3: NFT Preview and Minting */}
          {nftData && (
            <NFTPreview
              imageUrl={nftData.imageUrl || URL.createObjectURL(nftData.imageFile)}
              text={nftData.text}
              contentHash={nftData.contentHash}
              tokenId={nftData.tokenId}
              transactionHash={nftData.transactionHash}
              isExisting={nftData.isExisting}
              onMint={handleMintNFT}
              isMinting={isMinting}
            />
          )}

          {/* Info Section */}
          <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
            <Title level={4}>How it works</Title>
            <Space direction="vertical" size="middle">
              <Text>
                🔗 <strong>Consistent NFTs:</strong> Same image + text = Same NFT (using MD5 hash)
              </Text>
              <Text>
                🌐 <strong>Ethereum Testnet:</strong> Deployed on Sepolia for testing
              </Text>
              <Text>
                📦 <strong>IPFS Storage:</strong> Images and metadata stored on IPFS
              </Text>
              <Text>
                🎯 <strong>ERC-721 Standard:</strong> Compatible with all NFT marketplaces
              </Text>
            </Space>
          </div>
        </div>
      </Content>
    </Layout>
  );
}