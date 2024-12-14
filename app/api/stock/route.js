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
      columnName: 'productId',
      relationModel: 'product',
      relationModelKey: 'name',
      isSelfRelation: false,
      relationType: '1:1',
    },
    {
      columnName: 'product',
      relationModel: 'product',
      relationModelKey: 'name',
      isSelfRelation: false,
      relationType: '1:1',
    },
  ];

  const columnsData = [
    { columnName: 'id', columnType: 'Int', primaryKey: true },
    { columnName: 'quantity', columnType: 'Int', primaryKey: false },
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
      const result = await prisma.stock.findUnique({
        where: { id: idCondition },

        include: {
          product: true,
        },
      });
      if (result) {
        return new Response(JSON.stringify(result), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'stock not found' }), {
          status: 404,
        });
      }
    } else {
      const results = await prisma.stock.findMany({
        skip,
        take,
        orderBy,
        where,

        include: {
          product: true,
        },
      });
      const totalCount = await prisma.stock.count({ where });
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
    return new Response(JSON.stringify({ error: 'Error fetching stock' }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const postData = await req.json();

    const newStock = await prisma.stock.create({
      data: {
        ...postData,
      },
    });
    return new Response(JSON.stringify(newStock), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating stock' }), {
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

    const existingRecord = await prisma.stock.findUnique({
      where: { id: idCondition },
    });

    if (!existingRecord) {
      return new Response(JSON.stringify({ error: 'stock not found' }), {
        status: 404,
      });
    }

    const updatedStock = await prisma.stock.update({
      where: { id: idCondition },
      data: {
        ...putData,
      },
    });

    return new Response(JSON.stringify(updatedStock), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating stock' }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const idCondition = Number(id);

    const existingRecord = await prisma.stock.findUnique({
      where: { id: idCondition },
    });

    await prisma.stock.delete({
      where: { id: idCondition },
    });
    return new Response(
      JSON.stringify({ message: 'stock deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting stock' }), {
      status: 500,
    });
  }
}
