import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Allow both R&D and Sales roles to access currencies
    await requireRole(request, ["R&D", "Sales"]);

    const currencies = await prisma.currency.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });

    return NextResponse.json({ currencies });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require Admin role for currency management
    const user = await requireRole(request, "Admin");

    const body = await request.json();
    const { code, name, symbol, exchangeRate, isBase } = body;

    // Validate required fields
    if (!code || !name || !symbol) {
      return NextResponse.json(
        { error: "Currency code, name, and symbol are required" },
        { status: 400 }
      );
    }

    // Check if currency code already exists
    const existingCurrency = await prisma.currency.findUnique({
      where: { code }
    });

    if (existingCurrency) {
      return NextResponse.json(
        { error: "Currency code already exists" },
        { status: 409 }
      );
    }

    // If setting as base currency, unset other base currencies
    if (isBase) {
      await prisma.currency.updateMany({
        where: { isBase: true },
        data: { isBase: false }
      });
    }

    // Create new currency
    const currency = await prisma.currency.create({
      data: {
        code,
        name,
        symbol,
        exchangeRate: exchangeRate || 1.0,
        isBase: isBase || false,
      }
    });

    return NextResponse.json({ currency }, { status: 201 });
  } catch (error) {
    console.error("Error creating currency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Currency conversion endpoint
export async function PUT(request: NextRequest) {
  try {
    // Allow both R&D and Sales roles for conversion
    await requireRole(request, ["R&D", "Sales"]);

    const body = await request.json();
    const { amount, fromCurrencyId, toCurrencyId } = body;

    if (!amount || !fromCurrencyId || !toCurrencyId) {
      return NextResponse.json(
        { error: "Amount, from currency ID, and to currency ID are required" },
        { status: 400 }
      );
    }

    // Get currency information
    const fromCurrency = await prisma.currency.findUnique({
      where: { id: parseInt(fromCurrencyId) }
    });

    const toCurrency = await prisma.currency.findUnique({
      where: { id: parseInt(toCurrencyId) }
    });

    if (!fromCurrency || !toCurrency) {
      return NextResponse.json(
        { error: "Currency not found" },
        { status: 404 }
      );
    }

    // Convert amount (assuming all rates are relative to base currency)
    const baseAmount = amount / fromCurrency.exchangeRate;
    const convertedAmount = baseAmount * toCurrency.exchangeRate;

    return NextResponse.json({
      originalAmount: amount,
      convertedAmount: Math.round(convertedAmount * 100) / 100, // Round to 2 decimal places
      fromCurrency,
      toCurrency,
      exchangeRate: toCurrency.exchangeRate / fromCurrency.exchangeRate
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}