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
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    type: 'Float',
    sorter: true,
    relationModel: '',
    isRequired: true,
    render: (text, record) => {
      return getDisplayText(text);
    },

    filterDropdown: (props) => textFilterDropdown(props, 'Price'),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: false,
  },

  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    type: 'DateTime',
    sorter: true,
    relationModel: '',
    isRequired: true,
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
    title: 'category',
    dataIndex: 'category.name',
    key: 'categorys',
    type: 'MultiSelect',
    sorter: true,
    relationModel: 'category',
    isRequired: false,
    render: (text, record) => {
      const selectedValues = record['categorys']
        ?.map((item) => item['name'])
        .join(', ');
      return getDisplayText(selectedValues || null);
    },

    filterDropdown: (props) => textFilterDropdown(props, 'Categorys'),
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
