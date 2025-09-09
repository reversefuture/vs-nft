import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Button, Typography, Menu, Card, Row, Col, Form, Input, Upload, message, Tag, Descriptions, Empty } from 'antd';
import { HomeOutlined, PlusOutlined, PictureOutlined, UserOutlined, WalletOutlined, InboxOutlined, EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const { Content, Footer, Header } = Layout;
const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Meta } = Card;

// Navigation Component
const Navigation: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: <Link to="/">Home</Link> },
    { key: '/create', icon: <PlusOutlined />, label: <Link to="/create">Create Post</Link> },
    { key: '/gallery', icon: <PictureOutlined />, label: <Link to="/gallery">Gallery</Link> },
    { key: '/my-nfts', icon: <UserOutlined />, label: <Link to="/my-nfts">My NFTs</Link> },
  ];

  return (
    <Header className="bg-white shadow-sm border-b border-gray-200 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-600 mr-8">VS NFT</Link>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none bg-transparent flex-1"
          />
        </div>
        <Button type="primary" icon={<WalletOutlined />}>Connect Wallet</Button>
      </div>
    </Header>
  );
};

// Home Page
const HomePage = () => (
  <div className="max-w-6xl mx-auto p-6">
    <div className="text-center mb-12">
      <Title level={1}>Welcome to VS NFT</Title>
      <Paragraph className="text-xl text-gray-600 mb-8">
        Create unique NFTs from your posts with deterministic minting
      </Paragraph>
      <Link to="/create">
        <Button type="primary" size="large" icon={<PlusOutlined />}>
          Create Your First NFT
        </Button>
      </Link>
    </div>
    
    <Row gutter={[32, 32]} className="mt-16">
      <Col xs={24} md={8}>
        <Card className="text-center h-full">
          <PlusOutlined className="text-4xl text-blue-500 mb-4" />
          <Title level={3}>Create Posts</Title>
          <Paragraph>Upload images and add text to create unique NFTs</Paragraph>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card className="text-center h-full">
          <PictureOutlined className="text-4xl text-green-500 mb-4" />
          <Title level={3}>Deterministic Minting</Title>
          <Paragraph>Same content always generates the same NFT token ID</Paragraph>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card className="text-center h-full">
          <WalletOutlined className="text-4xl text-purple-500 mb-4" />
          <Title level={3}>Ethereum Based</Title>
          <Paragraph>Built on Ethereum testnet with full Web3 integration</Paragraph>
        </Card>
      </Col>
    </Row>
  </div>
);

