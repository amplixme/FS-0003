const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

const categories = [
  { name: 'Tecnología', slug: 'tecnologia' },
  { name: 'Diseño', slug: 'diseno' },
  { name: 'Programación', slug: 'programacion' },
  { name: 'DevOps', slug: 'devops' },
  { name: 'Opinión', slug: 'opinion' },
];

async function main() {
  console.log('🌱 Seeding categories...');

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    console.log(`  ✅ Created category: ${category.name}`);
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
