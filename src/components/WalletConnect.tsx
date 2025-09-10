import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Space, Alert } from 'antd';
import { WalletOutlined, DisconnectOutlined } from '@ant-design/icons';
import { web3Service } from '../lib/web3';

const { Text } = Typography;

interface WalletConnectProps {
  onConnectionChange: (connected: boolean, address?: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnectionChange }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (web3Service.isConnected()) {
      try {
        const addr = await web3Service.getAddress();
        setAddress(addr);
        setIsConnected(true);
        onConnectionChange(true, addr);
      } catch (error) {
        console.error('Failed to get address:', error);
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const addr = await web3Service.connectWallet();
      setAddress(addr);
      setIsConnected(true);
      onConnectionChange(true, addr);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setError(errorMessage);
      onConnectionChange(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress('');
    onConnectionChange(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="mb-6">
      <Space direction="vertical" size="middle" className="w-full">
        <div className="flex items-center justify-between">
          <Text strong className="text-lg">Wallet Connection</Text>
          {isConnected ? (
            <Button 
              icon={<DisconnectOutlined />} 
              onClick={disconnectWallet}
              type="text"
              danger
            >
              Disconnect
            </Button>
          ) : (
            <Button 
              type="primary" 
              icon={<WalletOutlined />}
              loading={isConnecting}
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}
        </div>

        {error && (
          <Alert 
            message="Connection Error" 
            description={error} 
            type="error" 
            showIcon 
            closable
            onClose={() => setError('')}
          />
        )}

        {isConnected && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <Space direction="vertical" size="small">
              <Text type="success" strong>✅ Wallet Connected</Text>
              <Text className="text-sm text-gray-600">
                Address: <Text code>{formatAddress(address)}</Text>
              </Text>
              <Text className="text-sm text-gray-600">
                Network: Sepolia Testnet
              </Text>
            </Space>
          </div>
        )}

        {!isConnected && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <Space direction="vertical" size="small">
              <Text className="text-sm">
                🦊 Please connect your MetaMask wallet to continue
              </Text>
              <Text className="text-xs text-gray-500">
                Make sure you're on the Sepolia testnet
              </Text>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};