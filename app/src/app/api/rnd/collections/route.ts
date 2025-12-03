import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Collection Schema Validation
const CollectionSchema = z.object({
  code: z.string().min(1),
  designCode: z.string().optional(),
  nameCode: z.string().optional(),
  categoryCode: z.string().optional(),
  sizeCode: z.string().optional(),
  textureCode: z.string().optional(),
  colorCode: z.string().optional(),
  materialCode: z.string().optional(),
  clientCode: z.string().optional(),
  clientDescription: z.string().optional(),
  technicalDrawing: z.string().optional(),
  photos: z.array(z.string()).optional(),
  isAssembly: z.boolean().optional(),
  assemblyComponents: z.array(z.any()).optional(),
  collectionType: z.enum(['R&D', 'Exclusive', 'Exclusive-Group', 'General']).optional(),
  isApproved: z.boolean().optional(),
  isOrdered: z.boolean().optional(),
  rndUserId: z.number().optional(),
  clientId: z.string().optional()
});

// GET /api/rnd/collections - List all collections (filtered by user role)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    // Filter collections based on user role and parameters
    const whereClause: Record<string, unknown> = {};

    if (type) {
      whereClause.collectionType = type;
    }

    // R&D users can only see their own collections
    if (session.user.role === 'R&D' && !userId) {
      whereClause.rndUserId = parseInt(session.user.id);
    } else if (userId) {
      whereClause.rndUserId = parseInt(userId);
    }

    const collections = await prisma.collections.findMany({
      where: whereClause,
      include: {
        rndUser: true,
        client: true,
        category: true,
        color: true,
        material: true,
        size: true,
        texture: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/rnd/collections - Create new R&D collection
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'R&D') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = CollectionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid collection data', details: validation.error },
        { status: 400 }
      );
    }

    const collectionData = {
      ...validation.data,
      collectionType: 'R&D',
      isApproved: false,
      isOrdered: false,
      rndUserId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newCollection = await prisma.collections.create({
      data: collectionData
    });

    // Create transition record
    await prisma.collectionTransition.create({
      data: {
        rndCollectionId: newCollection.id,
        transitionType: 'creation',
        createdBy: session.user.id
      }
    });

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}

// PUT /api/rnd/collections/{id}/approve - Approve R&D collection
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !['R&D', 'Sales'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Collection ID required' }, { status: 400 });
    }

    const collection = await prisma.collections.findUnique({
      where: { id: parseInt(id) }
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    if (collection.collectionType !== 'R&D') {
      return NextResponse.json(
        { error: 'Only R&D collections can be approved' },
        { status: 400 }
      );
    }

    const updatedCollection = await prisma.collections.update({
      where: { id: parseInt(id) },
      data: {
        isApproved: true,
        approvalDate: new Date()
      }
    });

    // Create transition record
    await prisma.collectionTransition.create({
      data: {
        rndCollectionId: updatedCollection.id,
        transitionType: 'approval',
        createdBy: session.user.id
      }
    });

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Error approving collection:', error);
    return NextResponse.json(
      { error: 'Failed to approve collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/rnd/collections/{id} - Delete collection
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'R&D') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Collection ID required' }, { status: 400 });
    }

    const collection = await prisma.collections.findUnique({
      where: { id: parseInt(id) }
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Only allow deletion of R&D collections that aren't approved or ordered
    if (collection.isApproved || collection.isOrdered) {
      return NextResponse.json(
        { error: 'Cannot delete approved or ordered collections' },
        { status: 400 }
      );
    }

    await prisma.collections.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}