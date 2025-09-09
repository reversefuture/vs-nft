import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, message } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  PlusOutlined,
  PictureOutlined,
  UserOutlined,
  WalletOutlined,
  DisconnectOutlined,
  CopyOutlined
} from '@ant-design/icons';
import { connectWallet, getWalletState, formatAddress } from '../utils/web3';
import { WalletState } from '../types';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const location = useLocation();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    try {
      const state = await getWalletState();
      setWalletState(state);
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletState({
        isConnected: false,
        address: null,
        chainId: null,
        balance: null
      });
    } else {
      checkWalletConnection();
    }
  };

  const handleChainChanged = () => {
    checkWalletConnection();
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const state = await connectWallet();
      setWalletState(state);
      if (state.isConnected) {
        message.success('Wallet connected successfully!');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null
    });
    message.info('Wallet disconnected');
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      message.success('Address copied to clipboard');
    }
  };

  const getNetworkName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return 'Mainnet';
      case 11155111:
        return 'Sepolia';
      case 1337:
        return 'Localhost';
      default:
        return 'Unknown';
    }
  };

  const getNetworkColor = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return '#52c41a';
      case 11155111:
        return '#1890ff';
      case 1337:
        return '#faad14';
      default:
        return '#f5222d';
    }
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>
    },
    {
      key: '/create',
      icon: <PlusOutlined />,
      label: <Link to="/create">Create Post</Link>
    },
    {
      key: '/gallery',
      icon: <PictureOutlined />,
      label: <Link to="/gallery">Gallery</Link>
    },
    {
      key: '/my-nfts',
      icon: <UserOutlined />,
      label: <Link to="/my-nfts">My NFTs</Link>
    }
  ];

  const walletMenuItems = [
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: 'Copy Address',
      onClick: copyAddress
    },
    {
      key: 'disconnect',
      icon: <DisconnectOutlined />,
      label: 'Disconnect',
      onClick: handleDisconnect
    }
  ];

  return (
    <AntHeader className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:block">
              VS NFT
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none justify-center"
          />
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          {walletState.isConnected ? (
            <div className="flex items-center space-x-3">
              {/* Network Badge */}
              <Badge
                color={getNetworkColor(walletState.chainId)}
                text={getNetworkName(walletState.chainId)}
                className="hidden sm:inline-flex"
              />
              
              {/* Balance */}
              <span className="text-sm text-gray-600 hidden lg:block">
                {walletState.balance ? `${parseFloat(walletState.balance).toFixed(4)} ETH` : '0 ETH'}
              </span>

              {/* Wallet Dropdown */}
              <Dropdown
                menu={{ items: walletMenuItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button
                  type="primary"
                  icon={<Avatar size="small" icon={<UserOutlined />} />}
                  className="flex items-center space-x-2"
                >
                  <span className="hidden sm:inline">
                    {formatAddress(walletState.address || '')}
                  </span>
                </Button>
              </Dropdown>
            </div>
          ) : (
            <Button
              type="primary"
              icon={<WalletOutlined />}
              loading={loading}
              onClick={handleConnectWallet}
              size="large"
            >
              <span className="hidden sm:inline">Connect Wallet</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden mt-4">
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-none"
        />
      </div>
    </AntHeader>
  );
};

export default Header;