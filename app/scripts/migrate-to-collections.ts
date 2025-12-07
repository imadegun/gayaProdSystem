import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateCollections() {
  console.log('Starting Collections migration...')

  try {
    // Get all existing collections from tblcollectMaster
    const existingCollections = await prisma.tblcollectMaster.findMany({
      include: {
        category: true,
        color: true,
        client: true,
        material: true,
        name: true,
        size: true,
        texture: true,
      }
    })

    console.log(`Found ${existingCollections.length} existing collections to migrate`)

    let migratedCount = 0
    let skippedCount = 0

    for (const existing of existingCollections) {
      try {
        // Check if collection already exists
        const existingCollection = await prisma.collections.findUnique({
          where: { code: existing.collectCode }
        })

        if (existingCollection) {
          console.log(`Collection ${existing.collectCode} already exists, skipping...`)
          skippedCount++
          continue
        }

        // Determine collection type based on client attribution
        let collectionType: 'Exclusive' | 'Exclusive-Group' | 'General' = 'General'
        if (existing.clientCode) {
          // Check if this is an exclusive client
          const clientCollections = await prisma.tblcollectMaster.count({
            where: { clientCode: existing.clientCode }
          })

          if (clientCollections > 1) {
            collectionType = 'Exclusive-Group'
          } else {
            collectionType = 'Exclusive'
          }
        }

        // Create new collection record
        await prisma.collections.create({
          data: {
            code: existing.collectCode,
            nameCode: existing.nameCode,
            collectionType,
            isApproved: true, // Assume existing collections are approved
            isOrdered: true,  // Assume existing collections are ordered
            clientCode: existing.clientCode,
            clientDescription: existing.clientDescription,
            categoryCode: existing.categoryCode,
            sizeCode: existing.sizeCode,
            textureCode: existing.textureCode,
            colorCode: existing.colorCode,
            materialCode: existing.materialCode,
            photos: [existing.photo1, existing.photo2, existing.photo3, existing.photo4].filter(p => p !== null),
            technicalDrawing: existing.techDraw,
            createdAt: existing.createdAt,
            updatedAt: existing.updatedAt,
          }
        })

        migratedCount++
        console.log(`Migrated collection: ${existing.collectCode}`)

      } catch (error) {
        console.error(`Error migrating collection ${existing.collectCode}:`, error)
      }
    }

    console.log(`Migration completed:`)
    console.log(`- Migrated: ${migratedCount} collections`)
    console.log(`- Skipped: ${skippedCount} collections (already exist)`)

    // Verify migration
    const totalCollections = await prisma.collections.count()
    console.log(`Total collections in new table: ${totalCollections}`)

  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateCollections()
  .then(() => {
    console.log('Migration script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })