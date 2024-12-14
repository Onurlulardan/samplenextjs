import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  message,
  Checkbox,
  DatePicker,
} from 'antd';

import { UploadOutlined, InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const PictureForm = ({ record, onClose, fetchData }) => {
  const [form] = Form.useForm();
  const [relationOptions, setRelationOptions] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const [file, setFile] = useState([]);

  const uploadProps = {
    multiple: true,
    onRemove: (file) => {
      setFile((prevFiles) => prevFiles.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      setFile((prevFiles) => [...prevFiles, file]);
      return false;
    },
    fileList: file ? file : [],
  };

  useEffect(() => {
    if (record) {
      const formValues = { ...record };

      formValues['productId'] = record.product.id;

      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
    }
  }, [record]);

  const fetchRelationData = async () => {
    setIsLoading(true);

    try {
      const responses = await Promise.all([fetch(`/api/product`)]);

      const relationOptionsData = {};
      const columns = [{ dataIndex: 'productId', relationModelKey: 'name' }];

      await Promise.all(
        responses.map(async (response, index) => {
          if (response.ok) {
            const data = await response.json();
            const options = data.data.map((item) => ({
              label: item[columns[index].relationModelKey],
              value: item.id,
            }));
            relationOptionsData[columns[index].dataIndex] = options;
          } else {
            console.error('Error fetching related data:', response.statusText);
            message.error(
              `An error occurred while loading related data: ${response.statusText}`
            );
          }
        })
      );

      setRelationOptions((prevOptions) => ({
        ...prevOptions,
        ...relationOptionsData,
      }));
    } catch (error) {
      console.error('Error fetching related data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationData();
  }, []);

  const onFinish = async (values) => {
    try {
      const base64Files = await Promise.all(
        file.map((f) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const blob = f.originFileObj || f;
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
          });
        })
      );

      const data = {
        ...values,
        files: base64Files,
      };

      const url = record ? `/api/picture?id=${record.id}` : `/api/picture`;
      const method = record ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        message.success(`Successfully ${record ? 'updated' : 'added'}`);
        form.resetFields();

        setFile([]);

        onClose();

        await fetchRelationData();

        fetchData();
      } else {
        const data = await response.json();
        message.error(data.error || 'An error occurred, please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('An error occurred, please try again.');
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      key={record ? record.id : 'new'}
    >
      <Form.Item
        label="Picture"
        name="picture"
        valuePropName="value"
        rules={[{ required: true, message: 'Please enter Picture' }]}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Drag the file here or click</p>
          <p className="ant-upload-hint">
            Only one file can be uploaded. Supported types: .png, .jpg, .jpeg,
            .pdf, etc.
          </p>
        </Dragger>
      </Form.Item>

      <Form.Item
        label="product"
        name="productId"
        valuePropName="value"
        rules={[{ required: true, message: 'Please enter product' }]}
      >
        <Select placeholder="Select product" allowClear>
          {(relationOptions['productId'] || []).map((option) => (
            <Select.Option
              key={option.value}
              value={option.value}
              loading={isLoading}
            >
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PictureForm;
