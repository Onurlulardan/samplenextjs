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

const ProductForm = ({ record, onClose, fetchData }) => {
  const [form] = Form.useForm();
  const [relationOptions, setRelationOptions] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (record) {
      const formValues = { ...record };

      formValues['date'] = record.date ? dayjs(record.date) : null;

      formValues['categorys'] = record.categorys.map((item) => item.id);

      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
    }
  }, [record]);

  const fetchRelationData = async () => {
    setIsLoading(true);

    try {
      const responses = await Promise.all([fetch(`/api/category`)]);

      const relationOptionsData = {};
      const columns = [{ dataIndex: 'categorys', relationModelKey: 'name' }];

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
      const data = {
        ...values,
      };

      const url = record ? `/api/product?id=${record.id}` : `/api/product`;
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
        label="Name"
        name="name"
        valuePropName="value"
        rules={[{ required: true, message: 'Please enter Name' }]}
      >
        <Input placeholder="Name" />
      </Form.Item>

      <Form.Item
        label="Price"
        name="price"
        valuePropName="value"
        rules={[{ required: true, message: 'Please enter Price' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Price"
          step="0.01"
        />
      </Form.Item>

      <Form.Item
        label="Date"
        name="date"
        valuePropName="value"
        rules={[{ required: true, message: 'Please enter Date' }]}
      >
        <DatePicker showTime />
      </Form.Item>

      <Form.Item
        label="category"
        name="categorys"
        valuePropName="value"
        rules={[{ required: false, message: 'Please enter category' }]}
      >
        <Select mode="multiple" placeholder="Select category" allowClear>
          {(relationOptions['categorys'] || []).map((option) => (
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

export default ProductForm;
