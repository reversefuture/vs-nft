import React from 'react';
import { Button, Card, Row, Col, Typography, Space, Statistic } from 'antd';
import { Link } from 'react-router-dom';
import {
  PlusOutlined,
  PictureOutlined,
  RocketOutlined,
  SafetyOutlined,
  GlobalOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const features = [
    {
      icon: <SafetyOutlined className="text-4xl text-blue-500" />,
      title: 'Deterministic Minting',
      description: 'Same image and text content always generates the same NFT, ensuring uniqueness and preventing duplicates.'
    },
    {
      icon: <GlobalOutlined className="text-4xl text-green-500" />,
      title: 'IPFS Storage',
      description: 'Your content is stored on IPFS for decentralized, permanent, and censorship-resistant storage.'
    },
    {
      icon: <ThunderboltOutlined className="text-4xl text-purple-500" />,
      title: 'Low Gas Fees',
      description: 'Optimized smart contracts and testnet deployment keep your minting costs minimal.'
    },
    {
      icon: <RocketOutlined className="text-4xl text-orange-500" />,
      title: 'Easy to Use',
      description: 'Simple interface for uploading images, adding text, and minting your unique digital posts as NFTs.'
    }
  ];

  const stats = [
    { title: 'Total NFTs Minted', value: '1,234', suffix: '+' },
    { title: 'Active Creators', value: '567', suffix: '+' },
    { title: 'Unique Posts', value: '890', suffix: '+' },
    { title: 'Gas Saved', value: '45', suffix: '%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Title level={1} className="text-5xl lg:text-6xl font-bold mb-6">
              Create Unique
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Digital Posts
              </span>
            </Title>
            <Paragraph className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Transform your posts into NFTs with deterministic minting. Same content creates the same NFT, 
              ensuring authenticity and preventing duplicates on the Ethereum blockchain.
            </Paragraph>
            <Space size="large" className="flex flex-col sm:flex-row">
              <Link to="/create">
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  className="h-12 px-8 text-lg font-semibold"
                >
                  Create Your First NFT
                </Button>
              </Link>
              <Link to="/gallery">
                <Button
                  size="large"
                  icon={<PictureOutlined />}
                  className="h-12 px-8 text-lg"
                >
                  Explore Gallery
                </Button>
              </Link>
            </Space>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row gutter={[32, 32]} justify="center">
            {stats.map((stat, index) => (
              <Col xs={12} sm={6} key={index}>
                <Card className="text-center border-none shadow-sm">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    suffix={stat.suffix}
                    valueStyle={{ color: '#3b82f6', fontSize: '2rem', fontWeight: 'bold' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Title level={2} className="text-4xl font-bold mb-4">
              Why Choose VS NFT?
            </Title>
            <Paragraph className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to provide the best NFT creation experience
            </Paragraph>
          </div>

          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  className="h-full text-center hover:shadow-lg transition-shadow duration-300 border-none"
                  bodyStyle={{ padding: '2rem' }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <Title level={4} className="mb-3">
                    {feature.title}
                  </Title>
                  <Paragraph className="text-gray-600">
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Title level={2} className="text-4xl font-bold mb-4">
              How It Works
            </Title>
            <Paragraph className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create your unique NFT in just a few simple steps
            </Paragraph>
          </div>

          <Row gutter={[32, 32]} align="middle">
            <Col xs={24} lg={8}>
              <Card className="text-center border-none shadow-sm">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <Title level={4}>Upload & Write</Title>
                <Paragraph className="text-gray-600">
                  Upload your image and write your post content. Our system will calculate a unique hash.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card className="text-center border-none shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <Title level={4}>Store on IPFS</Title>
                <Paragraph className="text-gray-600">
                  Your content is uploaded to IPFS for permanent, decentralized storage.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card className="text-center border-none shadow-sm">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <Title level={4}>Mint NFT</Title>
                <Paragraph className="text-gray-600">
                  Connect your wallet and mint your unique NFT on the Ethereum blockchain.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Title level={2} className="text-4xl font-bold text-white mb-6">
            Ready to Create Your First NFT?
          </Title>
          <Paragraph className="text-xl text-blue-100 mb-8">
            Join thousands of creators who are already minting unique digital posts on VS NFT
          </Paragraph>
          <Link to="/create">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="h-12 px-8 text-lg font-semibold bg-white text-blue-600 border-white hover:bg-gray-100"
            >
              Start Creating Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;