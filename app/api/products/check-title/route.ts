import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Post from '@/models/post';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
      return NextResponse.json(
        { error: 'Title parameter is required' },
        { status: 400 }
      );
    }

    // Check if a product with this exact title exists (case-insensitive)
    const existingProduct = await Post.findOne({
      productTitle: { $regex: new RegExp(`^${title.trim()}$`, 'i') }
    });

    return NextResponse.json({
      exists: !!existingProduct,
      title: title.trim()
    });
  } catch (error) {
    console.error('Error checking product title:', error);
    return NextResponse.json(
      { error: 'Failed to check product title' },
      { status: 500 }
    );
  }
}