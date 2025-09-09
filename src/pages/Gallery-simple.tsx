import React from 'react';
import { Card, Row, Col, Typography, Tag, Button, Empty } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const Gallery: React.FC = () => {
  // Mock data for demonstration
  const mockNFTs = [
    {
      tokenId: '1',
      imageUrl: 'https://via.placeholder.com/300x300?text=NFT+1',
      textContent: 'This is my first NFT post! Excited to be part of the blockchain revolution.',
      creator: '0x1234...5678',
      createdAt: '2024-01-15'
    },
    {
      tokenId: '2',
      imageUrl: 'https://via.placeholder.com/300x300?text=NFT+2',
      textContent: 'Beautiful sunset captured during my travels. Each moment is unique and deserves to be immortalized.',
      creator: '0x9876...5432',
      createdAt: '2024-01-14'
    },
    {
      tokenId: '3',
      imageUrl: 'https://via.placeholder.com/300x300?text=NFT+3',
      textContent: 'Digital art meets blockchain technology. The future is here!',
      creator: '0xabcd...efgh',
      createdAt: '2024-01-13'
    }
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <Title level={2}>NFT Gallery</Title>
        <Paragraph className="text-gray-600">
          Explore all NFTs created on the VS NFT platform
        </Paragraph>
      </div>

      {mockNFTs.length === 0 ? (
        <Empty
          description="No NFTs found"
          className="my-16"
        />
      ) : (
        <Row gutter={[24, 24]}>
          {mockNFTs.map((nft) => (
            <Col xs={24} sm={12} lg={8} key={nft.tokenId}>
              <Card
                hoverable
                cover={
                  <div className="aspect-square overflow-hidden">
                    <img
                      alt={`NFT #${nft.tokenId}`}
                      src={nft.imageUrl}
                      className="w-full h-full object-cover"
                    />
                  </div>
                }
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => console.log('View NFT', nft.tokenId)}
                  >
                    View Details
                  </Button>
                ]}
                className="shadow-lg"
              >
                <Meta
                  title={
                    <div className="flex items-center justify-between">
                      <span>NFT #{nft.tokenId}</span>
                      <Tag color="blue">Token</Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <p className="text-gray-600 line-clamp-2">
                        {nft.textContent}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <UserOutlined className="mr-1" />
                          {formatAddress(nft.creator)}
                        </div>
                        <span>{nft.createdAt}</span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Gallery;