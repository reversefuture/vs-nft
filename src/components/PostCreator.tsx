import React, { useState } from 'react';
import { Card, Upload, Input, Button, Space, Typography, Alert, Progress } from 'antd';
import { InboxOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { ipfsService } from '../lib/ipfs';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface PostCreatorProps {
  onPostCreate: (imageFile: File, text: string, contentHash: string) => void;
  disabled?: boolean;
}

export const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreate, disabled }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [contentHash, setContentHash] = useState<string>('');
  const [isGeneratingHash, setIsGeneratingHash] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        alert('You can only upload image files!');
        return false;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        alert('Image must smaller than 10MB!');
        return false;
      }

      setImageFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return false; // Prevent auto upload
    },
    onRemove: () => {
      setImageFile(null);
      setPreviewUrl('');
      setContentHash('');
    },
    fileList: imageFile ? [{
      uid: '1',
      name: imageFile.name,
      status: 'done',
      url: previewUrl,
    }] : [],
  };

  const generateHash = async () => {
    if (!imageFile || !text.trim()) {
      alert('Please upload an image and enter some text first.');
      return;
    }

    setIsGeneratingHash(true);
    try {
      const hash = await ipfsService.generateContentHash(imageFile, text.trim());
      setContentHash(hash);
    } catch (error) {
      console.error('Failed to generate hash:', error);
      alert('Failed to generate content hash. Please try again.');
    } finally {
      setIsGeneratingHash(false);
    }
  };

  const handleCreatePost = () => {
    if (!imageFile || !text.trim() || !contentHash) {
      alert('Please complete all steps: upload image, enter text, and generate hash.');
      return;
    }

    onPostCreate(imageFile, text.trim(), contentHash);
  };

  const canGenerateHash = imageFile && text.trim() && !isGeneratingHash;
  const canCreatePost = imageFile && text.trim() && contentHash && !disabled;

  return (
    <Card className="mb-6">
      <Space direction="vertical" size="large" className="w-full">
        <div>
          <Title level={4} className="mb-4">Create Your NFT Post</Title>
          
          {/* Step 1: Upload Image */}
          <div className="mb-6">
            <Text strong className="block mb-2">Step 1: Upload Image</Text>
            <Dragger {...uploadProps} className="mb-4">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag image to this area to upload</p>
              <p className="ant-upload-hint">
                Support for single image upload. Max size: 10MB
              </p>
            </Dragger>
          </div>

          {/* Step 2: Enter Text */}
          <div className="mb-6">
            <Text strong className="block mb-2">Step 2: Enter Post Text</Text>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your post content here..."
              rows={4}
              maxLength={500}
              showCount
              disabled={disabled}
            />
          </div>

          {/* Step 3: Generate Hash */}
          <div className="mb-6">
            <Text strong className="block mb-2">Step 3: Generate Content Hash</Text>
            <Space direction="vertical" className="w-full">
              <Button
                type="primary"
                onClick={generateHash}
                loading={isGeneratingHash}
                disabled={!canGenerateHash || disabled}
                icon={<PictureOutlined />}
              >
                Generate Unique Hash
              </Button>
              
              {isGeneratingHash && (
                <Progress percent={50} status="active" showInfo={false} />
              )}
              
              {contentHash && (
                <Alert
                  message="Content Hash Generated"
                  description={
                    <div>
                      <Text className="text-xs">Hash: </Text>
                      <Text code className="text-xs break-all">{contentHash}</Text>
                      <br />
                      <Text className="text-xs text-gray-500 mt-1">
                        This hash ensures identical content generates the same NFT
                      </Text>
                    </div>
                  }
                  type="success"
                  showIcon
                />
              )}
            </Space>
          </div>

          {/* Step 4: Create Post */}
          <div>
            <Text strong className="block mb-2">Step 4: Create NFT</Text>
            <Button
              type="primary"
              size="large"
              onClick={handleCreatePost}
              disabled={!canCreatePost}
              className="w-full"
            >
              Create NFT Post
            </Button>
          </div>
        </div>
      </Space>
    </Card>
  );
};