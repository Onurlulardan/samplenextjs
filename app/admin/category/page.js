'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Tooltip, Popconfirm, Drawer, message } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import columns from '@/core/components/category/columns';
import CategoryForm from '@/core/components/category/categoryForm';

const Page = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openPopconfirmId, setOpenPopconfirmId] = useState(null);
  const [visibleDrawer, setVisibleDrawer] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const fetchData = async (params = {}) => {
    setLoading(true);
    try {
      const { pagination, sortField, sortOrder, filters } = params;
      const sortQuery = sortField
        ? `&sortField=${sortField}&sortOrder=${sortOrder}`
        : '';

      const filterQuery = filters
        ? filters
            .map(
              (filter, index) =>
                `&filterField_${index}=${filter.field}&filterValue_${index}=${filter.value}`
            )
            .join('')
        : '';

      const response = await fetch(
        `/api/category?page=${pagination?.current || 1}&pageSize=${pagination?.pageSize || 10}${sortQuery}${filterQuery}`
      );

      const result = await response.json();
      setData(result.data);
      setPagination({
        current: result.pagination.page,
        pageSize: result.pagination.pageSize,
        total: result.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData({ pagination });
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    const filterEntries = Object.entries(filters).reduce(
      (acc, [field, value]) => {
        if (value && value.length > 0) {
          acc.push({ field, value: value[0] });
        }
        return acc;
      },
      []
    );

    fetchData({
      pagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
      filters: filterEntries,
    });
  };

  const confirmPopconfirm = async (record) => {
    try {
      const response = await fetch(`/api/category?id=${record.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        message.success('Record deleted successfully');
        fetchData({ pagination });
      } else {
        message.error('Failed to delete record');
      }
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Error deleting record');
    }
  };

  const handleOpenPopconfirmChange = (newOpen, record) => {
    setOpenPopconfirmId(newOpen ? record.id : null);
  };

  const showDrawer = (record = null) => {
    setEditingRecord(record);
    setVisibleDrawer(true);
  };

  const handleDrawerClose = () => {
    setVisibleDrawer(false);
    setEditingRecord(null);
  };

  const handleAdd = () => showDrawer();

  const renderActions = (record) => (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Popconfirm
        title="Are you sure you want to delete this record?"
        onConfirm={() => confirmPopconfirm(record)}
        okText="Yes"
        cancelText="No"
        okType="danger"
        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        open={openPopconfirmId === record.id}
        onOpenChange={(newOpen) => handleOpenPopconfirmChange(newOpen, record)}
      >
        <Tooltip title="Delete">
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            shape="circle"
          />
        </Tooltip>
      </Popconfirm>
      <Tooltip title="Edit">
        <Button
          type="primary"
          onClick={() => showDrawer(record)}
          icon={<EditOutlined />}
          shape="circle"
        />
      </Tooltip>
    </div>
  );

  const actionColumn = {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    render: (_, record) => renderActions(record),
    width: '20px',
  };

  return (
    <>
      <h1>Category List</h1>
      <Tooltip title="Add New">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ margin: '16px 0' }}
          onClick={handleAdd}
          shape="circle"
        />
      </Tooltip>
      <Table
        columns={[actionColumn, ...columns]}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 'max-content' }}
        onRow={(record) => {
          return {
            onDoubleClick: () => {
              showDrawer(record);
            },
          };
        }}
      />
      <Drawer
        title={editingRecord ? 'Edit Record' : 'Add New Record'}
        width={720}
        onClose={handleDrawerClose}
        open={visibleDrawer}
        style={{ paddingBottom: 80 }}
      >
        <CategoryForm
          record={editingRecord}
          onClose={handleDrawerClose}
          fetchData={() => fetchData({ pagination })}
        />
      </Drawer>
    </>
  );
};

export default Page;
