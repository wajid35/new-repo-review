// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import mongoose from 'mongoose';

// GET - Fetch single category by ID
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        await connectToDatabase();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        const category = await Category.findById(id);

        if (!category) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

// PUT - Update category by ID
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;
        const body = await request.json();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        const { name, image, faqs } = body;

        // Validation
        if (!name || !image || !image.url || !image.fileId || !image.name) {
            return NextResponse.json(
                { success: false, error: 'Name and complete image data are required' },
                { status: 400 }
            );
        }

        // Validate FAQs if provided
        if (faqs && Array.isArray(faqs)) {
            for (const faq of faqs) {
                if (!faq.question || !faq.answer) {
                    return NextResponse.json(
                        { success: false, error: 'Each FAQ must have both question and answer' },
                        { status: 400 }
                    );
                }
                if (faq.question.trim() === '' || faq.answer.trim() === '') {
                    return NextResponse.json(
                        { success: false, error: 'FAQ question and answer cannot be empty' },
                        { status: 400 }
                    );
                }
            }
        }

        // Check if another category with the same name exists (excluding current category)
        const existingCategory = await Category.findOne({
            name: name.trim(),
            _id: { $ne: id }
        });

        if (existingCategory) {
            return NextResponse.json(
                { success: false, error: 'Category with this name already exists' },
                { status: 409 }
            );
        }

        // Prepare update data
        interface UpdateData {
            name: string;
            image: {
                url: string;
                fileId: string;
                name: string;
            };
            faqs?: { question: string; answer: string }[];
        }

        const updateData: UpdateData = {
            name: name.trim(),
            image: {
                url: image.url,
                fileId: image.fileId,
                name: image.name
            }
        };

        // Add FAQs to update data (will be empty array if not provided)
        if (faqs && Array.isArray(faqs)) {
            updateData.faqs = faqs.map((faq: { question: string; answer: string }) => ({
                question: faq.question.trim(),
                answer: faq.answer.trim()
            }));
        } else {
            updateData.faqs = [];
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedCategory,
            message: 'Category updated successfully'
        });

    } catch (error: unknown) {
        console.error('Error updating category:', error);

        // Type guard for MongoError
        if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: number }).code === 11000) {
            return NextResponse.json(
                { success: false, error: 'Category name must be unique' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

// DELETE - Delete category by ID
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();

        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return NextResponse.json(
                { success: false, error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: deletedCategory,
            message: 'Category deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}