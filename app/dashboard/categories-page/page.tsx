// app/dashboard/categories-page/page.tsx
"use client"

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus, X, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import FileUpload from "@/app/components/FileUpload";
import Image from 'next/image';
import axios from 'axios';

interface UploadResponse {
    url: string;
    fileId: string;
    name: string;
}

interface FAQ {
    question: string;
    answer: string;
    id?: string;
}

interface Category {
    _id: string;
    name: string;
    image: UploadResponse;
    faqs: FAQ[];
    createdAt: string;
    updatedAt: string;
}

// Define the primary color and a darker hover shade
const PRIMARY_COLOR = '#FF5F1F';
const PRIMARY_COLOR_HOVER = '#E5561B';

export default function CategoriesPage() {
    const [categories, setCategories, ] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        image: null as UploadResponse | null,
        faqs: [] as FAQ[]
    });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [nameError, setNameError] = useState<string | null>(null);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/categories');
            const result = await response.json();

            if (result.success) {
                setCategories(result.data);
            } else {
                setError(result.error || 'Failed to fetch categories');
            }
        } catch (err) {
            setError('Error fetching categories');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load categories on component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Check for duplicate category name
    const checkDuplicateName = useCallback(async (name: string) => {
        if (!name.trim() || name.length < 2) return;

        setIsCheckingName(true);
        try {
            const response = await axios.get(`/api/categories/check-name?name=${encodeURIComponent(name)}`);
            
            if (response.data.exists) {
                // If editing, check if it's the same category
                if (editingCategory && response.data.categoryId === editingCategory._id) {
                    setNameError(null);
                } else {
                    setNameError('A category with this name already exists. Please use a different name.');
                }
            } else {
                if (nameError?.includes('already exists')) {
                    setNameError(null);
                }
            }
        } catch (err) {
            console.error('Error checking name:', err);
        } finally {
            setIsCheckingName(false);
        }
    }, [editingCategory, nameError]);

    // Debounce name checking
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (formData.name.trim().length >= 2) {
                checkDuplicateName(formData.name);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.name, checkDuplicateName]);

    // Handle form submission (create or update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.image) {
            setError('Please provide both category name and image');
            return;
        }

        if (nameError) {
            setError('Please fix the errors before submitting');
            return;
        }

        // Final check for duplicate name
        try {
            const response = await axios.get(`/api/categories/check-name?name=${encodeURIComponent(formData.name)}`);
            if (response.data.exists) {
                if (!editingCategory || response.data.categoryId !== editingCategory._id) {
                    setNameError('A category with this name already exists. Please use a different name.');
                    return;
                }
            }
        } catch (err) {
            console.error('Error checking name:', err);
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
                    image: formData.image,
                    faqs: formData.faqs
                }),
            });

            const result = await response.json();

            if (result.success) {
                await fetchCategories();
                resetForm();
                setIsDialogOpen(false);
            } else {
                setError(result.error || 'Failed to save category');
            }
        } catch (err) {
            setError('Error saving category');
            console.error('Error saving category:', err);
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
                await fetchCategories();
            } else {
                setError(result.error || 'Failed to delete category');
            }
        } catch (err) {
            setError('Error deleting category');
            console.error('Error deleting category:', err);
        }
    };

    // Handle edit button click
    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            image: category.image,
            faqs: category.faqs || []
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

    // FAQ Management Functions
    const addFAQ = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...prev.faqs, { question: '', answer: '', id: Date.now().toString() }]
        }));
    };

    const removeFAQ = (index: number) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index)
        }));
    };

    const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.map((faq, i) => 
                i === index ? { ...faq, [field]: value } : faq
            )
        }));
    };

    // Toggle category expansion
    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    // Reset form
    const resetForm = () => {
        setFormData({ name: '', image: null, faqs: [] });
        setEditingCategory(null);
        setError(null);
        setNameError(null);
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
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#FF5F1F]"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                {/* Main Heading Color Fixed */}
                <h1 className="text-3xl font-bold text-[#FF5F1F]">Categories Management</h1>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        {/* Button Text Color Fixed */}
                        <Button
                            onClick={() => setIsDialogOpen(true)}
                            className="cursor-pointer bg-[#FF5F1F] hover:bg-[#E5561B] text-black" 
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[600px] bg-white max-h-[90vh] overflow-y-auto">
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

                            <div className="space-y-2 text-black">
                                <Label htmlFor="name">Category Name</Label>
                                <div className="relative">
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter category name"
                                        className={nameError ? 'border-red-500 text-black' : 'text-black'}
                                        required
                                    />
                                    {isCheckingName && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-4 h-4 animate-spin text-[#FF5F1F]" />
                                        </div>
                                    )}
                                </div>
                                {nameError && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{nameError}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 text-black">
                                <Label>Category Image</Label>
                                <FileUpload
                                    onSuccess={handleImageUpload}
                                    onProgress={setUploadProgress}
                                    FileType="image"
                                />

                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full transition-all duration-300 bg-[#FF5F1F]"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                )}

                                {formData.image && (
                                    <div className="relative text-black">
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

                            {/* FAQs Section */}
                            <div className="space-y-2 text-black">
                                <div className="flex justify-between items-center">
                                    <Label>FAQs (Optional)</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="cursor-pointer"
                                        onClick={addFAQ}
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add FAQ
                                    </Button>
                                </div>

                                {formData.faqs.length > 0 && (
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {formData.faqs.map((faq, index) => (
                                            <div key={faq.id || index} className="border rounded-lg p-3 space-y-2">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium">FAQ {index + 1}</span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="cursor-pointer h-6 w-6 p-0"
                                                        onClick={() => removeFAQ(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <Input
                                                    placeholder="Question"
                                                    value={faq.question}
                                                    onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                                    required
                                                />

                                                <Textarea
                                                    placeholder="Answer"
                                                    value={faq.answer}
                                                    onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                                    rows={3}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button type="button" variant="outline" className="bg-white cursor-pointer" onClick={handleDialogClose}>
                                    Cancel
                                </Button>
                                {/* Button Text Color Fixed */}
                                <Button
                                    type="submit"
                                    className="cursor-pointer bg-[#FF5F1F] hover:bg-[#E5561B] text-black" 
                                    disabled={submitLoading || !formData.name.trim() || !formData.image || isCheckingName || !!nameError}
                                >
                                    {submitLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : isCheckingName ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Checking...
                                        </>
                                    ) : (editingCategory ? 'Update' : 'Create')}
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
                            {category.faqs && category.faqs.length > 0 && (
                                <p className="text-sm text-gray-500">{category.faqs.length} FAQ{category.faqs.length !== 1 ? 's' : ''}</p>
                            )}
                        </CardHeader>

                        <CardContent className="pt-0 space-y-3">
                            {/* FAQs Preview */}
                            {category.faqs && category.faqs.length > 0 && (
                                <div className="mb-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-between cursor-pointer"
                                        onClick={() => toggleCategory(category._id)}
                                    >
                                        View FAQs
                                        {expandedCategories.has(category._id) ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </Button>

                                    {expandedCategories.has(category._id) && (
                                        <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                                            {category.faqs.map((faq, index) => (
                                                <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                                                    <p className="font-medium">{faq.question}</p>
                                                    <p className="text-gray-600 mt-1">{faq.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white cursor-pointer"
                                    onClick={() => handleEdit(category)}
                                >
                                    <Edit className="mr-1 h-4 w-4" />
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
                    {/* Button Text Color Fixed */}
                    <Button
                        onClick={() => setIsDialogOpen(true)}
                        className="cursor-pointer bg-[#FF5F1F] hover:bg-[#E5561B] text-black" 
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>
            )}
        </div>
    );
}