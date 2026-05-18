import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { Pool } from 'pg';
import * as argon2 from 'argon2';

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    let adminUser = null;

    if (email && password) {
      adminUser = await prisma.user.findUnique({ where: { email } });
      if (!adminUser) {
        const passwordHash = await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 19456,
          timeCost: 2,
          parallelism: 1,
        });

        adminUser = await prisma.user.create({
          data: {
            email,
            passwordHash,
            role: 'SUPER_ADMIN',
            provider: 'LOCAL',
          },
        });
        console.log(`🔑 Super Admin creado exitosamente: ${email}`);
      } else {
        console.log(`✅ Super Admin ya existe: ${email}`);
      }
    }

    // ─── 1. SEED HARDWARE DATA ─────────────────────────────────────────
    if (!adminUser) {
      console.log('⚠️ No hay adminUser disponible, deteniendo el seed de hardware.');
      return;
    }

    console.log('📦 Sembrando base de datos de hardware con datos reales...');

    // Crear Categorías
    const catComp = await prisma.category.upsert({
      where: { slug: 'componentes' },
      update: {},
      create: { name: 'Componentes', slug: 'componentes' },
    });

    const catCpu = await prisma.category.upsert({
      where: { slug: 'procesadores' },
      update: {},
      create: { name: 'Procesadores', slug: 'procesadores', parentId: catComp.id },
    });

    const catMobo = await prisma.category.upsert({
      where: { slug: 'placas-madre' },
      update: {},
      create: { name: 'Placas Madre', slug: 'placas-madre', parentId: catComp.id },
    });

    const catRam = await prisma.category.upsert({
      where: { slug: 'memorias-ram' },
      update: {},
      create: { name: 'Memorias RAM', slug: 'memorias-ram', parentId: catComp.id },
    });

    const catGpu = await prisma.category.upsert({
      where: { slug: 'tarjetas-graficas' },
      update: {},
      create: { name: 'Tarjetas Gráficas', slug: 'tarjetas-graficas', parentId: catComp.id },
    });

    const catStorage = await prisma.category.upsert({
      where: { slug: 'almacenamiento' },
      update: {},
      create: { name: 'Almacenamiento', slug: 'almacenamiento', parentId: catComp.id },
    });

    const catPsu = await prisma.category.upsert({
      where: { slug: 'fuentes-de-poder' },
      update: {},
      create: { name: 'Fuentes de Poder', slug: 'fuentes-de-poder', parentId: catComp.id },
    });

    const catCase = await prisma.category.upsert({
      where: { slug: 'gabinetes' },
      update: {},
      create: { name: 'Gabinetes', slug: 'gabinetes', parentId: catComp.id },
    });

    // Crear Atributos - Core
    const attrSocket = await prisma.attribute.upsert({
      where: { slug: 'socket' }, update: {},
      create: { name: 'Socket', slug: 'socket', dataType: 'TEXT', isFilterable: true, isRequired: true },
    });

    const attrRamType = await prisma.attribute.upsert({
      where: { slug: 'tipo-de-ram' }, update: {},
      create: { name: 'Tipo de RAM', slug: 'tipo-de-ram', dataType: 'TEXT', isFilterable: true, isRequired: true },
    });

    const attrFormFactor = await prisma.attribute.upsert({
      where: { slug: 'formato' }, update: {},
      create: { name: 'Formato', slug: 'formato', dataType: 'TEXT', isFilterable: true, isRequired: true },
    });

    const attrTdp = await prisma.attribute.upsert({
      where: { slug: 'tdp' }, update: {},
      create: { name: 'TDP', slug: 'tdp', dataType: 'NUMBER', unit: 'W', isFilterable: true, isRequired: true },
    });

    // Crear Atributos - CPU específicos
    const attrCores = await prisma.attribute.upsert({
      where: { slug: 'nucleos' }, update: {},
      create: { name: 'Núcleos', slug: 'nucleos', dataType: 'NUMBER', isFilterable: true, isRequired: true },
    });

    // Crear Atributos - GPU específicos
    const attrVram = await prisma.attribute.upsert({
      where: { slug: 'vram' }, update: {},
      create: { name: 'VRAM', slug: 'vram', dataType: 'NUMBER', unit: 'GB', isFilterable: true, isRequired: true },
    });

    const attrRecommendedPsu = await prisma.attribute.upsert({
      where: { slug: 'psu-recomendada' }, update: {},
      create: { name: 'PSU Recomendada', slug: 'psu-recomendada', dataType: 'NUMBER', unit: 'W', isFilterable: true, isRequired: true },
    });

    // Crear Atributos - RAM específicos
    const attrCapacity = await prisma.attribute.upsert({
      where: { slug: 'capacidad' }, update: {},
      create: { name: 'Capacidad', slug: 'capacidad', dataType: 'NUMBER', unit: 'GB', isFilterable: true, isRequired: true },
    });

    // Crear Atributos - Storage
    const attrStorageType = await prisma.attribute.upsert({
      where: { slug: 'tipo-de-almacenamiento' }, update: {},
      create: { name: 'Tipo de Almacenamiento', slug: 'tipo-de-almacenamiento', dataType: 'TEXT', isFilterable: true, isRequired: true },
    });

    // Crear Atributos - PSU
    const attrWattage = await prisma.attribute.upsert({
      where: { slug: 'potencia' }, update: {},
      create: { name: 'Potencia', slug: 'potencia', dataType: 'NUMBER', unit: 'W', isFilterable: true, isRequired: true },
    });

    const attrCertification = await prisma.attribute.upsert({
      where: { slug: 'certificacion' }, update: {},
      create: { name: 'Certificación', slug: 'certificacion', dataType: 'TEXT', isFilterable: true, isRequired: false },
    });

    // Crear Atributos - Case
    const attrMaxGpuLength = await prisma.attribute.upsert({
      where: { slug: 'largo-maximo-gpu' }, update: {},
      create: { name: 'Largo Máximo GPU', slug: 'largo-maximo-gpu', dataType: 'NUMBER', unit: 'mm', isFilterable: true, isRequired: true },
    });

    // Asignar Atributos a Categorías
    const categoryAttributes = [
      // CPU
      { categoryId: catCpu.id, attributeId: attrSocket.id },
      { categoryId: catCpu.id, attributeId: attrRamType.id },
      { categoryId: catCpu.id, attributeId: attrTdp.id },
      { categoryId: catCpu.id, attributeId: attrCores.id },
      // Motherboard
      { categoryId: catMobo.id, attributeId: attrSocket.id },
      { categoryId: catMobo.id, attributeId: attrRamType.id },
      { categoryId: catMobo.id, attributeId: attrFormFactor.id },
      // RAM
      { categoryId: catRam.id, attributeId: attrRamType.id },
      { categoryId: catRam.id, attributeId: attrCapacity.id },
      // GPU
      { categoryId: catGpu.id, attributeId: attrVram.id },
      { categoryId: catGpu.id, attributeId: attrTdp.id },
      { categoryId: catGpu.id, attributeId: attrRecommendedPsu.id },
      // Storage
      { categoryId: catStorage.id, attributeId: attrStorageType.id },
      { categoryId: catStorage.id, attributeId: attrCapacity.id },
      { categoryId: catStorage.id, attributeId: attrFormFactor.id },
      // PSU
      { categoryId: catPsu.id, attributeId: attrWattage.id },
      { categoryId: catPsu.id, attributeId: attrCertification.id },
      // Case
      { categoryId: catCase.id, attributeId: attrFormFactor.id }, // Supported form factors (e.g., ATX, Micro-ATX)
      { categoryId: catCase.id, attributeId: attrMaxGpuLength.id },
    ];

    for (const ca of categoryAttributes) {
      await prisma.categoryAttribute.upsert({
        where: { categoryId_attributeId: ca },
        update: {},
        create: ca,
      });
    }

    // Crear Productos (CPUs, Motherboards, RAMs)
    const productsData = [
      {
        name: 'AMD Ryzen 5 7600X',
        slug: 'amd-ryzen-5-7600x',
        brand: 'AMD',
        price: 249.99,
        stock: 50,
        categoryId: catCpu.id,
        attributes: [
          { attributeId: attrSocket.id, value: 'AM5' },
          { attributeId: attrRamType.id, value: 'DDR5' },
        ],
      },
      {
        name: 'Intel Core i5-13400F',
        slug: 'intel-core-i5-13400f',
        brand: 'Intel',
        price: 209.99,
        stock: 30,
        categoryId: catCpu.id,
        attributes: [
          { attributeId: attrSocket.id, value: 'LGA1700' },
          { attributeId: attrRamType.id, value: 'DDR4 / DDR5' }, // Soporta ambos, pero pondremos DDR4 genérico para el test
        ],
      },
      {
        name: 'ASUS TUF GAMING B650-PLUS WIFI',
        slug: 'asus-tuf-gaming-b650-plus-wifi',
        brand: 'ASUS',
        price: 199.99,
        stock: 20,
        categoryId: catMobo.id,
        attributes: [
          { attributeId: attrSocket.id, value: 'AM5' },
          { attributeId: attrRamType.id, value: 'DDR5' },
          { attributeId: attrFormFactor.id, value: 'ATX' },
        ],
      },
      {
        name: 'MSI PRO B760-P WIFI DDR4',
        slug: 'msi-pro-b760-p-wifi-ddr4',
        brand: 'MSI',
        price: 149.99,
        stock: 15,
        categoryId: catMobo.id,
        attributes: [
          { attributeId: attrSocket.id, value: 'LGA1700' },
          { attributeId: attrRamType.id, value: 'DDR4' },
          { attributeId: attrFormFactor.id, value: 'ATX' },
        ],
      },
      {
        name: 'Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz',
        slug: 'corsair-vengeance-32gb-ddr5-6000',
        brand: 'Corsair',
        price: 114.99,
        stock: 100,
        categoryId: catRam.id,
        attributes: [
          { attributeId: attrRamType.id, value: 'DDR5' },
        ],
      },
      {
        name: 'Kingston FURY Beast 16GB (2x8GB) DDR4 3200MHz',
        slug: 'kingston-fury-beast-16gb-ddr4-3200',
        brand: 'Kingston',
        price: 49.99,
        stock: 80,
        categoryId: catRam.id,
        attributes: [
          { attributeId: attrRamType.id, value: 'DDR4' },
        ],
      },
    ];

    for (const p of productsData) {
      const product = await prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          price: p.price,
          stock: p.stock,
          categoryId: p.categoryId,
          sellerId: adminUser.id,
        },
      });

      // Insertar valores de atributos EAV
      for (const attr of p.attributes) {
        await prisma.productAttribute.upsert({
          where: { productId_attributeId: { productId: product.id, attributeId: attr.attributeId } },
          update: {},
          create: {
            productId: product.id,
            attributeId: attr.attributeId,
            value: attr.value,
          },
        });
      }
    }

    // Crear Reglas de Compatibilidad
    const rules = [
      {
        name: 'Socket CPU-Mobo Match',
        description: 'El procesador debe encajar en el socket de la placa madre.',
        sourceAttributeId: attrSocket.id,
        targetAttributeId: attrSocket.id,
        ruleType: 'MUST_MATCH',
        condition: {},
      },
      {
        name: 'RAM Type Match',
        description: 'La placa madre debe soportar el tipo de memoria RAM (DDR4/DDR5).',
        sourceAttributeId: attrRamType.id,
        targetAttributeId: attrRamType.id,
        ruleType: 'MUST_MATCH',
        condition: {},
      },
    ];

    for (const r of rules) {
      const existingRule = await prisma.compatibilityRule.findFirst({
        where: { name: r.name },
      });
      if (!existingRule) {
        await prisma.compatibilityRule.create({
          data: {
            name: r.name,
            description: r.description,
            sourceAttributeId: r.sourceAttributeId,
            targetAttributeId: r.targetAttributeId,
            ruleType: r.ruleType as any,
            condition: r.condition,
          },
        });
      }
    }

    console.log('✅ Hardware seeding completado con éxito.');

  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('❌ Error en el seed:', e);
  process.exit(1);
});
