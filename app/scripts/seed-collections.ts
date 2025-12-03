import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCollections() {
  console.log('Seeding Collections data...')

  try {
    // First, create some sample clients
    const clients = [
      {
        clientCode: 'CLI001',
        clientDescription: 'Luxury Hotel Chain',
        region: 'Asia Pacific',
        department: 'Hospitality',
      },
      {
        clientCode: 'CLI002',
        clientDescription: 'Restaurant Group',
        region: 'Asia Pacific',
        department: 'F&B',
      },
      {
        clientCode: 'CLI003',
        clientDescription: 'Home Decor Store',
        region: 'Europe',
        department: 'Retail',
      },
      {
        clientCode: 'CLI004',
        clientDescription: 'New Client Inquiry',
        region: 'North America',
        department: 'Hospitality',
      }
    ]

    for (const client of clients) {
      await prisma.client.upsert({
        where: { clientCode: client.clientCode },
        update: client,
        create: client,
      })
      console.log(`Seeded client: ${client.clientCode}`)
    }

    // Create reference data
    const categories = [
      { categoryCode: 'BOWL', categoryName: 'Bowl' },
      { categoryCode: 'PLATE', categoryName: 'Plate' },
      { categoryCode: 'MUG', categoryName: 'Mug' },
      { categoryCode: 'VASE', categoryName: 'Vase' },
      { categoryCode: 'TEAPOT', categoryName: 'Teapot' },
    ]

    const colors = [
      { colorCode: 'WHITE', colorName: 'White' },
      { colorCode: 'BLUE', colorName: 'Blue' },
      { colorCode: 'BLACK', colorName: 'Black' },
      { colorCode: 'GOLD', colorName: 'Gold' },
      { colorCode: 'GREEN', colorName: 'Green' },
      { colorCode: 'RED', colorName: 'Red' },
    ]

    const sizes = [
      { sizeCode: 'MED', sizeName: 'Medium' },
      { sizeCode: 'LRG', sizeName: 'Large' },
    ]

    const textures = [
      { textureCode: 'SMOOTH', textureName: 'Smooth' },
      { textureCode: 'GLOSSY', textureName: 'Glossy' },
      { textureCode: 'MATTE', textureName: 'Matte' },
      { textureCode: 'TEXTURED', textureName: 'Textured' },
    ]

    const materials = [
      { materialCode: 'PORCELAIN', materialName: 'Porcelain' },
      { materialCode: 'CERAMIC', materialName: 'Ceramic' },
      { materialCode: 'STONEWARE', materialName: 'Stoneware' },
    ]

    const names = [
      { nameCode: 'BOWL_WHITE', nameValue: 'Ceramic Bowl - Classic White' },
      { nameCode: 'PLATE_BLUE', nameValue: 'Ceramic Plate - Decorative Blue' },
      { nameCode: 'MUG_BLACK', nameValue: 'Ceramic Mug - Matte Black' },
      { nameCode: 'VASE_GOLD', nameValue: 'Ceramic Vase - Elegant Gold' },
      { nameCode: 'TEAPOT_WHITE', nameValue: 'Ceramic Teapot Set' },
      { nameCode: 'BOWL_EXPERIMENTAL', nameValue: 'Experimental Ceramic Bowl' },
      { nameCode: 'PLATE_PROTOTYPE', nameValue: 'Prototype Plate Design' },
    ]

    // Seed reference data
    for (const category of categories) {
      await prisma.tblcollectCategory.upsert({
        where: { categoryCode: category.categoryCode },
        update: category,
        create: category,
      })
    }

    for (const color of colors) {
      await prisma.tblcollectColor.upsert({
        where: { colorCode: color.colorCode },
        update: color,
        create: color,
      })
    }

    for (const size of sizes) {
      await prisma.tblcollectSize.upsert({
        where: { sizeCode: size.sizeCode },
        update: size,
        create: size,
      })
    }

    for (const texture of textures) {
      await prisma.tblcollectTexture.upsert({
        where: { textureCode: texture.textureCode },
        update: texture,
        create: texture,
      })
    }

    for (const material of materials) {
      await prisma.tblcollectMaterial.upsert({
        where: { materialCode: material.materialCode },
        update: material,
        create: material,
      })
    }

    for (const name of names) {
      await prisma.tblcollectName.upsert({
        where: { nameCode: name.nameCode },
        update: name,
        create: name,
      })
    }

    console.log('Seeded reference data')
    // Create sample collections
    const collections = [
      {
        code: 'CER-001',
        nameCode: 'BOWL_WHITE',
        collectionType: 'Exclusive' as const,
        isApproved: true,
        isOrdered: true,
        clientCode: 'CLI001',
        clientDescription: 'Luxury Hotel Chain',
        categoryCode: 'BOWL',
        sizeCode: 'MED',
        textureCode: 'SMOOTH',
        colorCode: 'WHITE',
        materialCode: 'PORCELAIN',
        photos: JSON.stringify(['sample-bowl-1.jpg']),
      },
      {
        code: 'CER-002',
        nameCode: 'PLATE_BLUE',
        collectionType: 'Exclusive-Group' as const,
        isApproved: true,
        isOrdered: true,
        clientCode: 'CLI002',
        clientDescription: 'Restaurant Group',
        categoryCode: 'PLATE',
        sizeCode: 'LRG',
        textureCode: 'GLOSSY',
        colorCode: 'BLUE',
        materialCode: 'CERAMIC',
        photos: JSON.stringify(['sample-plate-1.jpg']),
      },
      {
        code: 'CER-003',
        nameCode: 'MUG_BLACK',
        collectionType: 'General' as const,
        isApproved: true,
        isOrdered: true,
        clientCode: null,
        clientDescription: null,
        categoryCode: 'MUG',
        sizeCode: 'MED',
        textureCode: 'MATTE',
        colorCode: 'BLACK',
        materialCode: 'STONEWARE',
        photos: JSON.stringify(['sample-mug-1.jpg']),
      },
      {
        code: 'CER-004',
        nameCode: 'VASE_GOLD',
        collectionType: 'Exclusive' as const,
        isApproved: true,
        isOrdered: true,
        clientCode: 'CLI003',
        clientDescription: 'Home Decor Store',
        categoryCode: 'VASE',
        sizeCode: 'LRG',
        textureCode: 'GLOSSY',
        colorCode: 'GOLD',
        materialCode: 'PORCELAIN',
        photos: JSON.stringify(['sample-vase-1.jpg']),
      },
      {
        code: 'CER-005',
        nameCode: 'TEAPOT_WHITE',
        collectionType: 'Exclusive-Group' as const,
        isApproved: true,
        isOrdered: true,
        clientCode: 'CLI002',
        clientDescription: 'Restaurant Group',
        categoryCode: 'TEAPOT',
        sizeCode: 'MED',
        textureCode: 'SMOOTH',
        colorCode: 'WHITE',
        materialCode: 'PORCELAIN',
        photos: JSON.stringify(['sample-teapot-1.jpg']),
      }
    ]

    for (const collection of collections) {
      await prisma.collections.upsert({
        where: { code: collection.code },
        update: collection,
        create: collection,
      })
      console.log(`Seeded collection: ${collection.code}`)
    }

    // Create some R&D collections (not approved/ordered)
    const rndCollections = [
      {
        code: 'RND-001',
        nameCode: 'BOWL_EXPERIMENTAL',
        collectionType: 'R&D' as const,
        isApproved: false,
        isOrdered: false,
        clientCode: 'CLI001',
        clientDescription: 'Luxury Hotel Chain',
        categoryCode: 'BOWL',
        sizeCode: 'MED',
        textureCode: 'TEXTURED',
        colorCode: 'GREEN',
        materialCode: 'CERAMIC',
        photos: JSON.stringify(['rnd-bowl-1.jpg']),
      },
      {
        code: 'RND-002',
        nameCode: 'PLATE_PROTOTYPE',
        collectionType: 'R&D' as const,
        isApproved: false,
        isOrdered: false,
        clientCode: 'CLI004',
        clientDescription: 'New Client Inquiry',
        categoryCode: 'PLATE',
        sizeCode: 'LRG',
        textureCode: 'MATTE',
        colorCode: 'RED',
        materialCode: 'STONEWARE',
        photos: JSON.stringify(['rnd-plate-1.jpg']),
      }
    ]

    for (const collection of rndCollections) {
      await prisma.collections.upsert({
        where: { code: collection.code },
        update: collection,
        create: collection,
      })
      console.log(`Seeded R&D collection: ${collection.code}`)
    }

    const totalCollections = await prisma.collections.count()
    const approvedCollections = await prisma.collections.count({
      where: { isApproved: true, isOrdered: true }
    })
    const rndCollectionsCount = await prisma.collections.count({
      where: { collectionType: 'R&D' }
    })

    console.log(`Seeding completed:`)
    console.log(`- Total collections: ${totalCollections}`)
    console.log(`- Production collections: ${approvedCollections}`)
    console.log(`- R&D collections: ${rndCollectionsCount}`)

  } catch (error) {
    console.error('Seeding failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run seeding
seedCollections()
  .then(() => {
    console.log('Seeding script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seeding script failed:', error)
    process.exit(1)
  })