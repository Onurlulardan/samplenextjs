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
      columnName: 'stock',
      relationModel: 'stock',
      relationModelKey: 'quantity',
      isSelfRelation: false,
      relationType: '1:1',
    },
    {
      columnName: 'pictures',
      relationModel: 'picture',
      relationModelKey: 'picture',
      isSelfRelation: false,
      relationType: '1:N',
    },
    {
      columnName: 'categorys',
      relationModel: 'category',
      relationModelKey: 'name',
      isSelfRelation: false,
      relationType: 'N:N',
    },
  ];

  const columnsData = [
    { columnName: 'id', columnType: 'Int', primaryKey: true },
    { columnName: 'name', columnType: 'String', primaryKey: false },
    { columnName: 'price', columnType: 'Float', primaryKey: false },
    { columnName: 'date', columnType: 'DateTime', primaryKey: false },
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
      const result = await prisma.product.findUnique({
        where: { id: idCondition },

        include: {
          stock: true,

          pictures: true,

          categorys: true,
        },
      });
      if (result) {
        return new Response(JSON.stringify(result), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'product not found' }), {
          status: 404,
        });
      }
    } else {
      const results = await prisma.product.findMany({
        skip,
        take,
        orderBy,
        where,

        include: {
          stock: true,

          pictures: true,

          categorys: true,
        },
      });
      const totalCount = await prisma.product.count({ where });
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
    return new Response(JSON.stringify({ error: 'Error fetching product' }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const postData = await req.json();

    const newProduct = await prisma.product.create({
      data: {
        ...postData,

        ...(postData.categorys?.length
          ? {
              categorys: {
                connect: postData.categorys.map((item) => ({ id: item })),
              },
            }
          : {}),
      },
    });
    return new Response(JSON.stringify(newProduct), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating product' }), {
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

    const existingRecord = await prisma.product.findUnique({
      where: { id: idCondition },
    });

    if (!existingRecord) {
      return new Response(JSON.stringify({ error: 'product not found' }), {
        status: 404,
      });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: idCondition },
      data: {
        ...putData,

        ...(putData.categorys?.length
          ? {
              categorys: {
                set: putData.categorys.map((item) => ({ id: item })),
              },
            }
          : {
              categorys: {
                set: [],
              },
            }),
      },
    });

    return new Response(JSON.stringify(updatedProduct), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating product' }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const idCondition = Number(id);

    const existingRecord = await prisma.product.findUnique({
      where: { id: idCondition },
    });

    await prisma.product.delete({
      where: { id: idCondition },
    });
    return new Response(
      JSON.stringify({ message: 'product deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting product' }), {
      status: 500,
    });
  }
}
