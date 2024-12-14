import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Kullanıcı mevcut mu kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'Bu email zaten kayıtlı.' }),
        {
          status: 400,
        }
      );
    }

    // Yeni kullanıcı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password,
        active: false,
      },
    });

    return new Response(JSON.stringify(user), {
      status: 201,
    });
  } catch (error) {
    console.error('Kayıt olurken hata:', error);
    return new Response(
      JSON.stringify({ message: 'Kayıt olurken bir hata oluştu.' }),
      {
        status: 500,
      }
    );
  }
}
