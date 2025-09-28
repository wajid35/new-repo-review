// app/dashboard/categories-page/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Edit, Plus, X } from 'lucide-react';
import FileUpload from "@/app/components/FileUpload";
import Image from 'next/image';

interface UploadResponse {
    url: string;
    fileId: string;
    name: string;
}

interface Category {
    _id: string;
    name: string;
    image: UploadResponse;
    createdAt: string;
    updatedAt: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        image: null as UploadResponse | null
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/categories');
            const result = await response.json();

            if (result.success) {
                setCategories(result.data);
            } else {
                setError(result.error || 'Failed to fetch categories');
            }
        } catch (error) {
            setError('Error fetching categories');
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle form submission (create or update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.image) {
            setError('Please provide both category name and image');
            return;
        }

        setSubmitLoading(true);
        setError(null);

        try {
            const url = editingCategory
                ? `/api/categories/${editingCategory._id}`
                : '/api/categories';

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    image: formData.image
                }),
            });

            const result = await response.json();

            if (result.success) {
                await fetchCategories(); // Refresh the list
                resetForm();
                setIsDialogOpen(false);
            } else {
                setError(result.error || 'Failed to save category');
            }
        } catch (error) {
            setError('Error saving category');
            console.error('Error saving category:', error);
        } finally {
            setSubmitLoading(false);
        }
    };

    // Handle category deletion
    const handleDelete = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) {
            return;
        }

        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                await fetchCategories(); // Refresh the list
            } else {
                setError(result.error || 'Failed to delete category');
            }
        } catch (error) {
            setError('Error deleting category');
            console.error('Error deleting category:', error);
        }
    };

    // Handle edit button click
    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            image: category.image
        });
        setIsDialogOpen(true);
    };

    // Handle image upload success
    const handleImageUpload = (uploadResult: UploadResponse) => {
        setFormData(prev => ({
            ...prev,
            image: uploadResult
        }));
        setUploadProgress(0);
    };

    // Reset form
    const resetForm = () => {
        setFormData({ name: '', image: null });
        setEditingCategory(null);
        setError(null);
        setUploadProgress(0);
    };

    // Handle dialog close
    const handleDialogClose = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Categories Management</h1>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[425px] bg-white">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter category name"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Category Image</Label>
                                <FileUpload
                                    onSuccess={handleImageUpload}
                                    onProgress={setUploadProgress}
                                    FileType="image"
                                />

                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                )}

                                {formData.image && (
                                    <div className="relative">
                                        <Image
                                            src={formData.image.url}
                                            alt="Category preview"
                                            width={200}
                                            height={150}
                                            className="rounded-lg object-cover"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2 cursor-pointer"
                                            onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" className="bg-white cursor-pointer" onClick={handleDialogClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="cursor-pointer"
                                    disabled={submitLoading || !formData.name.trim() || !formData.image}
                                >
                                    {submitLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {error && !isDialogOpen && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 cursor-pointer"
                        onClick={() => setError(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <Card key={category._id} className="overflow-hidden">
                        <div className="relative h-48">
                            <Image
                                src={category.image.url}
                                alt={category.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <CardHeader>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white cursor-pointer"
                                    onClick={() => handleEdit(category)}
                                >
                                    <Edit className="mr-1 h-4 w-4 bg-white" />
                                    Edit
                                </Button>

                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => handleDelete(category._id)}
                                >
                                    <Trash2 className="mr-1 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-600 mb-4">Get started by creating your first category.</p>
                    <Button onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>
            )}
        </div>
    );

}
