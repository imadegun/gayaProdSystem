import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category");
    const client = searchParams.get("client");
    const collectionType = searchParams.get("collectionType");
    const sortBy = searchParams.get("sortBy") || "code";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build where clause - Only show production-ready Collections (not R&D)
    const where: any = {
      collectionType: {
        in: ['Exclusive', 'Exclusive-Group', 'General'] // Exclude R&D collections
      },
      isApproved: true, // Only show approved collections
      isOrdered: true   // Only show ordered collections
    };

    // Search functionality
    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { category: { categoryName: { contains: search, mode: "insensitive" } } },
        { clientDescription: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filters
    if (category) where.categoryCode = category;
    if (client) where.clientCode = client;
    if (collectionType && ['Exclusive', 'Exclusive-Group', 'General'].includes(collectionType)) {
      where.collectionType = collectionType;
    }

    // Build orderBy
    const validSortFields = [
      "code", "clientDescription", "collectionType",
      "name", "category.categoryName", "size.sizeName",
      "color.colorName", "material.materialName"
    ];

    const orderBy: Record<string, any> = {};
    if (validSortFields.includes(sortBy)) {
      if (sortBy.includes(".")) {
        const [relation, field] = sortBy.split(".");
        orderBy[relation] = { [field]: sortOrder };
      } else {
        orderBy[sortBy] = sortOrder;
      }
    } else {
      orderBy.code = "asc"; // default sort
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Fetch collections with pagination
    const [collections, totalCount] = await Promise.all([
      prisma.collections.findMany({
        where,
        include: {
          category: true,
          color: true,
          client: true,
          material: true,
          size: true,
          texture: true,
          productClays: {
            include: { clay: true },
            orderBy: { sequence: "asc" }
          },
          productGlazes: {
            include: { glaze: true },
            orderBy: { sequence: "asc" }
          },
          productLustres: {
            include: { lustre: true },
            orderBy: { sequence: "asc" }
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.collections.count({ where }),
    ]);

    // Get unique filter options
    const [categories, clients, collectionTypes] = await Promise.all([
      prisma.tblcollectCategory.findMany({
        select: { categoryCode: true, categoryName: true },
        orderBy: { categoryName: "asc" },
      }),
      prisma.client.findMany({
        select: { clientCode: true, clientDescription: true },
        orderBy: { clientDescription: "asc" },
      }),
      prisma.collections.findMany({
        where: {
          collectionType: { in: ['Exclusive', 'Exclusive-Group', 'General'] },
          isApproved: true,
          isOrdered: true
        },
        select: { collectionType: true },
        distinct: ["collectionType"],
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      collections,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        categories,
        clients,
        collectionTypes: collectionTypes
          .map(ct => ct.collectionType)
          .filter(Boolean)
          .sort(),
      },
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}