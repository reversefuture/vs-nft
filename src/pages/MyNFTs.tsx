import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Spin,
  Empty,
  Tag,
  Tabs,
  Alert,
  Statistic
} from 'antd';
import { Link } from 'react-router-dom';
import {
  EyeOutlined,
  PlusOutlined,
  WalletOutlined,
  PictureOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { getWalletState, getContract, formatAddress } from '../utils/web3';
import { fetchFromIPFS } from '../utils/ipfs';
import { NFTToken, NFTMetadata, WalletState } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const MyNFTs: React.FC = () => {
  const [ownedNFTs, setOwnedNFTs] = useState<NFTToken[]>([]);
  const [createdNFTs, setCreatedNFTs] = useState<NFTToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  });

  useEffect(() => {
    initializeMyNFTs();
  }, []);

  useEffect(() => {
    if (walletState.isConnected && walletState.address && walletState.chainId) {
      loadMyNFTs();
    }
  }, [walletState]);

  const initializeMyNFTs = async () => {
    try {
      const state = await getWalletState();
      setWalletState(state);
    } catch (error) {
      console.error('Failed to initialize My NFTs:', error);
      setLoading(false);
    }
  };

  const loadMyNFTs = async () => {
    if (!walletState.address || !walletState.chainId) return;

    setLoading(true);
    try {
      const contract = await getContract(walletState.chainId);
      if (!contract) {
        throw new Error('Failed to get contract instance');
      }

      // Get tokens owned by user
      const ownedTokenIds = await contract.getTokensByOwner(walletState.address);
      
      // Load owned NFTs
      const ownedNFTList: NFTToken[] = [];
      const createdNFTList: NFTToken[] = [];

      for (const tokenId of ownedTokenIds) {
        try {
          const owner = await contract.ownerOf(tokenId);
          const tokenURI = await contract.tokenURI(tokenId);
          const post = await contract.getPost(tokenId);

          // Fetch metadata from IPFS
          let metadata: NFTMetadata | undefined;
          try {
            const metadataJson = await fetchFromIPFS(tokenURI.replace('https://ipfs.io/ipfs/', ''));
            metadata = JSON.parse(metadataJson);
          } catch (error) {
            console.warn(`Failed to load metadata for token ${tokenId}:`, error);
          }

          const nftToken: NFTToken = {
            tokenId: tokenId.toString(),
            owner,
            tokenURI,
            metadata,
            post: {
              imageHash: post.imageHash,
              textContent: post.textContent,
              creator: post.creator,
              createdAt: Number(post.createdAt),
              updatedAt: Number(post.updatedAt),
              exists: post.exists
            }
          };

          // Add to owned list
          ownedNFTList.push(nftToken);

          // Add to created list if user is the creator
          if (post.creator.toLowerCase() === walletState.address.toLowerCase()) {
            createdNFTList.push(nftToken);
          }
        } catch (error) {
          console.warn(`Failed to load NFT ${tokenId}:`, error);
        }
      }

      // If user has created NFTs but doesn't own them anymore, we need to find them
      // This is a simplified approach - in production, you'd want to use events or indexing
      if (createdNFTList.length < ownedNFTList.length) {
        try {
          const totalSupply = await contract.totalSupply();
          for (let i = 1; i <= Math.min(Number(totalSupply), 100); i++) {
            try {
              const post = await contract.getPost(i);
              if (post.creator.toLowerCase() === walletState.address.toLowerCase()) {
                // Check if we already have this NFT
                const exists = createdNFTList.some(nft => nft.tokenId === i.toString());
                if (!exists) {
                  const owner = await contract.ownerOf(i);
                  const tokenURI = await contract.tokenURI(i);

                  let metadata: NFTMetadata | undefined;
                  try {
                    const metadataJson = await fetchFromIPFS(tokenURI.replace('https://ipfs.io/ipfs/', ''));
                    metadata = JSON.parse(metadataJson);
                  } catch (error) {
                    console.warn(`Failed to load metadata for token ${i}:`, error);
                  }

                  createdNFTList.push({
                    tokenId: i.toString(),
                    owner,
                    tokenURI,
                    metadata,
                    post: {
                      imageHash: post.imageHash,
                      textContent: post.textContent,
                      creator: post.creator,
                      createdAt: Number(post.createdAt),
                      updatedAt: Number(post.updatedAt),
                      exists: post.exists
                    }
                  });
                }
              }
            } catch (error) {
              // Skip tokens that don't exist or can't be loaded
            }
          }
        } catch (error) {
          console.warn('Failed to load created NFTs:', error);
        }
      }

      // Sort by creation date (newest first)
      ownedNFTList.sort((a, b) => (b.post?.createdAt || 0) - (a.post?.createdAt || 0));
      createdNFTList.sort((a, b) => (b.post?.createdAt || 0) - (a.post?.createdAt || 0));

      setOwnedNFTs(ownedNFTList);
      setCreatedNFTs(createdNFTList);
    } catch (error) {
      console.error('Failed to load my NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNFTCard = (nft: NFTToken) => {
    const imageUrl = nft.metadata?.image || '/placeholder-image.png';
    const title = nft.metadata?.name || `NFT #${nft.tokenId}`;
    const description = nft.metadata?.description || nft.post?.textContent || 'No description available';
    const createdAt = nft.post?.createdAt ? new Date(nft.post.createdAt * 1000) : null;
    const isOwner = nft.owner.toLowerCase() === walletState.address?.toLowerCase();
    const isCreator = nft.post?.creator.toLowerCase() === walletState.address?.toLowerCase();

    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={nft.tokenId}>
        <Card
          hoverable
          className="nft-card h-full"
          cover={
            <div className="relative">
              <img
                alt={title}
                src={imageUrl}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                }}
              />
              <div className="absolute top-2 right-2 space-x-1">
                <Tag color="blue">#{nft.tokenId}</Tag>
                {isCreator && <Tag color="green">Creator</Tag>}
                {isOwner && <Tag color="purple">Owner</Tag>}
              </div>
            </div>
          }
          actions={[
            <Link to={`/nft/${nft.tokenId}`} key="view">
              <Button type="text" icon={<EyeOutlined />}>
                View Details
              </Button>
            </Link>
          ]}
        >
          <Card.Meta
            title={
              <div className="truncate" title={title}>
                {title}
              </div>
            }
            description={
              <div className="space-y-2">
                <Paragraph
                  ellipsis={{ rows: 2, expandable: false }}
                  className="text-sm text-gray-600 mb-2"
                >
                  {description}
                </Paragraph>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <UserOutlined />
                    <span>{formatAddress(nft.owner)}</span>
                  </div>
                  {createdAt && (
                    <div className="flex items-center space-x-1">
                      <CalendarOutlined />
                      <span>{createdAt.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            }
          />
        </Card>
      </Col>
    );
  };

  const renderEmptyState = (type: 'owned' | 'created') => (
    <div className="text-center py-20">
      <Empty
        image={<PictureOutlined className="text-6xl text-gray-300" />}
        description={
          <div>
            <Title level={4} className="text-gray-400">
              {type === 'owned' ? 'No NFTs Owned' : 'No NFTs Created'}
            </Title>
            <Paragraph className="text-gray-500">
              {type === 'owned'
                ? 'You don\'t own any NFTs yet. Start by creating your first one!'
                : 'You haven\'t created any NFTs yet. Share your creativity with the world!'}
            </Paragraph>
          </div>
        }
      >
        <Link to="/create">
          <Button type="primary" size="large" icon={<PlusOutlined />}>
            Create Your First NFT
          </Button>
        </Link>
      </Empty>
    </div>
  );

  if (!walletState.isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Title level={2}>My NFTs</Title>
            <div className="mt-8">
              <Alert
                message="Wallet Not Connected"
                description="Please connect your wallet to view your NFTs"
                type="info"
                showIcon
                action={
                  <Button type="primary" icon={<WalletOutlined />}>
                    Connect Wallet
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2}>My NFTs</Title>
          <Paragraph className="text-lg text-gray-600">
            Manage your owned and created NFTs
          </Paragraph>
        </div>

        {/* Stats */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="NFTs Owned"
                value={ownedNFTs.length}
                prefix={<PictureOutlined />}
                valueStyle={{ color: '#3b82f6' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="NFTs Created"
                value={createdNFTs.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Wallet Balance"
                value={walletState.balance ? parseFloat(walletState.balance).toFixed(4) : '0'}
                suffix="ETH"
                prefix={<WalletOutlined />}
                valueStyle={{ color: '#8b5cf6' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs */}
        {loading ? (
          <div className="text-center py-20">
            <Spin size="large" />
            <div className="mt-4">
              <Text className="text-gray-600">Loading your NFTs...</Text>
            </div>
          </div>
        ) : (
          <Tabs defaultActiveKey="owned" size="large">
            <TabPane
              tab={
                <span>
                  <PictureOutlined />
                  Owned NFTs ({ownedNFTs.length})
                </span>
              }
              key="owned"
            >
              {ownedNFTs.length === 0 ? (
                renderEmptyState('owned')
              ) : (
                <Row gutter={[24, 24]}>
                  {ownedNFTs.map(renderNFTCard)}
                </Row>
              )}
            </TabPane>

            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Created NFTs ({createdNFTs.length})
                </span>
              }
              key="created"
            >
              {createdNFTs.length === 0 ? (
                renderEmptyState('created')
              ) : (
                <Row gutter={[24, 24]}>
                  {createdNFTs.map(renderNFTCard)}
                </Row>
              )}
            </TabPane>
          </Tabs>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <div className="text-center">
            <Title level={4}>Quick Actions</Title>
            <Space size="large" className="mt-4">
              <Link to="/create">
                <Button type="primary" size="large" icon={<PlusOutlined />}>
                  Create New NFT
                </Button>
              </Link>
              <Link to="/gallery">
                <Button size="large" icon={<PictureOutlined />}>
                  Browse Gallery
                </Button>
              </Link>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyNFTs;