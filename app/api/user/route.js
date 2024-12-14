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

  const relationColumnsData = [];

  const columnsData = [
    { columnName: 'id', columnType: 'UUID', primaryKey: true },
    { columnName: 'name', columnType: 'String', primaryKey: false },
    { columnName: 'email', columnType: 'String', primaryKey: false },
    { columnName: 'password', columnType: 'String', primaryKey: false },
    { columnName: 'active', columnType: 'Boolean', primaryKey: false },
    { columnName: 'createdAt', columnType: 'createdAt', primaryKey: false },
    { columnName: 'updatedAt', columnType: 'updatedAt', primaryKey: false },
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

  const idCondition = id;

  try {
    if (id) {
      const result = await prisma.user.findUnique({
        where: { id: idCondition },
      });
      if (result) {
        return new Response(JSON.stringify(result), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'user not found' }), {
          status: 404,
        });
      }
    } else {
      const results = await prisma.user.findMany({
        skip,
        take,
        orderBy,
        where,
      });
      const totalCount = await prisma.user.count({ where });
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
    return new Response(JSON.stringify({ error: 'Error fetching user' }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const postData = await req.json();

    const newUser = await prisma.user.create({
      data: {
        ...postData,
      },
    });
    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating user' }), {
      status: 500,
    });
  }
}

export async function PUT(req) {
  try {
    const putData = await req.json();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const idCondition = id;

    const existingRecord = await prisma.user.findUnique({
      where: { id: idCondition },
    });

    if (!existingRecord) {
      return new Response(JSON.stringify({ error: 'user not found' }), {
        status: 404,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: idCondition },
      data: {
        ...putData,
      },
    });

    return new Response(JSON.stringify(updatedUser), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating user' }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const idCondition = id;

    const existingRecord = await prisma.user.findUnique({
      where: { id: idCondition },
    });

    await prisma.user.delete({
      where: { id: idCondition },
    });
    return new Response(
      JSON.stringify({ message: 'user deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting user' }), {
      status: 500,
    });
  }
}
