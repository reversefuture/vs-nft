import React from 'react';
import { Card, Typography, Space, Tag, Button, Image, Divider } from 'antd';
import { LinkOutlined, CopyOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface NFTPreviewProps {
  imageUrl: string;
  text: string;
  contentHash: string;
  tokenId?: number;
  transactionHash?: string;
  isExisting?: boolean;
  onMint?: () => void;
  isMinting?: boolean;
}

export const NFTPreview: React.FC<NFTPreviewProps> = ({
  imageUrl,
  text,
  contentHash,
  tokenId,
  transactionHash,
  isExisting,
  onMint,
  isMinting
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const openEtherscan = (hash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
  };

  return (
    <Card className="mb-6">
      <Space direction="vertical" size="large" className="w-full">
        <div className="text-center">
          <Title level={3}>
            {isExisting ? '🎨 Existing NFT Found' : '✨ NFT Preview'}
          </Title>
          
          {isExisting && (
            <Tag color="orange" className="mb-4">
              This content already exists as NFT #{tokenId}
            </Tag>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Preview */}
          <div>
            <Text strong className="block mb-2">NFT Image</Text>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <Image
                src={imageUrl}
                alt="NFT Preview"
                className="w-full max-w-sm mx-auto rounded-lg"
                preview={{
                  mask: 'Click to preview'
                }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div>
            <Text strong className="block mb-2">NFT Metadata</Text>
            <Space direction="vertical" className="w-full">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Text strong>Title:</Text>
                <Paragraph className="mb-2">
                  NFT Post #{contentHash.slice(0, 8)}
                </Paragraph>

                <Text strong>Description:</Text>
                <Paragraph className="mb-2">
                  {text}
                </Paragraph>

                <Text strong>Content Hash:</Text>
                <div className="flex items-center gap-2 mb-2">
                  <Text code className="text-xs break-all flex-1">
                    {contentHash}
                  </Text>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(contentHash)}
                  />
                </div>

                {tokenId && (
                  <>
                    <Text strong>Token ID:</Text>
                    <Paragraph className="mb-2">#{tokenId}</Paragraph>
                  </>
                )}

                <Text strong>Attributes:</Text>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Tag color="blue">Type: Post</Tag>
                  <Tag color="green">Network: Sepolia</Tag>
                  <Tag color="purple">Standard: ERC-721</Tag>
                </div>
              </div>
            </Space>
          </div>
        </div>

        <Divider />

        {/* Action Buttons */}
        <div className="text-center">
          {!isExisting && !transactionHash && (
            <Button
              type="primary"
              size="large"
              onClick={onMint}
              loading={isMinting}
              className="px-8"
            >
              {isMinting ? 'Minting NFT...' : 'Mint NFT'}
            </Button>
          )}

          {transactionHash && (
            <Space direction="vertical" className="w-full">
              <Tag color="green" className="text-sm">
                ✅ NFT Minted Successfully!
              </Tag>
              <Button
                icon={<LinkOutlined />}
                onClick={() => openEtherscan(transactionHash)}
              >
                View on Etherscan
              </Button>
            </Space>
          )}

          {isExisting && (
            <Space direction="vertical" className="w-full">
              <Text className="text-orange-600">
                This exact content already exists as an NFT. Same content generates the same NFT!
              </Text>
              {transactionHash && (
                <Button
                  icon={<LinkOutlined />}
                  onClick={() => openEtherscan(transactionHash)}
                >
                  View Original Transaction
                </Button>
              )}
            </Space>
          )}
        </div>
      </Space>
    </Card>
  );
};