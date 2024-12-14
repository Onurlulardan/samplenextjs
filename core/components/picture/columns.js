import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  ImageDrawer,
  ContentDrawer,
  FileDrawer,
  booleanFilterDropdown,
  dateFilterDropdown,
  textFilterDropdown,
} from '@/core/helpers/frontend';
import { Tooltip } from 'antd';

const columns = [
  {
    title: 'Picture',
    dataIndex: 'picture',
    key: 'picture',
    type: 'File',
    sorter: false,
    relationModel: '',
    isRequired: true,
    render: (text, record) => {
      const fileUrls = record['picture'] ? record['picture'].split(',') : [];
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
      const images = fileUrls.filter((url) =>
        imageExtensions.includes(url.split('.').pop().toLowerCase())
      );
      const nonImages = fileUrls.filter(
        (url) => !imageExtensions.includes(url.split('.').pop().toLowerCase())
      );

      return images.length ? (
        <ImageDrawer images={images} title="Picture" />
      ) : nonImages.length ? (
        <FileDrawer files={nonImages} title="Picture" />
      ) : null;
    },

    filterDropdown: (props) => textFilterDropdown(props, 'Picture'),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: false,
  },

  {
    title: 'product',
    dataIndex: 'product.name',
    key: 'productId',
    type: 'Select',
    sorter: true,
    relationModel: 'product',
    isRequired: true,
    render: (text, record) => {
      return record['product'] ? record['product']['name'] : null;
    },

    filterDropdown: (props) => textFilterDropdown(props, 'ProductId'),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: false,
  },
];

const getDisplayText = (text) => {
  if (typeof text === 'string' && text.length > 50) {
    return (
      <Tooltip title={text}>
        <span>{text.slice(0, 50)}...</span>
      </Tooltip>
    );
  }
  return text;
};

export default columns;
