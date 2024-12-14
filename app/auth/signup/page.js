'use client';

import {
  Form,
  Input,
  Button,
  Typography,
  message,
  ConfigProvider,
  theme,
} from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const { Title, Text } = Typography;
const { defaultAlgorithm, darkAlgorithm } = theme;

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
    }
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        password: values.password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      message.success('Sign up successful! Redirecting to login page...');
      router.push('/auth/signin');
    } else {
      message.error(data.message || 'Sign up failed!');
    }
  };

  const themeConfig = {
    token: {
      colorPrimary: '#1890ff',
      colorBgLayout: isDarkMode ? '#141414' : '#fff',
      colorText: isDarkMode ? '#fff' : '#000',
      colorBorder: isDarkMode ? '#555' : '#d9d9d9',
      colorBgContent: isDarkMode ? '#2B2A2AFF' : '#E6E5E5FF',
    },
    algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <div
        style={{
          maxWidth: '380px',
          margin: '100px auto',
          border: `1px solid ${themeConfig.token.colorBorder}`,
          padding: '20px',
          borderRadius: '20px',
          backgroundColor: themeConfig.token.colorBgLayout,
          color: themeConfig.token.colorText,
        }}
      >
        <div style={{ margin: '10px 0' }}>
          <Title level={2} style={{ color: themeConfig.token.colorText }}>
            Sign Up
          </Title>
          <Text style={{ color: themeConfig.token.colorText }}>
            Already have an account? <Link href={'/auth/signin'}>Login</Link>
          </Text>
        </div>
        <Form name="signup" layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter your name!' }]}
            style={{ color: themeConfig.token.colorText }}
          >
            <Input
              placeholder="Name"
              style={{ color: themeConfig.token.colorText }}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                type: 'email',
                message: 'Please enter a valid email address!',
              },
            ]}
            style={{ color: themeConfig.token.colorText }}
          >
            <Input
              placeholder="Email"
              style={{ color: themeConfig.token.colorText }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter your password!' },
              {
                min: 8,
                message: 'Password must be at least 8 characters long',
              },
              {
                pattern: /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/,
                message:
                  'Password must contain at least one uppercase letter, one lowercase letter, and one number',
              },
            ]}
            style={{ color: themeConfig.token.colorText }}
          >
            <Input.Password
              placeholder="Password"
              style={{ color: themeConfig.token.colorText }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ width: '100%' }}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      </div>
    </ConfigProvider>
  );
}
