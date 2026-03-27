import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
});

export async function seedPackages() {
  const packages = [
    { id: 1, displayAmount: 650, totalAmount: 675, monthlyPayment: 112.5, netAmount: 650 },
    { id: 2, displayAmount: 1050, totalAmount: 1080, monthlyPayment: 180, netAmount: 1050 },
    { id: 3, displayAmount: 1300, totalAmount: 1350, monthlyPayment: 225, netAmount: 1300 },
    { id: 4, displayAmount: 1500, totalAmount: 1530, monthlyPayment: 255, netAmount: 1500 },
    { id: 5, displayAmount: 2600, totalAmount: 2700, monthlyPayment: 450, netAmount: 2600 },
    { id: 6, displayAmount: 5150, totalAmount: 5400, monthlyPayment: 900, netAmount: 5150 },
    { id: 7, displayAmount: 7700, totalAmount: 8100, monthlyPayment: 1350, netAmount: 7700 }
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: pkg.id },
      update: pkg,
      create: pkg
    });
  }
  
  console.log('✅ Packages seeded:', packages.length);
}
