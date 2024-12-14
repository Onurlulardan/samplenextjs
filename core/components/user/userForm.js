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

const UserForm = ({ record, onClose, fetchData }) => {
  const [form] = Form.useForm();
  const [relationOptions, setRelationOptions] = useState({});

  useEffect(() => {
    if (record) {
      const formValues = { ...record };

      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
    }
  }, [record]);

  const onFinish = async (values) => {
    try {
      const data = {
        ...values,
      };

      const url = record ? `/api/user?id=${record.id}` : `/api/user`;
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
        label="Email"
        name="email"
        valuePropName="value"
        rules={[{ required: true, message: 'Please enter Email' }]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        valuePropName="value"
        rules={[{ required: true, message: 'Please enter Password' }]}
      >
        <Input placeholder="Password" />
      </Form.Item>

      <Form.Item
        label="Active"
        name="active"
        valuePropName="checked"
        rules={[{ required: true, message: 'Please enter Active' }]}
      >
        <Checkbox>Active</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserForm;
