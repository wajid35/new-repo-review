import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Post from '@/models/post';

// Helper function to create slug from title (must match frontend)
const createProductSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectToDatabase();

    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Fetch all products and find the one matching the slug
    // This approach is necessary since we're generating slugs dynamically
    const products = await Post.find({}).lean();

    const matchedProduct = products.find(product => {
      const productSlug = createProductSlug(product.productTitle);
      return productSlug === slug;
    });

    if (!matchedProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(matchedProduct, { status: 200 });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}