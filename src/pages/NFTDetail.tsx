import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Tag,
  Descriptions,
  Alert,
  Spin,
  Divider,
  Avatar,
  Tooltip,
  message
} from 'antd';
import {
  ArrowLeftOutlined,
  LinkOutlined as ExternalLinkOutlined,
  CopyOutlined,
  ShareAltOutlined,
  UserOutlined,
  CalendarOutlined,

  LinkOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getWalletState, getReadOnlyContract, formatAddress, getTransactionUrl, getAddressUrl } from '../utils/web3';
import { fetchFromIPFS, extractIPFSHash } from '../utils/ipfs';
import { NFTToken, NFTMetadata, WalletState } from '../types';

const { Title, Text, Paragraph } = Typography;

const NFTDetail: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  const [nft, setNft] = useState<NFTToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  });

  useEffect(() => {
    initializeNFTDetail();
  }, [tokenId]);

  const initializeNFTDetail = async () => {
    try {
      const state = await getWalletState();
      setWalletState(state);
      
      if (tokenId && state.chainId) {
        await loadNFTDetail(tokenId, state.chainId);
      }
    } catch (error) {
      console.error('Failed to initialize NFT detail:', error);
      setLoading(false);
    }
  };

  const loadNFTDetail = async (tokenId: string, chainId: number) => {
    setLoading(true);
    try {
      const contract = getReadOnlyContract(chainId);
      if (!contract) {
        throw new Error('Failed to get contract instance');
      }

      // Load NFT data
      const owner = await contract.ownerOf(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const post = await contract.getPost(tokenId);

      // Fetch metadata from IPFS
      let metadata: NFTMetadata | undefined;
      try {
        const ipfsHash = extractIPFSHash(tokenURI);
        const metadataJson = await fetchFromIPFS(ipfsHash);
        metadata = JSON.parse(metadataJson);
      } catch (error) {
        console.warn(`Failed to load metadata for token ${tokenId}:`, error);
      }

      const nftToken: NFTToken = {
        tokenId,
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

      setNft(nftToken);
    } catch (error) {
      console.error('Failed to load NFT detail:', error);
      message.error('Failed to load NFT details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label} copied to clipboard`);
  };

  const shareNFT = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: nft?.metadata?.name || `NFT #${tokenId}`,
        text: nft?.metadata?.description || 'Check out this unique NFT!',
        url
      });
    } else {
      copyToClipboard(url, 'NFT URL');
    }
  };

  const openInExplorer = (address: string, type: 'address' | 'tx' = 'address') => {
    if (!walletState.chainId) return;
    
    const url = type === 'address' 
      ? getAddressUrl(address, walletState.chainId)
      : getTransactionUrl(address, walletState.chainId);
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <Spin size="large" />
            <div className="mt-4">
              <Text className="text-gray-600">Loading NFT details...</Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert
            message="NFT Not Found"
            description="The requested NFT could not be found or does not exist."
            type="error"
            showIcon
            action={
              <Link to="/gallery">
                <Button type="primary">Browse Gallery</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const imageUrl = nft.metadata?.image || '/placeholder-image.png';
  const title = nft.metadata?.name || `NFT #${tokenId}`;
  const description = nft.metadata?.description || 'No description available';
  const createdAt = nft.post?.createdAt ? new Date(nft.post.createdAt * 1000) : null;
  const updatedAt = nft.post?.updatedAt ? new Date(nft.post.updatedAt * 1000) : null;
  const isOwner = nft.owner.toLowerCase() === walletState.address?.toLowerCase();
  const isCreator = nft.post?.creator.toLowerCase() === walletState.address?.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Space>
            <Link to="/gallery">
              <Button icon={<ArrowLeftOutlined />}>Back to Gallery</Button>
            </Link>
            <Button icon={<ShareAltOutlined />} onClick={shareNFT}>
              Share
            </Button>
          </Space>
        </div>

        <Row gutter={[32, 32]}>
          {/* Image */}
          <Col xs={24} lg={12}>
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto max-h-96 object-contain bg-gray-100 rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <Tag color="blue" className="text-lg px-3 py-1">
                    #{tokenId}
                  </Tag>
                </div>
              </div>
            </Card>

            {/* Post Content */}
            {nft.post?.textContent && (
              <Card title="Post Content" className="mt-6">
                <Paragraph className="whitespace-pre-wrap text-base">
                  {nft.post.textContent}
                </Paragraph>
              </Card>
            )}
          </Col>

          {/* Details */}
          <Col xs={24} lg={12}>
            <Card>
              <div className="mb-6">
                <Title level={2} className="mb-2">
                  {title}
                </Title>
                <Paragraph className="text-lg text-gray-600 mb-4">
                  {description}
                </Paragraph>
                
                <Space>
                  {isOwner && <Tag color="purple">You Own This</Tag>}
                  {isCreator && <Tag color="green">You Created This</Tag>}
                </Space>
              </div>

              <Divider />

              {/* Owner & Creator Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar icon={<UserOutlined />} />
                    <div>
                      <Text strong>Owner</Text>
                      <br />
                      <Text className="text-sm text-gray-600">
                        {formatAddress(nft.owner)}
                      </Text>
                    </div>
                  </div>
                  <Space>
                    <Tooltip title="Copy Address">
                      <Button
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => copyToClipboard(nft.owner, 'Owner address')}
                      />
                    </Tooltip>
                    <Tooltip title="View on Explorer">
                      <Button
                        size="small"
                        icon={<ExternalLinkOutlined />}
                        onClick={() => openInExplorer(nft.owner)}
                      />
                    </Tooltip>
                  </Space>
                </div>

                {nft.post?.creator && nft.post.creator !== nft.owner && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar icon={<UserOutlined />} />
                      <div>
                        <Text strong>Creator</Text>
                        <br />
                        <Text className="text-sm text-gray-600">
                          {formatAddress(nft.post.creator)}
                        </Text>
                      </div>
                    </div>
                    <Space>
                      <Tooltip title="Copy Address">
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyToClipboard(nft.post?.creator || '', 'Creator address')}
                        />
                      </Tooltip>
                      <Tooltip title="View on Explorer">
                        <Button
                          size="small"
                          icon={<ExternalLinkOutlined />}
                          onClick={() => openInExplorer(nft.post?.creator || '')}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                )}
              </div>

              <Divider />

              {/* Technical Details */}
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Token ID">
                  <Text code>#{tokenId}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item label="Contract Standard">
                  <Tag>ERC-721</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Blockchain">
                  <Tag color="blue">
                    {walletState.chainId === 11155111 ? 'Sepolia Testnet' : 'Ethereum'}
                  </Tag>
                </Descriptions.Item>

                {nft.post?.imageHash && (
                  <Descriptions.Item label="Image Hash (MD5)">
                    <Text code className="text-xs break-all">
                      {nft.post.imageHash}
                    </Text>
                    <Button
                      size="small"
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(nft.post!.imageHash, 'Image hash')}
                    />
                  </Descriptions.Item>
                )}

                {createdAt && (
                  <Descriptions.Item label="Created">
                    <Space>
                      <CalendarOutlined />
                      <Text>{createdAt.toLocaleString()}</Text>
                    </Space>
                  </Descriptions.Item>
                )}

                {updatedAt && updatedAt.getTime() !== createdAt?.getTime() && (
                  <Descriptions.Item label="Last Updated">
                    <Space>
                      <CalendarOutlined />
                      <Text>{updatedAt.toLocaleString()}</Text>
                    </Space>
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Token URI">
                  <div className="flex items-center space-x-2">
                    <Text code className="text-xs break-all flex-1">
                      {nft.tokenURI}
                    </Text>
                    <Button
                      size="small"
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(nft.tokenURI, 'Token URI')}
                    />
                    <Button
                      size="small"
                      type="text"
                      icon={<ExternalLinkOutlined />}
                      onClick={() => window.open(nft.tokenURI, '_blank')}
                    />
                  </div>
                </Descriptions.Item>
              </Descriptions>

              {/* Attributes */}
              {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Title level={4} className="mb-4">Attributes</Title>
                    <Row gutter={[16, 16]}>
                      {nft.metadata.attributes.map((attr, index) => (
                        <Col xs={12} sm={8} key={index}>
                          <Card size="small" className="text-center">
                            <Text className="text-xs text-gray-500 uppercase">
                              {attr.trait_type}
                            </Text>
                            <br />
                            <Text strong>{attr.value}</Text>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>

        {/* Actions */}
        <Card className="mt-8">
          <div className="text-center">
            <Title level={4}>Actions</Title>
            <Space size="large" className="mt-4">
              <Link to="/gallery">
                <Button icon={<EyeOutlined />}>
                  Browse More NFTs
                </Button>
              </Link>
              <Link to="/create">
                <Button type="primary">
                  Create Your Own NFT
                </Button>
              </Link>
              {nft.metadata?.external_url && (
                <Button
                  icon={<LinkOutlined />}
                  onClick={() => window.open(nft.metadata!.external_url, '_blank')}
                >
                  External Link
                </Button>
              )}
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NFTDetail;