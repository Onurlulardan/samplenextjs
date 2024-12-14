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
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    type: 'Int',
    sorter: true,
    relationModel: '',
    isRequired: true,
    render: (text, record) => {
      return getDisplayText(text);
    },

    filterDropdown: (props) => textFilterDropdown(props, 'Quantity'),
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
