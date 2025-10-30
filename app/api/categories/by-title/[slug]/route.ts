import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/post';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

// Define the Category interface
interface ICategory {
  _id: Types.ObjectId;
  name: string;
  image: { url: string; fileId: string; name: string };
  faqs: Array<{
    _id?: Types.ObjectId;
    question: string;
    answer: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to create slug from category name (must match frontend)
const createCategorySlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// GET - Fetch category by slug and its products
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectToDatabase();

    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Category slug is required' },
        { status: 400 }
      );
    }

    // Normalize the incoming slug to lowercase
    const normalizedSlug = slug.toLowerCase().trim();
    
    console.log('🔍 Searching for category with slug:', normalizedSlug);

    // Fetch all categories and find the one matching the slug
    const categories = await Category.find({}).lean<ICategory[]>();

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No categories found in database' },
        { status: 404 }
      );
    }

    const matchedCategory = categories.find(category => {
      const categorySlug = createCategorySlug(category.name);
      console.log(`Comparing: "${categorySlug}" === "${normalizedSlug}"`);
      return categorySlug === normalizedSlug;
    });

    if (!matchedCategory) {
      console.log('❌ No matching category found for slug:', normalizedSlug);
      console.log('Available category slugs:', categories.map(c => createCategorySlug(c.name)));
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found category:', matchedCategory.name);
    console.log('✅ Category ID:', matchedCategory._id);

    // Fetch all products under this category using the same logic as the ID-based API
    const categoryId = matchedCategory._id.toString();
    const categoryObjectId = new mongoose.Types.ObjectId(categoryId);

    console.log('🔍 Searching for products with category ID:', categoryId);
    console.log('🔍 Category ObjectId:', categoryObjectId);
    console.log('🔍 Category name:', matchedCategory.name);

    // Try multiple query strategies (same as the ID-based API)
    const products = await Product.find({
      $or: [
        { category: categoryObjectId },
        { category: categoryId },
        { category: matchedCategory.name }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log('✅ Found products:', products.length);
    console.log('📦 Products:', products);

    if (products.length === 0) {
      // Debug: Check a few products to see what category values exist
      const allProducts = await Product.find({}).limit(5).lean();
      console.log('🔍 Sample products for debugging:', allProducts.map(p => ({
        title: p.productTitle,
        category: p.category
      })));
    }

    // Return category with products (same structure as ID-based API)
    return NextResponse.json(
      {
        success: true,
        data: {
          category: {
            _id: matchedCategory._id,
            name: matchedCategory.name,
            image: matchedCategory.image,
            faqs: matchedCategory.faqs || [],
            createdAt: matchedCategory.createdAt,
            updatedAt: matchedCategory.updatedAt
          },
          products: products,
          productsCount: products.length
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching category by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}