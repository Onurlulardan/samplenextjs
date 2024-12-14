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
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    type: 'String',
    sorter: true,
    relationModel: '',
    isRequired: true,
    render: (text, record) => {
      return getDisplayText(text);
    },

    filterDropdown: (props) => textFilterDropdown(props, 'Name'),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: false,
  },

  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    type: 'String',
    sorter: true,
    relationModel: '',
    isRequired: true,
    render: (text, record) => {
      return getDisplayText(text);
    },

    filterDropdown: (props) => textFilterDropdown(props, 'Email'),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: false,
  },

  {
    title: 'Password',
    dataIndex: 'password',
    key: 'password',
    type: 'String',
    sorter: true,
    relationModel: '',
    isRequired: true,
    render: (text, record) => {
      return getDisplayText(text);
    },

    filterDropdown: (props) => textFilterDropdown(props, 'Password'),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: false,
  },

  {
    title: 'Active',
    dataIndex: 'active',
    key: 'active',
    type: 'Boolean',
    sorter: true,
    relationModel: '',
    isRequired: true,
    render: (text, record) => {
      return record['active'] ? (
        <CheckCircleOutlined style={{ color: 'green' }} />
      ) : (
        <CloseCircleOutlined style={{ color: 'red' }} />
      );
    },

    filterDropdown: booleanFilterDropdown,
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: false,
  },

  {
    title: 'CreatedAt',
    dataIndex: 'createdAt',
    key: 'createdAt',
    type: 'createdAt',
    sorter: true,
    relationModel: '',
    isRequired: false,
    render: (text, record) => {
      return text
        ? new Date(text).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : null;
    },

    filterDropdown: dateFilterDropdown,
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: false,
  },

  {
    title: 'UpdatedAt',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    type: 'updatedAt',
    sorter: true,
    relationModel: '',
    isRequired: false,
    render: (text, record) => {
      return text
        ? new Date(text).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : null;
    },

    filterDropdown: dateFilterDropdown,
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
