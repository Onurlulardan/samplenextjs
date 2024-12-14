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
    title: 'category',
    dataIndex: 'parentcategory',
    key: 'categoryParentId',
    type: 'Select',
    sorter: true,
    relationModel: 'category',
    isRequired: false,
    render: (text, record) => {
      return record['parentcategory'] ? record['parentcategory']['name'] : null;
    },

    filterDropdown: (props) => textFilterDropdown(props, 'CategoryParentId'),
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
