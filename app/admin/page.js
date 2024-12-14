'use client';

import { Typography } from 'antd';

const { Title, Text } = Typography;

export default function AdminHome() {
  return (
    <>
      <Title level={2}>Admin Dashboard</Title>
      <div>
        <Text code={true} style={{ fontSize: 20 }}>
          Hi 👋,
        </Text>
      </div>
      <div>
        <Text code={true} style={{ fontSize: 20 }}>
          Select the one you want to edit from the menu.
        </Text>
      </div>
    </>
  );
}
