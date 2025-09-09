import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  PlusOutlined,
  PictureOutlined,
  UserOutlined,
  WalletOutlined
} from '@ant-design/icons';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: '/create',
      icon: <PlusOutlined />,
      label: <Link to="/create">Create Post</Link>,
    },
    {
      key: '/gallery',
      icon: <PictureOutlined />,
      label: <Link to="/gallery">Gallery</Link>,
    },
    {
      key: '/my-nfts',
      icon: <UserOutlined />,
      label: <Link to="/my-nfts">My NFTs</Link>,
    },
  ];

  return (
    <AntHeader className="bg-white shadow-sm border-b border-gray-200 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-blue-600 mr-8">
            VS NFT
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none bg-transparent flex-1"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            type="primary" 
            icon={<WalletOutlined />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;