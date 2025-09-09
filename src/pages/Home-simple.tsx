import React from 'react';
import { Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <Title level={1}>Welcome to VS NFT</Title>
      <Paragraph style={{ fontSize: '18px', marginBottom: '30px' }}>
        Create unique NFTs from your posts with deterministic minting
      </Paragraph>
      <Link to="/create">
        <Button type="primary" size="large">
          Create Your First NFT
        </Button>
      </Link>
    </div>
  );
};

export default Home;