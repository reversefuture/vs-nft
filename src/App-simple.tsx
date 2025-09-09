import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout, Button } from 'antd';

const { Content, Footer } = Layout;

const SimpleHome = () => (
  <div style={{ padding: '20px' }}>
    <h1>VS NFT - Simple Test</h1>
    <p>This is a simple test of the app structure.</p>
    <Button type="primary">Test Button</Button>
  </div>
);

const App: React.FC = () => {
  return (
    <Layout className="min-h-screen">
      <Content className="flex-1">
        <Routes>
          <Route path="/" element={<SimpleHome />} />
        </Routes>
      </Content>
      <Footer className="text-center bg-gray-50">
        <div className="max-w-4xl mx-auto py-4">
          <p className="text-gray-600 mb-2">
            VS NFT - Create Unique Digital Posts on Ethereum
          </p>
        </div>
      </Footer>
    </Layout>
  );
};

export default App;