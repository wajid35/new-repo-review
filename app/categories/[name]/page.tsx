"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IProduct } from "@/models/post";
import { BarChart3, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

// Define the type for the FAQ structure
interface IFaq {
  _id?: string;
  question: string;
  answer: string;
}

// Define the type for the category data
interface ICategoryData {
  _id: string;
  name: string;
  image: { url: string; fileId: string; name: string };
  faqs: IFaq[];
  createdAt: string;
  updatedAt: string;
}

// Helper function to create URL-friendly slug from product title
const createProductSlug = (title: string, rank: number): string => {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
  return `${slug}-${rank}`;
};

// Separate component for the Product Card
interface ProductCardProps {
  product: IProduct;
  idx: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, idx }) => {
  const productSlug = createProductSlug(product.productTitle, idx + 1);

  return (
    <div
      className="bg-white rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-[#FF5F1F]/50 group relative shadow-sm w-full md:w-80 flex-shrink-0 snap-center"
      key={product._id?.toString()}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 left-4 bg-[#FF5F1F] text-white rounded-lg px-3 py-1 font-bold text-sm z-10 shadow-lg">
        #{idx + 1}
      </div>

      {/* Product Image */}
      <Link
        href={`/products/${productSlug}?id=${product._id?.toString()}`}
        className="block"
      >
        <div className="relative cursor-pointer w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
          {product.productPhotos && product.productPhotos.length > 0 ? (
            <Image
              src={product.productPhotos[0]}
              alt={product.productTitle}
              width={400}
              height={200}
              className="w-full h-full object-fit"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                  📦
                </div>
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-black line-clamp-1 group-hover:text-[#FF5F1F] transition-colors">
          {product.productTitle}
        </h3>

        {/* Review Bars */}
        <div className="space-y-2">
          {/* Positive */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-600">Positive</span>
              <span className="text-green-600">
                {product.positiveReviewPercentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${product.positiveReviewPercentage || 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Neutral */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-yellow-600">Neutral</span>
              <span className="text-yellow-600">
                {product.neutralReviewPercentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${product.neutralReviewPercentage || 0}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Negative */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-600">Negative</span>
              <span className="text-red-600">
                {product.negativeReviewPercentage || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${product.negativeReviewPercentage || 0}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <Link
            href={`/products/${productSlug}?id=${product._id?.toString()}`}
            className="bg-[#FF5F1F] hover:bg-[#FF5F1F]/90 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 size={18} />
            View Analysis
          </Link>
          <Link
            href={product.affiliateLink}
            className="bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={18} />
            <span>{product.affiliateLinkText}</span>
            <span>{`USD ${product.productPrice}`}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const CategoryProducts: React.FC = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categoryData, setCategoryData] = useState<ICategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'positive'>('rank');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -344 : 344;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('🔍 Starting fetchData...');
      console.log('📌 Category ID from URL:', categoryId);

      if (!categoryId) {
        console.error('❌ No category ID found in URL');
        setError('Category ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiUrl = `/api/categories/categoryproducts/${categoryId}`;
        console.log('🌐 Fetching from:', apiUrl);

        // Fetch category with products using the API
        const response = await fetch(apiUrl);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response not OK. Status:', response.status);
          console.error('❌ Error text:', errorText);
          throw new Error(`Failed to fetch category data: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Full API Response:', result);

        if (result.success) {
          console.log('✅ Success! Category Data:', result.data.category);
          console.log('✅ Products Count:', result.data.products.length);
          console.log('✅ Products:', result.data.products);
          console.log('✅ FAQs:', result.data.category.faqs);

          setCategoryData(result.data.category);
          setProducts(result.data.products);
        } else {
          console.error('❌ API returned success: false');
          console.error('❌ Error message:', result.error);
          throw new Error(result.error || "Failed to fetch data");
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred";
        console.error('❌ Catch block error:', err);
        console.error('❌ Error message:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
        console.log('🏁 Fetch completed');
      }
    };

    fetchData();
  }, [categoryId]);

  console.log('🔢 Total products before filtering:', products.length);
  console.log('🔢 Products array:', products);

  const filtered = products
    .filter((p) => {
      const hasRank = typeof p.productRank === "number";
      console.log(`Product "${p.productTitle}" - Has Rank: ${hasRank}, Rank: ${p.productRank}`);
      return hasRank;
    })
    .sort((a, b) => {
      if (sortBy === 'rank') {
        return (b.productRank ?? 0) - (a.productRank ?? 0);
      } else if (sortBy === 'price') {
        const priceA = parseFloat(a.productPrice?.replace(/[^0-9.]/g, '') || '0');
        const priceB = parseFloat(b.productPrice?.replace(/[^0-9.]/g, '') || '0');
        return priceA - priceB;
      } else if (sortBy === 'positive') {
        return (b.positiveReviewPercentage ?? 0) - (a.positiveReviewPercentage ?? 0);
      }
      return 0;
    });

  console.log('✅ Filtered products count:', filtered.length);
  console.log('✅ Filtered products:', filtered);

  const faqs = categoryData?.faqs || [];
  console.log('📋 FAQs count:', faqs.length);

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="text-[#FF5F1F] text-xl">Loading category data...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-black mb-2">
                {categoryData?.name || 'Category'} <span className="text-[#FF5F1F]">Products</span>
              </h1>
              <p className="text-gray-600">
                Showing {filtered.length} products ranked based on reddit reviews
              </p>
            </div>

            {/* Filter Buttons */}
            {filtered.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setSortBy('rank')}
                  className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${sortBy === 'rank'
                    ? 'bg-[#FF5F1F] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Sort by Rank
                </button>
                <button
                  onClick={() => setSortBy('positive')}
                  className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${sortBy === 'positive'
                    ? 'bg-[#FF5F1F] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Sort by Positive Reviews
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${sortBy === 'price'
                    ? 'bg-[#FF5F1F] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Sort by Price (Low to High)
                </button>
              </div>
            )}

            {/* No Products Found */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-black mb-2">
                  No Products Found
                </h2>
                <p className="text-gray-600 mb-6">
                  No products found for this category.
                </p>
              </div>
            ) : (
              <>
                {/* Horizontal Scrollable Product Cards Section */}
                <div className="relative mb-12">
                  {filtered.length > 3 && (
                    <button
                      onClick={() => scroll('left')}
                      className="absolute left-0 top-1/2 cursor-pointer -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-20 border border-gray-300 hover:bg-gray-100 transition-colors hidden md:block"
                      aria-label="Scroll Left"
                    >
                      <ChevronLeft size={24} className="text-black" />
                    </button>
                  )}

                  <div
                    ref={scrollContainerRef}
                    className="flex space-x-6 pb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                  >
                    {filtered.map((product, idx) => (
                      <ProductCard product={product} idx={idx} key={product._id?.toString()} />
                    ))}
                  </div>

                  {filtered.length > 3 && (
                    <button
                      onClick={() => scroll('right')}
                      className="absolute right-0 top-1/2 cursor-pointer -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-20 border border-gray-300 hover:bg-gray-100 transition-colors hidden md:block"
                      aria-label="Scroll Right"
                    >
                      <ChevronRight size={24} className="text-black" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  ⓘ Conducting these analyses comes with expenses. If you choose to buy through my links, you&lsquo;ll be helping keep this site running—at no additional cost to you. I may receive a small commission, and I truly appreciate your support!
                </p>

                {/* FAQs Section */}
                {faqs.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-3xl font-bold text-black mb-6 text-center">
                      Frequently Asked Questions (FAQs)
                    </h2>
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {faqs.map((faq, index) => (
                        <div
                          key={faq._id || index}
                          className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                        >
                          <h3 className="p-4 bg-gray-50 text-lg font-semibold text-black">
                            {faq.question}
                          </h3>
                          <div className="p-4 text-gray-700 border-t border-gray-100">
                            <p>{faq.answer}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;