// Create Post Page
const CreatePostPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);
  const [imageFile, setImageFile] = React.useState<File | null>(null);

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('Image must be smaller than 10MB!');
        return false;
      }
      setImageFile(file);
      return false;
    },
    onRemove: () => setImageFile(null),
  };

  const handleSubmit = async (_values: { textContent: string }) => {
    if (!imageFile) {
      message.error('Please select an image');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('NFT created successfully! (Demo mode)');
      form.resetFields();
      setImageFile(null);
    } catch (error) {
      message.error('Failed to create NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Title level={2}>Create Your NFT Post</Title>
        <Paragraph className="text-gray-600">
          Upload an image and add text to create a unique NFT
        </Paragraph>
      </div>

      <Card className="shadow-lg">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Upload Image" required>
            <Dragger {...uploadProps} className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-4xl text-blue-500" />
              </p>
              <p className="ant-upload-text text-lg">Click or drag image to upload</p>
              <p className="ant-upload-hint text-gray-500">Maximum size: 10MB</p>
            </Dragger>
          </Form.Item>

          <Form.Item
            name="textContent"
            label="Post Content"
            rules={[
              { required: true, message: 'Please enter your post content' },
              { min: 10, message: 'Content must be at least 10 characters' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Write your post content here..."
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item className="text-center">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<PlusOutlined />}
            >
              {loading ? 'Creating NFT...' : 'Create NFT'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

// Gallery Page
const GalleryPage = () => {
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
      textContent: 'Beautiful sunset captured during my travels.',
      creator: '0x9876...5432',
      createdAt: '2024-01-14'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <Title level={2}>NFT Gallery</Title>
        <Paragraph className="text-gray-600">Explore all NFTs created on the platform</Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {mockNFTs.map((nft) => (
          <Col xs={24} sm={12} lg={8} key={nft.tokenId}>
            <Card
              hoverable
              cover={
                <div className="aspect-square overflow-hidden">
                  <img alt={`NFT #${nft.tokenId}`} src={nft.imageUrl} className="w-full h-full object-cover" />
                </div>
              }
              actions={[
                <Link to={`/nft/${nft.tokenId}`}>
                  <Button type="text" icon={<EyeOutlined />}>View Details</Button>
                </Link>
              ]}
            >
              <Meta
                title={<div className="flex items-center justify-between">
                  <span>NFT #{nft.tokenId}</span>
                  <Tag color="blue">Token</Tag>
                </div>}
                description={
                  <div className="space-y-2">
                    <p className="text-gray-600 line-clamp-2">{nft.textContent}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{nft.creator}</span>
                      <span>{nft.createdAt}</span>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// My NFTs Page
const MyNFTsPage = () => {
  const isConnected = false;

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Title level={2}>My NFTs</Title>
        <Card className="max-w-md mx-auto shadow-lg">
          <div className="text-center py-8">
            <WalletOutlined className="text-6xl text-blue-500 mb-4" />
            <Title level={3}>Connect Your Wallet</Title>
            <Paragraph className="text-gray-600 mb-6">
              Connect your Ethereum wallet to view your NFTs
            </Paragraph>
            <Button type="primary" size="large" icon={<WalletOutlined />}>
              Connect Wallet
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Title level={2}>My NFTs</Title>
      <Empty description="You don't have any NFTs yet">
        <Link to="/create">
          <Button type="primary">Create Your First NFT</Button>
        </Link>
      </Empty>
    </div>
  );
};

// NFT Detail Page
const NFTDetailPage = () => {
  const { tokenId } = useParams<{ tokenId: string }>();
  
  const nftData = {
    tokenId: tokenId || '1',
    imageUrl: `https://via.placeholder.com/500x500?text=NFT+${tokenId}`,
    textContent: 'This is a detailed view of an NFT post. The content represents the text used to create this unique digital asset.',
    creator: '0x1234567890abcdef1234567890abcdef12345678',
    createdAt: '2024-01-15T10:30:00Z',
    transactionHash: '0xabcdef1234567890...'
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()} className="mb-6">
        Back to Gallery
      </Button>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={12}>
          <Card>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img alt={`NFT #${nftData.tokenId}`} src={nftData.imageUrl} className="w-full h-full object-cover" />
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

            <Card title="Description">
              <Paragraph>{nftData.textContent}</Paragraph>
            </Card>

            <Card title="Details">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Token ID">{nftData.tokenId}</Descriptions.Item>
                <Descriptions.Item label="Creator">{nftData.creator.slice(0, 6)}...{nftData.creator.slice(-4)}</Descriptions.Item>
                <Descriptions.Item label="Created">{new Date(nftData.createdAt).toLocaleDateString()}</Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Layout className="min-h-screen">
      <Navigation />
      <Content className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/my-nfts" element={<MyNFTsPage />} />
          <Route path="/nft/:tokenId" element={<NFTDetailPage />} />
        </Routes>
      </Content>
      <Footer className="text-center bg-gray-50">
        <div className="max-w-4xl mx-auto py-4">
          <p className="text-gray-600 mb-2">
            VS NFT - Create Unique Digital Posts on Ethereum
          </p>
          <p className="text-sm text-gray-500">
            Built with React, TypeScript, Antd, Tailwind CSS, and Ethereum Smart Contracts
          </p>
        </div>
      </Footer>
    </Layout>
  );
};

export default App;