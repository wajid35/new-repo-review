import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json(
        { error: 'Name parameter is required' },
        { status: 400 }
      );
    }

    // Check if a category with this exact name exists (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    return NextResponse.json({
      exists: !!existingCategory,
      categoryId: existingCategory?._id?.toString() || null,
      name: name.trim()
    });
  } catch (error) {
    console.error('Error checking category name:', error);
    return NextResponse.json(
      { error: 'Failed to check category name' },
      { status: 500 }
    );
  }
}