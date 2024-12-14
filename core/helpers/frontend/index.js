import { Input, Checkbox, DatePicker, Button, Image, Drawer } from 'antd';
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  PictureOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

const { RangePicker } = DatePicker;

export const FileDrawer = ({ files, title }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <>
      <Button icon={<FileOutlined />} onClick={openDrawer}>
        Dosyaları Gör
      </Button>
      <Drawer
        title={`${title} Dosyaları`}
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={700}
      >
        <div>
          {files.map((file, index) => (
            <div
              key={index}
              style={{
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <FileOutlined style={{ marginRight: '8px' }} />
              <span style={{ flex: 1 }}>{file}</span>
              <Button
                type="link"
                icon={<DownloadOutlined />}
                href={`/api/downloadFile?fileName=${file}`}
                target="_blank"
                download
              >
                İndir
              </Button>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  );
};

export const ContentDrawer = ({ content, title }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <>
      <Button icon={<EyeOutlined />} onClick={openDrawer}>
        Görüntüle
      </Button>
      <Drawer
        title={`${title} İçeriği`}
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={700}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </Drawer>
    </>
  );
};

export const ImageDrawer = ({ images, title }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <>
      <Button icon={<PictureOutlined />} onClick={openDrawer}>
        Resimleri Gör
      </Button>
      <Drawer
        title={`${title} Resimleri`}
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={700}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {images.map((url, index) => (
            <Image
              key={index}
              width={100}
              src={`/api/getImage?fileName=${url}`}
              alt={`Image ${index + 1}`}
              fallback="/nullimg.png"
              style={{ marginRight: '10px' }}
            />
          ))}
        </div>
      </Drawer>
    </>
  );
};

export const booleanFilterDropdown = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
}) => (
  <div style={{ padding: 8 }}>
    <Checkbox
      onChange={(e) => {
        setSelectedKeys(e.target.checked ? ['true'] : ['false']);
        confirm();
      }}
      checked={selectedKeys[0] === 'true'}
    >
      <CheckCircleOutlined style={{ color: 'green' }} />
    </Checkbox>
    <Checkbox
      onChange={(e) => {
        setSelectedKeys(e.target.checked ? ['false'] : []);
        confirm();
      }}
      checked={selectedKeys[0] === 'false'}
    >
      <CloseCircleOutlined style={{ color: 'red' }} />
    </Checkbox>
    <Button
      onClick={() => {
        clearFilters();
        confirm();
      }}
      size="small"
      style={{ width: 90, marginTop: 8 }}
    >
      Reset
    </Button>
  </div>
);

export const dateFilterDropdown = ({
  setSelectedKeys,
  confirm,
  clearFilters,
}) => (
  <div style={{ padding: 8 }}>
    <RangePicker
      onChange={(dates, dateStrings) => {
        setSelectedKeys(dates ? [dateStrings.join(',')] : []);
      }}
      style={{ marginBottom: 8, display: 'block' }}
    />
    <Button
      type="primary"
      onClick={() => confirm()}
      size="small"
      style={{ width: 90, marginRight: 8 }}
    >
      Search
    </Button>
    <Button
      onClick={() => {
        clearFilters();
        confirm();
      }}
      size="small"
      style={{ width: 90 }}
    >
      Reset
    </Button>
  </div>
);

export const textFilterDropdown = (
  { setSelectedKeys, selectedKeys, confirm, clearFilters },
  columnTitle
) => (
  <div style={{ padding: 8 }}>
    <Input
      placeholder={`Search ${columnTitle}`}
      value={selectedKeys[0]}
      onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
      onPressEnter={() => confirm()}
      style={{ marginBottom: 8, display: 'block' }}
    />
    <Button
      type="primary"
      onClick={() => confirm()}
      size="small"
      style={{ width: 90, marginRight: 8 }}
    >
      Search
    </Button>
    <Button
      onClick={() => {
        clearFilters();
        confirm();
      }}
      size="small"
      style={{ width: 90 }}
    >
      Reset
    </Button>
  </div>
);
