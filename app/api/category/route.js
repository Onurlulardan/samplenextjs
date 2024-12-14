import { PrismaClient } from '@prisma/client';

import { getToken } from 'next-auth/jwt';

import fs from 'fs';
import path from 'path';
import {
  uploadBase64ToUploads,
  deleteAssociatedFiles,
  populateWhereQuery,
  populateOrderBy,
} from '@/core/helpers/backend';

const prisma = new PrismaClient();

export async function GET(req) {
  if (req.method !== 'GET') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const page = searchParams.get('page');
  const pageSize = searchParams.get('pageSize');
  const sortField = searchParams.get('sortField') || 'id';
  const sortOrder = searchParams.get('sortOrder') || 'asc';
  const filterField = searchParams.get('filterField');
  const filterValue = searchParams.get('filterValue');

  let skip, take;
  if (page && pageSize) {
    skip = (parseInt(page) - 1) * parseInt(pageSize);
    take = parseInt(pageSize);
  }

  const relationColumnsData = [
    {
      columnName: 'products',
      relationModel: 'product',
      relationModelKey: 'name',
      isSelfRelation: false,
      relationType: 'N:N',
    },
    {
      columnName: 'categoryParentId',
      relationModel: 'category',
      relationModelKey: 'name',
      isSelfRelation: true,
      relationType: '1:N',
    },
    {
      columnName: 'parentcategory',
      relationModel: 'category',
      relationModelKey: 'name',
      isSelfRelation: true,
      relationType: '1:N',
    },
    {
      columnName: 'childrencategory',
      relationModel: 'category',
      relationModelKey: 'name',
      isSelfRelation: true,
      relationType: '1:N',
    },
  ];

  const columnsData = [
    { columnName: 'id', columnType: 'Int', primaryKey: true },
    { columnName: 'name', columnType: 'String', primaryKey: false },
  ];

  const where = populateWhereQuery(
    columnsData,
    relationColumnsData,
    Object.fromEntries(searchParams)
  );
  const orderBy = populateOrderBy(
    columnsData,
    relationColumnsData,
    Object.fromEntries(searchParams)
  );

  const idCondition = Number(id);

  try {
    if (id) {
      const result = await prisma.category.findUnique({
        where: { id: idCondition },

        include: {
          products: true,

          parentcategory: true,

          childrencategory: true,
        },
      });
      if (result) {
        return new Response(JSON.stringify(result), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'category not found' }), {
          status: 404,
        });
      }
    } else {
      const results = await prisma.category.findMany({
        skip,
        take,
        orderBy,
        where,

        include: {
          products: true,

          parentcategory: true,

          childrencategory: true,
        },
      });
      const totalCount = await prisma.category.count({ where });
      return new Response(
        JSON.stringify({
          data: results,
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: totalCount,
          },
        }),
        { status: 200 }
      );
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error fetching category' }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const postData = await req.json();

    const newCategory = await prisma.category.create({
      data: {
        ...postData,

        ...(postData.products?.length
          ? {
              products: {
                connect: postData.products.map((item) => ({ id: item })),
              },
            }
          : {}),

        categoryParentId: postData.categoryParentId || null,
      },
    });
    return new Response(JSON.stringify(newCategory), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating category' }), {
      status: 500,
    });
  }
}

export async function PUT(req) {
  try {
    const putData = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const idCondition = Number(id);

    const existingRecord = await prisma.category.findUnique({
      where: { id: idCondition },
    });

    if (!existingRecord) {
      return new Response(JSON.stringify({ error: 'category not found' }), {
        status: 404,
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: idCondition },
      data: {
        ...putData,

        ...(putData.products?.length
          ? {
              products: {
                set: putData.products.map((item) => ({ id: item })),
              },
            }
          : {
              products: {
                set: [],
              },
            }),

        categoryParentId: putData.categoryParentId || null,
      },
    });

    return new Response(JSON.stringify(updatedCategory), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating category' }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const idCondition = Number(id);

    const existingRecord = await prisma.category.findUnique({
      where: { id: idCondition },
    });

    await prisma.category.delete({
      where: { id: idCondition },
    });
    return new Response(
      JSON.stringify({ message: 'category deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting category' }), {
      status: 500,
    });
  }
}
