import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Select,
  Button,
  Typography,

  Spin,
  Empty,
  Tag,

  Pagination
} from 'antd';
import { Link } from 'react-router-dom';
import {
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  CalendarOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { getWalletState, getReadOnlyContract, formatAddress } from '../utils/web3';
import { fetchFromIPFS } from '../utils/ipfs';
import { NFTToken, NFTMetadata, GalleryFilters, WalletState } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const Gallery: React.FC = () => {
  const [nfts, setNfts] = useState<NFTToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  });
  const [filters, setFilters] = useState<GalleryFilters>({
    sortBy: 'newest',
    searchTerm: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  useEffect(() => {
    initializeGallery();
  }, []);

  useEffect(() => {
    if (walletState.chainId) {
      loadNFTs();
    }
  }, [walletState.chainId, filters]);

  const initializeGallery = async () => {
    try {
      const state = await getWalletState();
      setWalletState(state);
    } catch (error) {
      console.error('Failed to initialize gallery:', error);
      setLoading(false);
    }
  };

  const loadNFTs = async () => {
    if (!walletState.chainId) return;

    setLoading(true);
    try {
      const contract = getReadOnlyContract(walletState.chainId);
      if (!contract) {
        throw new Error('Failed to get contract instance');
      }

      // Get total supply
      const totalSupply = await contract.totalSupply();
      const nftList: NFTToken[] = [];

      // Load NFTs (in a real app, you'd want pagination on the contract level)
      for (let i = 1; i <= Math.min(Number(totalSupply), 100); i++) {
        try {
          const owner = await contract.ownerOf(i);
          const tokenURI = await contract.tokenURI(i);
          const post = await contract.getPost(i);

          // Fetch metadata from IPFS
          let metadata: NFTMetadata | undefined;
          try {
            const metadataJson = await fetchFromIPFS(tokenURI.replace('https://ipfs.io/ipfs/', ''));
            metadata = JSON.parse(metadataJson);
          } catch (error) {
            console.warn(`Failed to load metadata for token ${i}:`, error);
          }

          nftList.push({
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
        } catch (error) {
          console.warn(`Failed to load NFT ${i}:`, error);
        }
      }

      // Apply filters and sorting
      let filteredNFTs = nftList;

      // Search filter
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredNFTs = filteredNFTs.filter(nft =>
          nft.metadata?.name?.toLowerCase().includes(searchTerm) ||
          nft.metadata?.description?.toLowerCase().includes(searchTerm) ||
          nft.post?.textContent?.toLowerCase().includes(searchTerm) ||
          nft.tokenId.includes(searchTerm)
        );
      }

      // Owner filter
      if (filters.owner) {
        filteredNFTs = filteredNFTs.filter(nft =>
          nft.owner.toLowerCase() === filters.owner?.toLowerCase()
        );
      }

      // Creator filter
      if (filters.creator) {
        filteredNFTs = filteredNFTs.filter(nft =>
          nft.post?.creator.toLowerCase() === filters.creator?.toLowerCase()
        );
      }

      // Sort
      filteredNFTs.sort((a, b) => {
        switch (filters.sortBy) {
          case 'newest':
            return (b.post?.createdAt || 0) - (a.post?.createdAt || 0);
          case 'oldest':
            return (a.post?.createdAt || 0) - (b.post?.createdAt || 0);
          case 'tokenId':
            return parseInt(a.tokenId) - parseInt(b.tokenId);
          default:
            return 0;
        }
      });

      setNfts(filteredNFTs);
    } catch (error) {
      console.error('Failed to load NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (value: GalleryFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
    setCurrentPage(1);
  };

  const renderNFTCard = (nft: NFTToken) => {
    const imageUrl = nft.metadata?.image || '/placeholder-image.png';
    const title = nft.metadata?.name || `NFT #${nft.tokenId}`;
    const description = nft.metadata?.description || nft.post?.textContent || 'No description available';
    const createdAt = nft.post?.createdAt ? new Date(nft.post.createdAt * 1000) : null;

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
              <div className="absolute top-2 right-2">
                <Tag color="blue">#{nft.tokenId}</Tag>
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

  const paginatedNFTs = nfts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={2}>NFT Gallery</Title>
          <Paragraph className="text-lg text-gray-600">
            Explore unique digital posts created by the community
          </Paragraph>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} lg={8}>
              <Search
                placeholder="Search NFTs, creators, or content..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
              />
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Select
                value={filters.sortBy}
                onChange={handleSortChange}
                size="large"
                className="w-full"
              >
                <Option value="newest">Newest First</Option>
                <Option value="oldest">Oldest First</Option>
                <Option value="tokenId">Token ID</Option>
              </Select>
            </Col>
            <Col xs={24} lg={12}>
              <div className="flex items-center justify-end space-x-4">
                <Text className="text-gray-600">
                  {nfts.length} NFT{nfts.length !== 1 ? 's' : ''} found
                </Text>
                {!walletState.chainId && (
                  <Tag color="orange">Connect wallet to view all NFTs</Tag>
                )}
              </div>
            </Col>
          </Row>
        </Card>

        {/* NFT Grid */}
        {loading ? (
          <div className="text-center py-20">
            <Spin size="large" />
            <div className="mt-4">
              <Text className="text-gray-600">Loading NFTs...</Text>
            </div>
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-20">
            <Empty
              image={<PictureOutlined className="text-6xl text-gray-300" />}
              description={
                <div>
                  <Title level={4} className="text-gray-400">No NFTs Found</Title>
                  <Paragraph className="text-gray-500">
                    {filters.searchTerm
                      ? 'Try adjusting your search terms'
                      : 'Be the first to create an NFT!'}
                  </Paragraph>
                </div>
              }
            >
              <Link to="/create">
                <Button type="primary" size="large">
                  Create First NFT
                </Button>
              </Link>
            </Empty>
          </div>
        ) : (
          <>
            <Row gutter={[24, 24]}>
              {paginatedNFTs.map(renderNFTCard)}
            </Row>

            {/* Pagination */}
            {nfts.length > pageSize && (
              <div className="text-center mt-8">
                <Pagination
                  current={currentPage}
                  total={nfts.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} NFTs`
                  }
                />
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <Card className="mt-8">
          <Row gutter={[32, 16]} className="text-center">
            <Col xs={24} sm={8}>
              <div>
                <Title level={3} className="text-blue-600 mb-0">
                  {nfts.length}
                </Title>
                <Text className="text-gray-600">Total NFTs</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Title level={3} className="text-green-600 mb-0">
                  {new Set(nfts.map(nft => nft.post?.creator)).size}
                </Title>
                <Text className="text-gray-600">Unique Creators</Text>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Title level={3} className="text-purple-600 mb-0">
                  {new Set(nfts.map(nft => nft.owner)).size}
                </Title>
                <Text className="text-gray-600">Unique Owners</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default Gallery;