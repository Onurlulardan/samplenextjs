'use client';

import {
  Layout,
  Menu,
  Button,
  Spin,
  ConfigProvider,
  theme,
  Avatar,
  Dropdown,
  Typography,
} from 'antd';
import Link from 'next/link';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  SunOutlined,
  MoonOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  ZhihuOutlined,
  CompressOutlined,
  ExpandOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { menuItems } from '@/data/menuItems';

const { Header, Content, Footer, Sider } = Layout;
const { defaultAlgorithm, darkAlgorithm } = theme;

const menuItemsWithLinks = menuItems.map((item) => ({
  key: item.key,
  label: <Link href={item.link}>{item.label}</Link>,
}));

export default function AdminLayout({ children }) {
  return (
    <SessionProvider>
      <AuthGuard>
        <AdminContent>{children}</AdminContent>
      </AuthGuard>
    </SessionProvider>
  );
}

function AuthGuard({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return children;
}

function AdminContent({ children }) {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [showItem, setShowItem] = useState(false);

  const themeConfig = {
    token: {
      colorPrimary: '#1890ff',
      colorBgLayout: isDarkMode ? '#141414' : '#fff',
      colorText: isDarkMode ? '#fff' : '#000',
      colorBgSider: isDarkMode ? '#141414' : '#fff',
      colorBgContent: isDarkMode ? '#2B2A2AFF' : '#E6E5E5FF',
    },
    algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
  };

  useEffect(() => {
    const windowSize = window.innerWidth;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDarkMode(storedTheme === 'dark');
    }

    if (windowSize < 720 && collapsed === true) {
      setShowItem(true);
    } else if (windowSize > 720) {
      setShowItem(true);
    } else {
      setShowItem(false);
    }
  }, [collapsed]);

  const handleThemeChange = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
  };

  const user = session?.user;
  const avatarSrc = '/avatar.svg';

  const handleLogout = () => {
    signOut({ callbackUrl: process.env.NEXTAUTH_URL });
  };

  const profileMenuItems = [
    {
      key: '1',
      label: (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            minWidth: '200px',
          }}
        >
          <Avatar
            size={44}
            src={avatarSrc}
            style={{ border: `1px solid ${themeConfig.token.colorText}` }}
          />
          <div style={{ paddingLeft: 10 }}>
            <Typography.Title level={5} style={{ marginBottom: 0 }}>
              {user.name}
            </Typography.Title>
            <Typography.Text>{user.email}</Typography.Text>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: '2',
      label: (
        <Link href="/admin/user">
          <SettingOutlined style={{ marginRight: 5 }} /> Settings
        </Link>
      ),
    },
    { type: 'divider' },
    {
      key: '3',
      label: (
        <div onClick={handleLogout} style={{ color: 'red' }}>
          <LogoutOutlined style={{ marginRight: 5 }} /> Log Out
        </div>
      ),
    },
  ];

  const languageMenuItems = [
    {
      key: '1',
      label: 'Türkçe',
    },
    { type: 'divider' },
    {
      key: '2',
      label: 'English',
    },
  ];

  const handleFullScreen = () => {
    if (!fullScreen) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setFullScreen(true);
        })
        .catch((err) => {
          console.error('Fullscreen moduna geçiş başarısız oldu:', err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setFullScreen(false);
        })
        .catch((err) => {
          console.error('Fullscreen modundan çıkış başarısız oldu:', err);
        });
    }
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: '100vh' }} className="adminWrapper">
        <Sider
          className="site-layout-background"
          style={{
            color: themeConfig.token.colorText,
            background: themeConfig.token.colorBgLayout,
          }}
          collapsible={collapsed}
          collapsed={collapsed}
          onCollapse={(collapsed) => setCollapsed(collapsed)}
          collapsedWidth={0}
          breakpoint="md"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          trigger={null}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
              paddingBottom: '10px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                marginTop: '24px',
              }}
            >
              <h1>
                <Link href={'/admin'}>
                  <CodeOutlined />{' '}
                  <span style={{ textDecoration: 'underline' }}>Logo</span>
                </Link>
              </h1>
              <Button
                icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                onClick={handleThemeChange}
                shape="circle"
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                height: '100%',
              }}
            >
              <Menu
                mode="inline"
                defaultSelectedKeys={['1']}
                style={{ borderRight: 0, paddingTop: '20px' }}
                items={menuItemsWithLinks}
              />
            </div>
          </div>
        </Sider>
        <Layout
          style={{
            padding: '0 10px',
            backgroundColor: themeConfig.token.colorBgContent,
          }}
        >
          <Header
            style={{
              padding: '0px 10px',
              background: themeConfig.token.colorBgLayout,
              margin: `${collapsed ? '16px 16px' : '16px 26px'}`,
              borderRadius: '6px',
              color: themeConfig.token.colorText,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <div
                style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
              >
                <Button
                  shape="circle"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                />
                {showItem && (
                  <Dropdown
                    menu={{ items: languageMenuItems }}
                    trigger={['click']}
                  >
                    <Button icon={<ZhihuOutlined />} shape="circle" />
                  </Dropdown>
                )}
              </div>
              <div
                style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
              >
                {showItem && (
                  <Button
                    icon={
                      fullScreen ? <CompressOutlined /> : <ExpandOutlined />
                    }
                    shape="circle"
                    onClick={handleFullScreen}
                  />
                )}
                <Dropdown
                  menu={{ items: profileMenuItems }}
                  trigger={['click']}
                >
                  <Avatar
                    size={44}
                    src={avatarSrc}
                    style={{
                      cursor: 'pointer',
                      border: `1px solid ${themeConfig.token.colorText}`,
                    }}
                  />
                </Dropdown>
              </div>
            </div>
          </Header>
          <Content
            style={{
              margin: `${collapsed ? '10px 16px' : '10px 26px'}`,
              overflow: 'initial',
              color: themeConfig.token.colorText,
              backgroundColor: themeConfig.token.colorBgContent,
            }}
          >
            {children}
          </Content>
          <Footer
            style={{
              textAlign: 'center',
              backgroundColor: themeConfig.token.colorBgContent,
            }}
          >
            Admin Panel ©{new Date().getFullYear()} Created by{' '}
            <Link href={'https://altuntasonur.com/'} target="_blank">
              Onur Altuntaş
            </Link>
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
