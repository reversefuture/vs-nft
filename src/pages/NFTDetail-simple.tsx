import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Typography, Tag, Button, Descriptions } from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const NFTDetail: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();

  // Mock NFT data
  const nftData = {
    tokenId: tokenId || '1',
    imageUrl: `https://via.placeholder.com/500x500?text=NFT+${tokenId}`,
    textContent: 'This is a detailed view of an NFT post. The content here represents the text that was used to create this unique digital asset on the blockchain.',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: '2024-01-15T10:30:00Z',
    imageHash: 'QmX1Y2Z3...',
    tokenURI: 'https://ipfs.io/ipfs/QmX1Y2Z3...',
    transactionHash: '0xabcdef1234567890...'
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => window.history.back()}
        className="mb-6"
      >
        Back to Gallery
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={12}>
          <Card className="shadow-lg">
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                alt={`NFT #${nftData.tokenId}`}
                src={nftData.imageUrl}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <div className="space-y-6">
            <div>
              <Title level={2}>NFT #{nftData.tokenId}</Title>
              <div className="flex items-center space-x-2 mb-4">
                <Tag color="blue">ERC-721</Tag>
                <Tag color="green">Minted</Tag>
              </div>
            </div>

            <Card title="Description" className="shadow-sm">
              <Paragraph className="text-gray-700">
                {nftData.textContent}
              </Paragraph>
            </Card>

            <Card title="Details" className="shadow-sm">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Token ID">
                  {nftData.tokenId}
                </Descriptions.Item>
                <Descriptions.Item label="Creator">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2" />
                    {formatAddress(nftData.creator)}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Current Owner">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2" />
                    {formatAddress(nftData.owner)}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Created">
                  {formatDate(nftData.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Image Hash">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {nftData.imageHash}
                  </code>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Blockchain Info" className="shadow-sm">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Token URI:</label>
                  <div className="flex items-center mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 mr-2">
                      {nftData.tokenURI}
                    </code>
                    <Button 
                      type="text" 
                      size="small" 
                      onClick={() => window.open(nftData.tokenURI, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Transaction Hash:</label>
                  <div className="flex items-center mt-1">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 mr-2">
                      {nftData.transactionHash}
                    </code>
                    <Button 
                      type="text" 
                      size="small" 
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${nftData.transactionHash}`, '_blank')}
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default NFTDetail;