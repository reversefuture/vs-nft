import React from 'react';
import { Card, Row, Col, Typography, Button, Empty, Tag } from 'antd';
import { EyeOutlined, WalletOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const MyNFTs: React.FC = () => {
  // Mock wallet connection state
  const isConnected = false;
  const userAddress = '0x1234...5678';

  // Mock user NFTs
  const userNFTs = [
    {
      tokenId: '1',
      imageUrl: 'https://via.placeholder.com/300x300?text=My+NFT+1',
      textContent: 'This is my first NFT post! Excited to be part of the blockchain revolution.',
      createdAt: '2024-01-15'
    }
  ];

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <Title level={2}>My NFTs</Title>
          <Paragraph className="text-gray-600 mb-8">
            Connect your wallet to view your NFT collection
          </Paragraph>
          
          <Card className="max-w-md mx-auto shadow-lg">
            <div className="text-center py-8">
              <WalletOutlined className="text-6xl text-blue-500 mb-4" />
              <Title level={3}>Connect Your Wallet</Title>
              <Paragraph className="text-gray-600 mb-6">
                Connect your Ethereum wallet to view and manage your NFTs
              </Paragraph>
              <Button 
                type="primary" 
                size="large"
                icon={<WalletOutlined />}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Connect Wallet
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <Title level={2}>My NFTs</Title>
        <Paragraph className="text-gray-600">
          Your personal NFT collection
        </Paragraph>
        <Tag color="green" className="mt-2">
          Connected: {userAddress}
        </Tag>
      </div>

      {userNFTs.length === 0 ? (
        <Empty
          description="You don't have any NFTs yet"
          className="my-16"
        >
          <Button type="primary" href="/create">
            Create Your First NFT
          </Button>
        </Empty>
      ) : (
        <Row gutter={[24, 24]}>
          {userNFTs.map((nft) => (
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
                      <Tag color="green">Owned</Tag>
                    </div>
                  }
                  description={
                    <div className="space-y-2">
                      <p className="text-gray-600 line-clamp-2">
                        {nft.textContent}
                      </p>
                      <div className="text-sm text-gray-500">
                        Created: {nft.createdAt}
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

export default MyNFTs;