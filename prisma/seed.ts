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
    const email = process.env.SUPER_ADMIN_EMAIL || 'admin@neohw.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'admin123';

    let adminUser = await prisma.user.findUnique({ where: { email } });
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
    }

    console.log('📦 Limpiando datos antiguos...');
    await prisma.payment.deleteMany();
    await prisma.orderDocument.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    
    await prisma.compatibilityRule.deleteMany();
    await prisma.productAttribute.deleteMany();
    await prisma.categoryAttribute.deleteMany();
    await prisma.attribute.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log('📦 Sembrando base de datos de hardware (100+ productos)...');

    // ─── CATEGORÍAS ───
    const catComp = await prisma.category.create({ data: { name: 'Componentes', slug: 'componentes' } });
    const catCpu = await prisma.category.create({ data: { name: 'Procesadores', slug: 'procesadores', parentId: catComp.id } });
    const catMobo = await prisma.category.create({ data: { name: 'Placas Madre', slug: 'placas-madre', parentId: catComp.id } });
    const catRam = await prisma.category.create({ data: { name: 'Memorias RAM', slug: 'memorias-ram', parentId: catComp.id } });
    const catGpu = await prisma.category.create({ data: { name: 'Tarjetas Gráficas', slug: 'tarjetas-graficas', parentId: catComp.id } });
    const catStorage = await prisma.category.create({ data: { name: 'Almacenamiento', slug: 'almacenamiento', parentId: catComp.id } });
    const catPsu = await prisma.category.create({ data: { name: 'Fuentes de Poder', slug: 'fuentes-de-poder', parentId: catComp.id } });
    const catCase = await prisma.category.create({ data: { name: 'Gabinetes', slug: 'gabinetes', parentId: catComp.id } });
    const catCooler = await prisma.category.create({ data: { name: 'Refrigeración', slug: 'refrigeracion', parentId: catComp.id } });

    // ─── ATRIBUTOS ───
    const attrs = {
      socket: await prisma.attribute.create({ data: { name: 'Socket', slug: 'socket', dataType: 'TEXT', isFilterable: true } }),
      ramType: await prisma.attribute.create({ data: { name: 'Tipo de RAM', slug: 'tipo-de-ram', dataType: 'TEXT', isFilterable: true } }),
      formFactor: await prisma.attribute.create({ data: { name: 'Formato', slug: 'formato', dataType: 'TEXT', isFilterable: true } }),
      tdp: await prisma.attribute.create({ data: { name: 'TDP', slug: 'tdp', dataType: 'NUMBER', unit: 'W' } }),
      cores: await prisma.attribute.create({ data: { name: 'Núcleos', slug: 'nucleos', dataType: 'NUMBER' } }),
      vram: await prisma.attribute.create({ data: { name: 'VRAM', slug: 'vram', dataType: 'NUMBER', unit: 'GB' } }),
      gpuLength: await prisma.attribute.create({ data: { name: 'Largo GPU', slug: 'largo-gpu', dataType: 'NUMBER', unit: 'mm' } }),
      psuRecommended: await prisma.attribute.create({ data: { name: 'PSU Recomendada', slug: 'psu-recomendada', dataType: 'NUMBER', unit: 'W' } }),
      capacity: await prisma.attribute.create({ data: { name: 'Capacidad', slug: 'capacidad', dataType: 'NUMBER', unit: 'GB' } }),
      storageType: await prisma.attribute.create({ data: { name: 'Tipo de Almacenamiento', slug: 'tipo-de-almacenamiento', dataType: 'TEXT' } }),
      wattage: await prisma.attribute.create({ data: { name: 'Potencia', slug: 'potencia', dataType: 'NUMBER', unit: 'W' } }),
      certification: await prisma.attribute.create({ data: { name: 'Certificación', slug: 'certificacion', dataType: 'TEXT' } }),
      psuFormFactor: await prisma.attribute.create({ data: { name: 'Formato PSU', slug: 'formato-psu', dataType: 'TEXT' } }),
      caseMaxGpuLength: await prisma.attribute.create({ data: { name: 'Largo Máximo GPU', slug: 'largo-maximo-gpu', dataType: 'NUMBER', unit: 'mm' } }),
      caseSupportedFormats: await prisma.attribute.create({ data: { name: 'Formatos Soportados', slug: 'formatos-soportados', dataType: 'TEXT' } }),
      coolerSocketsSupported: await prisma.attribute.create({ data: { name: 'Sockets Soportados', slug: 'sockets-soportados', dataType: 'TEXT' } }),
      coolerHeight: await prisma.attribute.create({ data: { name: 'Altura Cooler', slug: 'altura-cooler', dataType: 'NUMBER', unit: 'mm' } }),
      caseMaxCoolerHeight: await prisma.attribute.create({ data: { name: 'Altura Máxima Cooler', slug: 'altura-maxima-cooler', dataType: 'NUMBER', unit: 'mm' } }),
      caseSupportedPsuFormats: await prisma.attribute.create({ data: { name: 'Formatos PSU Soportados', slug: 'formatos-psu-soportados', dataType: 'TEXT' } }),
    };

    // Asignar a categorías
    const caMap = [
      { c: catCpu, a: [attrs.socket, attrs.ramType, attrs.tdp, attrs.cores] },
      { c: catMobo, a: [attrs.socket, attrs.ramType, attrs.formFactor] },
      { c: catRam, a: [attrs.ramType, attrs.capacity] },
      { c: catGpu, a: [attrs.vram, attrs.gpuLength, attrs.psuRecommended, attrs.tdp] },
      { c: catStorage, a: [attrs.storageType, attrs.capacity, attrs.formFactor] },
      { c: catPsu, a: [attrs.wattage, attrs.certification, attrs.psuFormFactor] },
      { c: catCase, a: [attrs.caseSupportedFormats, attrs.caseMaxGpuLength, attrs.caseMaxCoolerHeight, attrs.caseSupportedPsuFormats] },
      { c: catCooler, a: [attrs.coolerSocketsSupported, attrs.coolerHeight] },
    ];

    for (const mapping of caMap) {
      for (const attr of mapping.a) {
        await prisma.categoryAttribute.create({ data: { categoryId: mapping.c.id, attributeId: attr.id } });
      }
    }

    // ─── PRODUCTOS ───
    const productsData: any[] = [];
    let pCount = 1;

    const addProduct = (cat: any, name: string, price: number, attrsObj: any) => {
      productsData.push({
        slug: `prod-${pCount++}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name,
        price,
        stock: Math.floor(Math.random() * 50) + 5,
        categoryId: cat.id,
        attributes: attrsObj,
      });
    };

    // CPUs (18)
    const cpus = [
      ['AMD Ryzen 9 7950X3D', 699, 'AM5', 'DDR5', 120, 16],
      ['AMD Ryzen 9 7900X', 420, 'AM5', 'DDR5', 170, 12],
      ['AMD Ryzen 7 7800X3D', 399, 'AM5', 'DDR5', 120, 8],
      ['AMD Ryzen 5 7600X', 229, 'AM5', 'DDR5', 105, 6],
      ['AMD Ryzen 5 7600', 199, 'AM5', 'DDR5', 65, 6],
      ['AMD Ryzen 9 5950X', 499, 'AM4', 'DDR4', 105, 16],
      ['AMD Ryzen 7 5800X3D', 320, 'AM4', 'DDR4', 105, 8],
      ['AMD Ryzen 5 5600X', 159, 'AM4', 'DDR4', 65, 6],
      ['AMD Ryzen 5 5500', 99, 'AM4', 'DDR4', 65, 6],
      ['Intel Core i9-14900K', 589, 'LGA1700', 'DDR5', 253, 24],
      ['Intel Core i7-14700K', 409, 'LGA1700', 'DDR5', 253, 20],
      ['Intel Core i5-14600K', 319, 'LGA1700', 'DDR5', 181, 14],
      ['Intel Core i5-14400F', 209, 'LGA1700', 'DDR5', 148, 10],
      ['Intel Core i9-13900K', 529, 'LGA1700', 'DDR4', 253, 24],
      ['Intel Core i7-13700K', 369, 'LGA1700', 'DDR4', 253, 16],
      ['Intel Core i5-13400F', 189, 'LGA1700', 'DDR4', 148, 10],
      ['Intel Core i3-12100F', 99, 'LGA1700', 'DDR4', 58, 4],
    ];
    cpus.forEach(p => addProduct(catCpu, p[0] as string, p[1] as number, { [attrs.socket.id]: p[2], [attrs.ramType.id]: p[3], [attrs.tdp.id]: String(p[4]), [attrs.cores.id]: String(p[5]) }));

    // Motherboards (18)
    const mobos = [
      ['ASUS ROG CROSSHAIR X670E HERO', 699, 'AM5', 'DDR5', 'ATX'],
      ['MSI MAG B650 TOMAHAWK WIFI', 219, 'AM5', 'DDR5', 'ATX'],
      ['GIGABYTE B650M AORUS ELITE AX', 189, 'AM5', 'DDR5', 'Micro-ATX'],
      ['ASRock B650I Lightning WiFi', 199, 'AM5', 'DDR5', 'Mini-ITX'],
      ['ASUS ROG STRIX X570-E GAMING WIFI II', 349, 'AM4', 'DDR4', 'ATX'],
      ['MSI B550-A PRO', 139, 'AM4', 'DDR4', 'ATX'],
      ['GIGABYTE B550M DS3H', 99, 'AM4', 'DDR4', 'Micro-ATX'],
      ['ASUS ROG Strix B550-I Gaming', 229, 'AM4', 'DDR4', 'Mini-ITX'],
      ['ASUS ROG MAXIMUS Z790 DARK HERO', 699, 'LGA1700', 'DDR5', 'ATX'],
      ['MSI MAG Z790 TOMAHAWK WIFI', 259, 'LGA1700', 'DDR5', 'ATX'],
      ['GIGABYTE B760M AORUS ELITE AX', 169, 'LGA1700', 'DDR5', 'Micro-ATX'],
      ['ASUS ROG Strix Z790-I Gaming WiFi', 429, 'LGA1700', 'DDR5', 'Mini-ITX'],
      ['MSI PRO Z690-A DDR4', 189, 'LGA1700', 'DDR4', 'ATX'],
      ['ASUS TUF GAMING B760M-PLUS WIFI D4', 159, 'LGA1700', 'DDR4', 'Micro-ATX'],
      ['ASRock H610M-ITX/ac', 109, 'LGA1700', 'DDR4', 'Mini-ITX'],
      ['Biostar H610MHP', 79, 'LGA1700', 'DDR4', 'Micro-ATX'],
    ];
    mobos.forEach(p => addProduct(catMobo, p[0] as string, p[1] as number, { [attrs.socket.id]: p[2], [attrs.ramType.id]: p[3], [attrs.formFactor.id]: p[4] }));

    // RAM (15)
    const rams = [
      ['Corsair Dominator Titanium 64GB (2x32) DDR5-6000', 299, 'DDR5', 64],
      ['G.Skill Trident Z5 RGB 32GB (2x16) DDR5-6400', 129, 'DDR5', 32],
      ['Kingston FURY Beast 32GB (2x16) DDR5-6000', 109, 'DDR5', 32],
      ['Crucial Pro 32GB (2x16) DDR5-5600', 89, 'DDR5', 32],
      ['Corsair Vengeance 16GB (2x8) DDR5-5200', 69, 'DDR5', 16],
      ['TeamGroup T-Force Delta RGB 64GB (2x32) DDR4-3600', 149, 'DDR4', 64],
      ['Corsair Vengeance LPX 32GB (2x16) DDR4-3600', 89, 'DDR4', 32],
      ['G.Skill Ripjaws V 32GB (2x16) DDR4-3200', 75, 'DDR4', 32],
      ['Kingston FURY Beast 16GB (2x8) DDR4-3200', 45, 'DDR4', 16],
      ['Crucial Ballistix 16GB (2x8) DDR4-3600', 55, 'DDR4', 16],
      ['TeamGroup T-Force Vulcan Z 16GB (2x8) DDR4-3200', 39, 'DDR4', 16],
      ['Patriot Viper Steel 8GB (1x8) DDR4-3200', 22, 'DDR4', 8],
      ['Silicon Power XPOWER 16GB (2x8) DDR4-3200', 35, 'DDR4', 16],
      ['Corsair Vengeance RGB Pro 32GB (2x16) DDR4-3600', 99, 'DDR4', 32],
      ['G.Skill Trident Z Royal 32GB (2x16) DDR4-4000', 159, 'DDR4', 32],
    ];
    rams.forEach(p => addProduct(catRam, p[0] as string, p[1] as number, { [attrs.ramType.id]: p[2], [attrs.capacity.id]: String(p[3]) }));

    // GPUs (18)
    // Name, Price, Length, PSU_Rec, VRAM, TDP
    const gpus = [
      ['ASUS ROG Strix GeForce RTX 4090 24GB', 1999, 357, 1000, 24, 450],
      ['MSI Suprim X GeForce RTX 4090 24GB', 1899, 336, 1000, 24, 450],
      ['GIGABYTE Gaming OC GeForce RTX 4080 SUPER 16GB', 1049, 342, 850, 16, 320],
      ['NVIDIA Founders Edition RTX 4080 SUPER 16GB', 999, 310, 750, 16, 320],
      ['ASUS TUF Gaming GeForce RTX 4070 Ti SUPER 16GB', 829, 305, 750, 16, 285],
      ['MSI Ventus 2X GeForce RTX 4070 12GB', 549, 242, 650, 12, 200],
      ['GIGABYTE Eagle GeForce RTX 4060 Ti 8GB', 399, 272, 500, 8, 160],
      ['ASUS Dual GeForce RTX 4060 8GB', 299, 227, 500, 8, 115],
      ['MSI Ventus 2X GeForce RTX 3060 12GB', 289, 235, 550, 12, 170],
      ['Sapphire NITRO+ Radeon RX 7900 XTX 24GB', 1049, 320, 850, 24, 355],
      ['XFX Speedster MERC310 Radeon RX 7900 XT 20GB', 759, 344, 750, 20, 315],
      ['PowerColor Hellhound Radeon RX 7800 XT 16GB', 519, 322, 700, 16, 263],
      ['Sapphire Pulse Radeon RX 7700 XT 12GB', 419, 280, 700, 12, 245],
      ['XFX Speedster SWFT210 Radeon RX 7600 8GB', 259, 241, 550, 8, 165],
      ['PowerColor Fighter Radeon RX 6600 8GB', 199, 200, 500, 8, 132],
      ['ASUS Dual Radeon RX 6700 XT 12GB', 349, 295, 650, 12, 230],
      ['GIGABYTE Low Profile RTX 4060 8GB', 319, 182, 450, 8, 115],
      ['ZOTAC GAMING GeForce RTX 4070 Twin Edge 12GB', 549, 225, 600, 12, 200],
    ];
    gpus.forEach(p => addProduct(catGpu, p[0] as string, p[1] as number, { [attrs.gpuLength.id]: String(p[2]), [attrs.psuRecommended.id]: String(p[3]), [attrs.vram.id]: String(p[4]), [attrs.tdp.id]: String(p[5]) }));

    // PSUs (15)
    // Name, Price, Wattage, Format
    const psus = [
      ['Corsair AX1600i Titanium', 599, 1600, 'ATX'],
      ['Seasonic Vertex GX-1200 Gold', 249, 1200, 'ATX'],
      ['Corsair RM1000x Gold', 189, 1000, 'ATX'],
      ['EVGA SuperNOVA 1000 G6 Gold', 179, 1000, 'ATX'],
      ['MSI MPG A850G PCIE5 Gold', 139, 850, 'ATX'],
      ['Corsair RM850e Gold', 119, 850, 'ATX'],
      ['Thermaltake Toughpower GF1 750W Gold', 99, 750, 'ATX'],
      ['EVGA 650 B5 Bronze', 75, 650, 'ATX'],
      ['Corsair CX550 Bronze', 59, 550, 'ATX'],
      ['Thermaltake Smart 500W White', 39, 500, 'ATX'],
      ['Corsair SF850L Platinum', 179, 850, 'SFX'],
      ['Cooler Master V850 SFX Gold', 149, 850, 'SFX'],
      ['Corsair SF750 Platinum', 169, 750, 'SFX'],
      ['FSP Dagger Pro 650W Gold', 119, 650, 'SFX'],
      ['SilverStone SX450-B Bronze', 79, 450, 'SFX'],
    ];
    psus.forEach(p => addProduct(catPsu, p[0] as string, p[1] as number, { [attrs.wattage.id]: String(p[2]), [attrs.psuFormFactor.id]: p[3] }));

    // Cases (15)
    // Name, Price, MaxGPU, SupportedMobo, MaxCooler, SupportedPsu
    const cases = [
      ['Corsair 7000D Airflow Full Tower', 249, 450, 'ATX, Micro-ATX, Mini-ITX', 190, 'ATX, SFX'],
      ['Lian Li O11 Dynamic EVO XL', 239, 460, 'ATX, Micro-ATX, Mini-ITX', 167, 'ATX, SFX'],
      ['Phanteks NV7 Full Tower', 219, 450, 'ATX, Micro-ATX, Mini-ITX', 185, 'ATX, SFX'],
      ['Corsair 4000D Airflow Mid Tower', 89, 360, 'ATX, Micro-ATX, Mini-ITX', 170, 'ATX, SFX'],
      ['NZXT H5 Flow Mid Tower', 94, 365, 'ATX, Micro-ATX, Mini-ITX', 165, 'ATX, SFX'],
      ['Fractal Design North Mid Tower', 139, 355, 'ATX, Micro-ATX, Mini-ITX', 170, 'ATX, SFX'],
      ['Lian Li Lancool 216 Mid Tower', 99, 392, 'ATX, Micro-ATX, Mini-ITX', 180, 'ATX, SFX'],
      ['Thermaltake Versa H18 Micro-ATX', 54, 350, 'Micro-ATX, Mini-ITX', 155, 'ATX, SFX'],
      ['Cooler Master MasterBox Q300L Micro-ATX', 45, 360, 'Micro-ATX, Mini-ITX', 159, 'ATX, SFX'],
      ['ASUS Prime AP201 Micro-ATX', 79, 338, 'Micro-ATX, Mini-ITX', 170, 'ATX, SFX'],
      ['Cooler Master MasterBox NR200 Mini-ITX', 89, 330, 'Mini-ITX', 155, 'SFX'],
      ['SSUPD Meshlicious Mini-ITX', 119, 336, 'Mini-ITX', 73, 'SFX, ATX'],
      ['Fractal Design Terra Mini-ITX', 179, 322, 'Mini-ITX', 77, 'SFX'],
      ['NZXT H1 V2 Mini-ITX (PSU Included)', 349, 324, 'Mini-ITX', 140, 'SFX'],
      ['Lian Li A4-H2O Mini-ITX', 159, 322, 'Mini-ITX', 55, 'SFX'],
    ];
    cases.forEach(p => addProduct(catCase, p[0] as string, p[1] as number, { [attrs.caseMaxGpuLength.id]: String(p[2]), [attrs.caseSupportedFormats.id]: p[3], [attrs.caseMaxCoolerHeight.id]: String(p[4]), [attrs.caseSupportedPsuFormats.id]: p[5] }));

    // Storage (10)
    // Name, Price, Capacity, Format
    const storages = [
      ['Samsung 990 PRO 2TB NVMe Gen4', 169, 2000, 'M.2'],
      ['WD Black SN850X 2TB NVMe Gen4', 159, 2000, 'M.2'],
      ['Crucial P3 Plus 1TB NVMe Gen4', 64, 1000, 'M.2'],
      ['Kingston NV2 1TB NVMe Gen4', 59, 1000, 'M.2'],
      ['Samsung 970 EVO Plus 500GB NVMe Gen3', 49, 500, 'M.2'],
      ['Samsung 870 EVO 1TB SATA SSD', 89, 1000, '2.5"'],
      ['Crucial MX500 1TB SATA SSD', 79, 1000, '2.5"'],
      ['Seagate BarraCuda 4TB HDD', 85, 4000, '3.5"'],
      ['WD Blue 2TB HDD', 55, 2000, '3.5"'],
      ['Seagate BarraCuda 1TB HDD', 45, 1000, '3.5"'],
    ];
    storages.forEach(p => addProduct(catStorage, p[0] as string, p[1] as number, { [attrs.capacity.id]: String(p[2]), [attrs.formFactor.id]: p[3] }));

    // Coolers (12)
    // Name, Price, Height, Sockets
    const coolers = [
      ['Noctua NH-D15 chromax.black', 119, 165, 'AM4, AM5, LGA1700'],
      ['Thermalright Peerless Assassin 120 SE', 35, 155, 'AM4, AM5, LGA1700'],
      ['Be Quiet! Dark Rock Pro 4', 89, 163, 'AM4, AM5, LGA1700'],
      ['Cooler Master Hyper 212 Black', 39, 159, 'AM4, AM5, LGA1700'],
      ['DeepCool AK400', 34, 155, 'AM4, AM5, LGA1700'],
      ['Corsair iCUE H150i ELITE CAPELLIX 360mm', 189, 30, 'AM4, AM5, LGA1700'], // AIO block height is short
      ['NZXT Kraken Elite 280mm', 249, 30, 'AM4, AM5, LGA1700'],
      ['Arctic Liquid Freezer III 240mm', 109, 30, 'AM4, AM5, LGA1700'],
      ['Noctua NH-L9i-17xx chromax.black', 54, 37, 'LGA1700'],
      ['Noctua NH-L9a-AM4 chromax.black', 54, 37, 'AM4, AM5'], // AM4 is compatible, AM5 requires kit but let's assume it supports it
      ['Thermalright AXP90-X47', 29, 47, 'AM4, AM5, LGA1700'],
      ['ID-COOLING IS-55', 39, 55, 'AM4, AM5, LGA1700'],
    ];
    coolers.forEach(p => addProduct(catCooler, p[0] as string, p[1] as number, { [attrs.coolerHeight.id]: String(p[2]), [attrs.coolerSocketsSupported.id]: p[3] }));

    // Insert Products in bulk
    for (const p of productsData) {
      const product = await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          price: p.price,
          stock: p.stock,
          categoryId: p.categoryId,
          sellerId: adminUser.id,
        },
      });

      for (const attrId in p.attributes) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            attributeId: attrId,
            value: p.attributes[attrId],
          },
        });
      }
    }

    // ─── REGLAS DE COMPATIBILIDAD ───
    const rules = [
      {
        name: 'CPU-Mobo Socket',
        description: 'El procesador debe encajar en el socket de la placa madre.',
        sourceAttributeId: attrs.socket.id, // CPU Socket
        targetAttributeId: attrs.socket.id, // Mobo Socket
        ruleType: 'MUST_MATCH',
        condition: { operator: 'exact' },
      },
      {
        name: 'RAM-Mobo Type',
        description: 'La RAM debe ser soportada por la placa madre (DDR4/DDR5).',
        sourceAttributeId: attrs.ramType.id,
        targetAttributeId: attrs.ramType.id,
        ruleType: 'MUST_MATCH',
        condition: { operator: 'exact' },
      },
      {
        name: 'Case GPU Clearance',
        description: 'El largo de la tarjeta gráfica debe ser menor o igual al soportado por el gabinete.',
        sourceAttributeId: attrs.gpuLength.id,
        targetAttributeId: attrs.caseMaxGpuLength.id,
        ruleType: 'RANGE_CHECK',
        condition: { operator: 'lte' },
      },
      {
        name: 'PSU Wattage Capacity',
        description: 'La fuente de poder debe tener potencia suficiente para la GPU.',
        sourceAttributeId: attrs.psuRecommended.id, // Requerido (ej 850)
        targetAttributeId: attrs.wattage.id,        // Disponible (ej 1000)
        ruleType: 'POWER_SUFFICIENT',
        condition: {},
      },
      {
        name: 'Mobo-Case Form Factor',
        description: 'El formato de la placa madre debe estar soportado por el gabinete.',
        sourceAttributeId: attrs.formFactor.id,       // ej 'ATX'
        targetAttributeId: attrs.caseSupportedFormats.id, // ej 'ATX, Micro-ATX'
        ruleType: 'MUST_MATCH',
        condition: { operator: 'includes' },
      },
      {
        name: 'Cooler-CPU Socket',
        description: 'El cooler debe soportar el socket del procesador.',
        sourceAttributeId: attrs.socket.id,
        targetAttributeId: attrs.coolerSocketsSupported.id,
        ruleType: 'MUST_MATCH',
        condition: { operator: 'includes' },
      },
      {
        name: 'Case Cooler Height Clearance',
        description: 'La altura del cooler debe caber dentro del gabinete.',
        sourceAttributeId: attrs.coolerHeight.id,
        targetAttributeId: attrs.caseMaxCoolerHeight.id,
        ruleType: 'RANGE_CHECK',
        condition: { operator: 'lte' },
      },
      {
        name: 'PSU-Case Form Factor',
        description: 'El formato de la fuente debe ser compatible con el gabinete.',
        sourceAttributeId: attrs.psuFormFactor.id,
        targetAttributeId: attrs.caseSupportedPsuFormats.id,
        ruleType: 'MUST_MATCH',
        condition: { operator: 'includes' },
      }
    ];

    for (const r of rules) {
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

    console.log(`✅ ¡Hardware seeding completado con éxito! Se insertaron ${productsData.length} productos y 8 reglas avanzadas.`);

  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => {
  console.error('❌ Error en el seed:', e);
  process.exit(1);
});
