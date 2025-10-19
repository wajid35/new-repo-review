// app/api/categories/categoryproducts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category, { ICategory } from '@/models/Category';
import Product from '@/models/post';
import mongoose from 'mongoose';

// GET - Fetch category with all its products
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    try {
        await connectToDatabase();

        // Validate category ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        // Fetch category
        const category = await Category.findById(id).lean() as ICategory | null;

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            );
        }

        // Fetch all products under this category
        // Try matching with both ObjectId and string versions
        const categoryObjectId = new mongoose.Types.ObjectId(id);

        console.log('🔍 Searching for products with category ID:', id);
        console.log('🔍 Category ObjectId:', categoryObjectId);
        console.log('🔍 Category name:', category.name);

        // Try multiple query strategies
        const products = await Product.find({
            $or: [
                { category: categoryObjectId },
                { category: id },
                { category: category.name }
            ]
        })
            .sort({ createdAt: -1 })
            .lean();

        console.log('✅ Found products:', products.length);
        console.log('📦 Products:', products);

        if (products.length === 0) {
            // Debug: Check all products to see what category values exist
            const allProducts = await Product.find({}).limit(5).lean();
        }

        // Return category with products
        return NextResponse.json({
            success: true,
            data: {
                category: {
                    _id: category._id,
                    name: category.name,
                    image: category.image,
                    faqs: category.faqs || [],
                    createdAt: category.createdAt,
                    updatedAt: category.updatedAt
                },
                products: products,
                productsCount: products.length
            }
        });

    } catch (error) {
        console.error('Error fetching category with products:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch category with products' },
            { status: 500 }
        );
    }
}