'use client';

import { signIn } from 'next-auth/react';
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
import { SmileFilled, SmileOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { defaultAlgorithm, darkAlgorithm } = theme;

export default function SignIn() {
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
    const res = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    setLoading(false);

    if (res?.ok) {
      router.push('/admin');
    } else {
      message.error('Sign in failed: ' + res.error);
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
            Sign In
          </Title>
          <Text style={{ color: themeConfig.token.colorText }}>
            Don't have an account? <Link href={'/auth/signup'}>Sign Up</Link>
          </Text>
        </div>
        <Form
          name="signin"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ remember: true }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email address!' },
              { type: 'email', message: 'Please enter a valid email address!' },
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
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </div>
    </ConfigProvider>
  );
}
