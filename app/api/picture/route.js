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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

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
      relationType: '1:N',
    },
    {
      columnName: 'product',
      relationModel: 'product',
      relationModelKey: 'name',
      isSelfRelation: false,
      relationType: '1:N',
    },
  ];

  const columnsData = [
    { columnName: 'id', columnType: 'Int', primaryKey: true },
    { columnName: 'picture', columnType: 'File', primaryKey: false },
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
      const result = await prisma.picture.findUnique({
        where: { id: idCondition },

        include: {
          product: true,
        },
      });
      if (result) {
        return new Response(JSON.stringify(result), { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: 'picture not found' }), {
          status: 404,
        });
      }
    } else {
      const results = await prisma.picture.findMany({
        skip,
        take,
        orderBy,
        where,

        include: {
          product: true,
        },
      });
      const totalCount = await prisma.picture.count({ where });
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
    return new Response(JSON.stringify({ error: 'Error fetching picture' }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const postData = await req.json();

    const savedFiles = {};
    if (postData.files && Array.isArray(postData.files)) {
      const fileUrls = await Promise.all(
        postData.files.map(async (file) => {
          return await uploadBase64ToUploads(file);
        })
      );
      savedFiles['picture'] = fileUrls.join(',');
    }
    delete postData.files;

    const newPicture = await prisma.picture.create({
      data: {
        ...postData,

        ...savedFiles,
      },
    });
    return new Response(JSON.stringify(newPicture), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error creating picture' }), {
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

    const existingRecord = await prisma.picture.findUnique({
      where: { id: idCondition },
    });

    if (!existingRecord) {
      return new Response(JSON.stringify({ error: 'picture not found' }), {
        status: 404,
      });
    }

    const savedFiles = {};
    if (putData.files && Array.isArray(putData.files)) {
      if (existingRecord['picture']) {
        const oldFiles = existingRecord['picture'].split(',');
        await Promise.all(
          oldFiles.map(async (oldFile) => {
            const oldFileName = oldFile.split('/').pop();
            const oldFilePath = path.join(
              process.cwd(),
              'uploads',
              oldFileName
            );
            if (fs.existsSync(oldFilePath)) {
              await fs.promises.unlink(oldFilePath);
            }
          })
        );
      }

      const fileUrls = await Promise.all(
        putData.files.map(async (file) => {
          return await uploadBase64ToUploads(file);
        })
      );
      savedFiles['picture'] = fileUrls.join(',');
    }
    delete putData.files;

    const updatedPicture = await prisma.picture.update({
      where: { id: idCondition },
      data: {
        ...putData,

        ...savedFiles,

        ...(putData.productId
          ? {
              productId: putData.productId,
            }
          : {
              productId: {
                disconnect: true,
              },
            }),
      },
    });

    return new Response(JSON.stringify(updatedPicture), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error updating picture' }), {
      status: 500,
    });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const idCondition = Number(id);

    const existingRecord = await prisma.picture.findUnique({
      where: { id: idCondition },
    });

    if (existingRecord) {
      await deleteAssociatedFiles(existingRecord);
    }

    await prisma.picture.delete({
      where: { id: idCondition },
    });
    return new Response(
      JSON.stringify({ message: 'picture deleted successfully' }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error deleting picture' }), {
      status: 500,
    });
  }
}
