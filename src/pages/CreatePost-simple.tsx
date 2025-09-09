import React, { useState } from 'react';
import { Card, Form, Input, Upload, Button, message, Typography } from 'antd';
import { InboxOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreatePost: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/*',
    beforeUpload: (file) => {
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
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setImageFile(null);
    },
  };

  const handleSubmit = async (_values: { textContent: string }) => {
    if (!imageFile) {
      message.error('Please select an image');
      return;
    }

    setLoading(true);
    try {
      // Simulate NFT creation process
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
          Upload an image and add text to create a unique NFT. Same content will generate the same token ID.
        </Paragraph>
      </div>

      <Card className="shadow-lg">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6"
        >
          <Form.Item
            label="Upload Image"
            required
            className="mb-6"
          >
            <Dragger {...uploadProps} className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-4xl text-blue-500" />
              </p>
              <p className="ant-upload-text text-lg">
                Click or drag image to this area to upload
              </p>
              <p className="ant-upload-hint text-gray-500">
                Support for single image upload. Maximum size: 10MB
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item
            name="textContent"
            label="Post Content"
            rules={[
              { required: true, message: 'Please enter your post content' },
              { min: 10, message: 'Content must be at least 10 characters' },
              { max: 1000, message: 'Content must be less than 1000 characters' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Write your post content here... This will be part of your NFT metadata."
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
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              {loading ? 'Creating NFT...' : 'Create NFT'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePost;