"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Footer from '@/app/components/Footer';
import Navbar from '@/app/components/NavbarComponent';
import Loader from '../components/Loader';

interface Category {
  _id: string;
  name: string;
  image: UploadResponse;
  createdAt: string;
  updatedAt: string;
}

interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
}

const CategoriesGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const params = useParams();
  const rawCategory = params?.name as string || "";
  const categoryName = rawCategory.replace(/-/g, " ");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

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

  // Filter categories
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (loading) {
    return (
     <div className="flex items-center justify-center h-screen">
  <div className="text-[#FF5F1F] text-xl">
    <Loader />
  </div>
</div>

    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Categories</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCategories}
              className="bg-[#FF5F1F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF5F1F] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-4">
            Top on Reddit Lists
          </h1>
          <p className="text-gray-700 text-lg mb-6">
            All lists of the most recommended products on Reddit, based on aggregated reviews. By date analyzed.
          </p>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF5F1F] focus:border-transparent"
          />
        </div>

        {/* Categories List */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Categories Found</h2>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `No categories match "${searchTerm}". Try a different search term.`
                : 'No categories available at the moment.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-[#FF5F1F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF5F1F] transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category._id} className="border-b border-gray-200 pb-6">
                <Link
                  href={`/categories-list/${category.name.replace(/\s+/g, '-').replace(/\(|\)/g, '')}`}
                  className="block group"
                >
                  <h2 className="text-2xl font-bold text-black mb-2 group-hover:text-[#FF5F1F] transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-[#FF5F1F] text-base group-hover:underline">
                    Analyzed on {formatDate(category.updatedAt)}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredCategories.length > 0 && (
          <div className="text-center mt-8 text-gray-600">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default CategoriesGrid;