import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const uploadBase64ToUploads = async (base64Data) => {
  const match = base64Data.match(/^data:(\w+\/[\w-]+);base64,/);
  if (!match) {
    throw new Error('Geçersiz base64 formatı');
  }

  const mimeType = match[1];
  const supportedTypes = [
    'image',
    'pdf',
    'msword',
    'vnd.openxmlformats-officedocument.wordprocessingml.document',
    'plain',
    'vnd.ms-excel',
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  const typeCategory = mimeType.split('/')[0];
  const extMap = {
    jpeg: 'jpg',
    plain: 'txt',
    'vnd.ms-excel': 'xls',
    'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  };
  const ext = mimeType.split('/')[1];
  const fileExt = extMap[ext] || ext;

  if (
    !supportedTypes.includes(mimeType.split('/')[1]) &&
    !supportedTypes.includes(typeCategory)
  ) {
    throw new Error('Desteklenmeyen dosya türü');
  }

  const buffer = Buffer.from(
    base64Data.replace(/^data:\w+\/[\w-]+;base64,/, ''),
    'base64'
  );
  const uniqueFileName = `${uuidv4()}.${fileExt}`;
  const uploadsDir = path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    await fs.promises.mkdir(uploadsDir);
  }

  const filePath = path.join(uploadsDir, uniqueFileName);

  await fs.promises.writeFile(filePath, buffer);

  return `/uploads/${uniqueFileName}`;
};

export const deleteAssociatedFiles = async (record) => {
  const uploadDirectory = '/uploads';

  Object.keys(record).forEach(async (key) => {
    const value = record[key];

    if (typeof value === 'string' && value.startsWith(uploadDirectory)) {
      const files = value.split(',');
      await Promise.all(
        files.map(async (filePath) => {
          const fullFilePath = path.join(process.cwd(), filePath);
          try {
            if (fs.existsSync(fullFilePath)) {
              await fs.promises.unlink(fullFilePath);
              console.log(`${filePath} dosyası başarıyla silindi.`);
            }
          } catch (error) {
            console.error(`${filePath} dosyasını silerken hata oluştu:`, error);
          }
        })
      );
    }
  });
};

export const generateFilterCondition = (columnType, filterValue) => {
  switch (columnType) {
    case 'Int':
      return { equals: parseInt(filterValue) };
    case 'Boolean':
      return { equals: filterValue.toLowerCase() === 'true' };
    case 'DateTime':
      const [start, end] = filterValue.split(',');
      return { gte: new Date(start), lte: new Date(end) };
    default:
      return { contains: filterValue, mode: 'insensitive' };
  }
};

export const populateWhereQuery = (columns, relationColumnsData, query) => {
  const where = {};

  Object.keys(query).forEach((key) => {
    if (key.startsWith('filterField_')) {
      const index = key.split('_')[1];
      const filterField = query[`filterField_${index}`];
      const filterValue = query[`filterValue_${index}`];

      if (filterField && filterValue) {
        const isRelationField = relationColumnsData.some(
          (column) => filterField === column.columnName
        );

        if (isRelationField) {
          relationColumnsData.forEach((column) => {
            if (filterField === column.columnName) {
              const condition = { contains: filterValue, mode: 'insensitive' };

              if (column.relationType === '1:1') {
                where[column.columnName] = {
                  [column.relationModelKey]: condition,
                };
              } else if (
                column.relationType === '1:N' ||
                column.relationType === 'N:N'
              ) {
                where[column.columnName] = {
                  some: { [column.relationModelKey]: condition },
                };
              }
            }
          });
        } else {
          columns.forEach((col) => {
            if (filterField === col.columnName) {
              if (col.columnType === 'Int') {
                const intValue = parseInt(filterValue);
                if (!isNaN(intValue)) {
                  where[filterField] = { equals: intValue };
                }
              } else if (
                col.columnType === 'Float' ||
                col.columnType === 'Decimal'
              ) {
                const floatValue = parseFloat(filterValue);
                if (!isNaN(floatValue)) {
                  where[filterField] = { equals: floatValue };
                }
              } else if (col.columnType === 'Boolean') {
                where[filterField] = {
                  equals: filterValue.toLowerCase() === 'true',
                };
              } else if (col.columnType === 'DateTime') {
                const [start, end] = filterValue.split(',');
                const startDate = new Date(start);
                const endDate = new Date(end);
                if (!isNaN(startDate) && !isNaN(endDate)) {
                  where[filterField] = {
                    gte: startDate,
                    lte: endDate,
                  };
                }
              } else {
                where[filterField] = {
                  contains: filterValue,
                  mode: 'insensitive',
                };
              }
            }
          });
        }
      }
    }
  });

  return where;
};

export const populateOrderBy = (columns, relationColumnsData, query) => {
  const { sortField, sortOrder } = query;
  let orderBy = {};

  const order = sortOrder === 'ascend' || sortOrder === 'asc' ? 'asc' : 'desc';

  if (sortField) {
    if (sortField.includes('.')) {
      const [relation, field] = sortField.split('.');

      relationColumnsData.forEach((column) => {
        if (
          column.relationModel.toLowerCase() === relation &&
          column.relationModelKey === field &&
          (column.relationType === '1:1' || column.relationType === '1:N')
        ) {
          orderBy[column.columnName] = { [field]: order };
        }
      });
    } else {
      orderBy[sortField] = order;
    }
  }

  if (Object.keys(orderBy).length === 0) {
    const primaryKeyColumn = columns.find((col) => col.primaryKey);
    if (primaryKeyColumn) {
      orderBy[primaryKeyColumn.columnName] = 'asc';
    } else {
      orderBy.id = 'asc';
    }
  }

  return orderBy;
};
