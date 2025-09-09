import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Upload,
  Button,
  Typography,
  Space,
  Alert,
  Progress,
  Divider,
  Tag,
  message,
  Modal,
  Row,
  Col
} from 'antd';
import {
  InboxOutlined,
  PlusOutlined,
  EyeOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { calculateMD5, validateImageFile, generateTokenId } from '../utils/crypto';
import { uploadCompleteNFT, createNFTMetadata } from '../utils/ipfs';
import { getWalletState, getContract, waitForTransaction } from '../utils/web3';
import { CreatePostForm, WalletState, MintResult } from '../types';


const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreatePost: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [imageHash, setImageHash] = useState<string>('');
  const [tokenId, setTokenId] = useState<string>('');
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mintingStep, setMintingStep] = useState<'idle' | 'uploading' | 'minting' | 'confirming' | 'completed'>('idle');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [mintResult, setMintResult] = useState<MintResult | null>(null);
  const [existingNFT, setExistingNFT] = useState<{ exists: boolean; tokenId: string }>({ exists: false, tokenId: '' });

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      const state = await getWalletState();
      setWalletState(state);
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const handleImageChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
    setFileList(newFileList);
    
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj;
      
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        message.error(validation.errors.join(', '));
        setFileList([]);
        return;
      }

      try {
        // Calculate MD5 hash
        const hash = await calculateMD5(file);
        setImageHash(hash);
        
        // Update token ID if we have text content
        const textContent = form.getFieldValue('textContent');
        if (textContent) {
          const newTokenId = generateTokenId(hash, textContent);
          setTokenId(newTokenId);
          await checkExistingNFT(hash, textContent);
        }
      } catch (error) {
        console.error('Failed to calculate hash:', error);
        message.error('Failed to process image');
      }
    } else {
      setImageHash('');
      setTokenId('');
      setExistingNFT({ exists: false, tokenId: '' });
    }
  };

  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textContent = e.target.value;
    
    if (imageHash && textContent) {
      const newTokenId = generateTokenId(imageHash, textContent);
      setTokenId(newTokenId);
      await checkExistingNFT(imageHash, textContent);
    } else {
      setTokenId('');
      setExistingNFT({ exists: false, tokenId: '' });
    }
  };

  const checkExistingNFT = async (hash: string, text: string) => {
    if (!walletState.chainId) return;
    
    try {
      const contract = await getContract(walletState.chainId);
      if (!contract) return;

      const [exists, existingTokenId] = await contract.checkContentExists(hash, text);
      setExistingNFT({
        exists,
        tokenId: exists ? existingTokenId.toString() : ''
      });
    } catch (error) {
      console.error('Failed to check existing NFT:', error);
    }
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const handleSubmit = async (values: CreatePostForm) => {
    if (!walletState.isConnected) {
      message.error('Please connect your wallet first');
      return;
    }

    if (!walletState.chainId) {
      message.error('Unable to detect network');
      return;
    }

    if (fileList.length === 0 || !fileList[0].originFileObj) {
      message.error('Please upload an image');
      return;
    }

    if (existingNFT.exists) {
      Modal.confirm({
        title: 'NFT Already Exists',
        content: `This content has already been minted as NFT #${existingNFT.tokenId}. Do you want to view it instead?`,
        onOk: () => {
          window.open(`/nft/${existingNFT.tokenId}`, '_blank');
        }
      });
      return;
    }

    setLoading(true);
    setMintingStep('uploading');
    setUploadProgress(0);

    try {
      const file = fileList[0].originFileObj;
      
      // Create metadata
      const metadata = createNFTMetadata({
        name: values.title,
        description: values.description,
        imageUrl: '', // Will be filled by uploadCompleteNFT
        imageHash,
        textContent: values.textContent,
        creator: walletState.address!,
        createdAt: Math.floor(Date.now() / 1000)
      });

      // Upload to IPFS
      setUploadProgress(25);
      const { metadataUrl } = await uploadCompleteNFT(file, metadata);
      setUploadProgress(50);

      // Get contract
      const contract = await getContract(walletState.chainId);
      if (!contract) {
        throw new Error('Failed to get contract instance');
      }

      // Get minting fee
      const mintingFee = await contract.mintingFee();
      
      setMintingStep('minting');
      setUploadProgress(75);

      // Mint NFT
      const tx = await contract.mintPost(
        imageHash,
        values.textContent,
        metadataUrl,
        { value: mintingFee }
      );

      setMintingStep('confirming');
      setUploadProgress(90);

      // Wait for confirmation
      const receipt = await waitForTransaction(tx.hash);
      
      if (receipt.status === 'confirmed') {
        // Parse events to get token ID
        const logs = await contract.queryFilter(
          contract.filters.PostMinted(),
          receipt.confirmations - 1,
          receipt.confirmations
        );
        
        const mintedTokenId = logs.length > 0 && 'args' in logs[0] ? logs[0].args[0].toString() : tokenId;
        
        setMintResult({
          tokenId: mintedTokenId,
          isNewMint: true,
          transactionHash: tx.hash
        });
        
        setMintingStep('completed');
        setUploadProgress(100);
        
        message.success('NFT minted successfully!');
        
        // Reset form
        form.resetFields();
        setFileList([]);
        setImageHash('');
        setTokenId('');
        setExistingNFT({ exists: false, tokenId: '' });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Minting failed:', error);
      message.error(error.message || 'Failed to mint NFT');
      setMintingStep('idle');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    onChange: handleImageChange,
    onPreview: handlePreview,
    beforeUpload: () => false, // Prevent auto upload
    accept: 'image/*',
    listType: 'picture-card',
    maxCount: 1
  };

  const renderMintingProgress = () => {
    const steps = {
      uploading: { text: 'Uploading to IPFS...', progress: 50 },
      minting: { text: 'Minting NFT...', progress: 75 },
      confirming: { text: 'Confirming transaction...', progress: 90 },
      completed: { text: 'Completed!', progress: 100 }
    };

    if (mintingStep === 'idle') return null;

    const step = steps[mintingStep];
    
    return (
      <Card className="mb-6">
        <div className="text-center">
          <div className="mb-4">
            {mintingStep === 'completed' ? (
              <CheckCircleOutlined className="text-4xl text-green-500" />
            ) : (
              <LoadingOutlined className="text-4xl text-blue-500" />
            )}
          </div>
          <Title level={4}>{step.text}</Title>
          <Progress percent={uploadProgress} status={mintingStep === 'completed' ? 'success' : 'active'} />
          
          {mintResult && (
            <div className="mt-4">
              <Alert
                message="NFT Minted Successfully!"
                description={
                  <div>
                    <p>Token ID: #{mintResult.tokenId}</p>
                    <p>Transaction: {mintResult.transactionHash}</p>
                    <Button type="link" onClick={() => window.open(`/nft/${mintResult.tokenId}`, '_blank')}>
                      View NFT
                    </Button>
                  </div>
                }
                type="success"
                showIcon
              />
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Title level={2}>Create Your NFT Post</Title>
          <Paragraph className="text-lg text-gray-600">
            Upload an image and add your text to create a unique NFT
          </Paragraph>
        </div>

        {renderMintingProgress()}

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card title="Post Content" className="mb-6">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                disabled={loading}
              >
                <Form.Item
                  name="image"
                  label="Upload Image"
                  rules={[{ required: true, message: 'Please upload an image' }]}
                >
                  <Dragger {...uploadProps} className="upload-area">
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag image to upload</p>
                    <p className="ant-upload-hint">
                      Support for JPEG, PNG, GIF, WebP. Max size: 10MB
                    </p>
                  </Dragger>
                </Form.Item>

                <Form.Item
                  name="title"
                  label="Post Title"
                  rules={[
                    { required: true, message: 'Please enter a title' },
                    { max: 100, message: 'Title must be less than 100 characters' }
                  ]}
                >
                  <Input placeholder="Enter a catchy title for your post" />
                </Form.Item>

                <Form.Item
                  name="textContent"
                  label="Post Content"
                  rules={[
                    { required: true, message: 'Please enter post content' },
                    { max: 1000, message: 'Content must be less than 1000 characters' }
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Write your post content here..."
                    onChange={handleTextChange}
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="NFT Description"
                  rules={[
                    { required: true, message: 'Please enter a description' },
                    { max: 500, message: 'Description must be less than 500 characters' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Describe your NFT for potential collectors..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    disabled={!walletState.isConnected || existingNFT.exists}
                    icon={<PlusOutlined />}
                    block
                  >
                    {loading ? 'Minting NFT...' : 'Mint NFT'}
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card title="NFT Preview" className="mb-6">
              {imageHash && (
                <div className="space-y-4">
                  <div>
                    <Text strong>Image Hash (MD5):</Text>
                    <br />
                    <Text code className="text-xs break-all">{imageHash}</Text>
                  </div>
                  
                  {tokenId && (
                    <div>
                      <Text strong>Token ID:</Text>
                      <br />
                      <Text code className="text-xs break-all">{tokenId}</Text>
                    </div>
                  )}

                  {existingNFT.exists && (
                    <Alert
                      message="NFT Already Exists"
                      description={
                        <div>
                          <p>This content has already been minted as NFT #{existingNFT.tokenId}</p>
                          <Button
                            type="link"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => window.open(`/nft/${existingNFT.tokenId}`, '_blank')}
                          >
                            View Existing NFT
                          </Button>
                        </div>
                      }
                      type="warning"
                      showIcon
                    />
                  )}

                  <Divider />
                  
                  <div>
                    <Text strong>Deterministic Minting:</Text>
                    <Paragraph className="text-sm text-gray-600 mt-2">
                      The same image and text content will always generate the same Token ID, 
                      ensuring uniqueness and preventing duplicate NFTs.
                    </Paragraph>
                  </div>
                </div>
              )}

              {!walletState.isConnected && (
                <Alert
                  message="Wallet Not Connected"
                  description="Please connect your wallet to mint NFTs"
                  type="info"
                  showIcon
                  action={
                    <Button size="small" icon={<WalletOutlined />}>
                      Connect Wallet
                    </Button>
                  }
                />
              )}
            </Card>

            <Card title="Minting Info" size="small">
              <Space direction="vertical" className="w-full">
                <div className="flex justify-between">
                  <Text>Network:</Text>
                  <Tag color={walletState.chainId === 11155111 ? 'blue' : 'orange'}>
                    {walletState.chainId === 11155111 ? 'Sepolia' : 'Unknown'}
                  </Tag>
                </div>
                <div className="flex justify-between">
                  <Text>Minting Fee:</Text>
                  <Text>0.001 ETH</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Storage:</Text>
                  <Text>IPFS</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Standard:</Text>
                  <Text>ERC-721</Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>

        <Modal
          open={previewVisible}
          title="Image Preview"
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img alt="preview" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    </div>
  );
};

export default CreatePost;