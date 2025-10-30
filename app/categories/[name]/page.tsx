"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Loader from "@/app/components/Loader";
import ProductCard from "@/app/components/ProductCard";

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

// Define the type for Reddit reviews
interface RedditReview {
  comment: string;
  tag: string;
  link: string;
  author: string;
  subreddit: string;
}

// Define the type for discussion in modal
interface Discussion {
  subreddit: string;
  title: string;
  url: string;
  author: string;
  tag: string;
  productTitle: string;
}

// Define the product type
interface IProduct {
  _id?: string;
  productTitle: string;
  productPhotos?: string[];
  productPrice?: string;
  productRank?: number;
  category: string;
  positiveReviewPercentage?: number;
  neutralReviewPercentage?: number;
  negativeReviewPercentage?: number;
  redditReviews?: RedditReview[];
  affiliateLink?: string;
  affiliateLinkText?: string;
}

const CategoryProducts: React.FC = () => {
  const params = useParams(); // Get route params
  const searchParams = useSearchParams(); // Get query params
  
  // Get category identifier from either route params or query params
  const categorySlug = params?.name as string | undefined;
  const categoryId = searchParams.get('id');

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categoryData, setCategoryData] = useState<ICategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rank' | 'price' | 'positive'>('rank');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [showPriceFilter, setShowPriceFilter] = useState<boolean>(false);
  const [showReviewsModal, setShowReviewsModal] = useState<boolean>(false);

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
      console.log('📌 Category Slug from URL:', categorySlug);
      console.log('📌 Category ID from Query:', categoryId);

      // Check if neither slug nor ID is provided
      if (!categorySlug && !categoryId) {
        console.error('❌ No category slug or ID found');
        setError('Category identifier is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let apiUrl: string;
        let fetchMethod: 'id' | 'slug';

        // Prefer ID if available, otherwise use slug from URL
        if (categoryId) {
          apiUrl = `/api/categories/categoryproducts/${categoryId}`;
          fetchMethod = 'id';
          console.log('🌐 Fetching by ID from:', apiUrl);
        } else if (categorySlug) {
          apiUrl = `/api/categories/by-title/${categorySlug}`;
          fetchMethod = 'slug';
          console.log('🌐 Fetching by slug from:', apiUrl);
        } else {
          throw new Error('No valid category identifier provided');
        }

        const response = await fetch(apiUrl);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response not OK. Status:', response.status);
          console.error('❌ Error text:', errorText);
          
          // If fetching by ID failed and we have a slug, try the slug fallback
          if (fetchMethod === 'id' && categorySlug) {
            console.log('⚠️ ID fetch failed, attempting slug fallback...');
            const fallbackUrl = `/api/categories/by-title/${categorySlug}`;
            console.log('🌐 Fallback URL:', fallbackUrl);
            
            const fallbackResponse = await fetch(fallbackUrl);
            
            if (!fallbackResponse.ok) {
              throw new Error(`Failed to fetch category data: ${response.status} - ${errorText}`);
            }
            
            const fallbackResult = await fallbackResponse.json();
            
            if (fallbackResult.success) {
              console.log('✅ Fallback successful! Category Data:', fallbackResult.data.category);
              console.log('✅ Products Count:', fallbackResult.data.products.length);
              setCategoryData(fallbackResult.data.category);
              setProducts(fallbackResult.data.products);
              setLoading(false);
              return;
            }
          }
          
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
  }, [categoryId, categorySlug]);

  const getProductPrice = (priceString: string | undefined): number => {
    const cleanPrice = priceString?.replace(/[^0-9.]/g, '') || '0';
    return parseFloat(cleanPrice);
  };

  const filtered = products
    .filter((p) => {
      const hasRank = typeof p.productRank === "number";
      const productPrice = getProductPrice(p.productPrice);
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Number.MAX_SAFE_INTEGER;
      
      const passesPriceFilter = productPrice >= min && productPrice <= max;

      return hasRank && passesPriceFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'rank') {
        // Higher productRank should come first (be rank #1)
        return (b.productRank ?? 0) - (a.productRank ?? 0);
      } else if (sortBy === 'price') {
        const priceA = getProductPrice(a.productPrice);
        const priceB = getProductPrice(b.productPrice);
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

  const handleClearFilter = () => {
    setMinPrice('');
    setMaxPrice('');
  };

  const allDiscussions: Discussion[] = products.flatMap(product => 
    ((product.redditReviews as RedditReview[]) || []).map(review => ({
      subreddit: review.subreddit,
      title: review.comment.substring(0, 100) + (review.comment.length > 100 ? '...' : ''),
      url: review.link,
      author: review.author,
      tag: review.tag,
      productTitle: product.productTitle
    }))
  );

  const uniqueAuthors = new Set(allDiscussions.map(d => d.author)).size;
  const totalRedditors = uniqueAuthors;
  const totalDiscussions = allDiscussions.length;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Loading State */}
        {loading && (
         <div className="flex items-center justify-center h-screen">
          <div className="text-[#FF5F1F] text-xl">
            <Loader />
          </div>
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
              
              {/* Reviews Summary Section */}
              {allDiscussions.length > 0 && (
                <div className="mt-4 mb-4">
                  <p className="text-sm text-gray-700 font-medium mb-2">
                    Based on reviews from {totalRedditors} Redditors
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      {totalDiscussions} discussions analyzed:
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {allDiscussions.slice(0, 3).map((discussion, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-gray-400 mt-0.5">◉</span>
                          <span className="line-clamp-1">r/{discussion.subreddit}: {discussion.title}</span>
                        </div>
                      ))}
                    </div>
                    {allDiscussions.length > 3 && (
                      <button
                        onClick={() => setShowReviewsModal(true)}
                        className="text-[#FF5F1F] hover:text-[#FF5F1F]/80 text-sm font-medium mt-2 flex items-center gap-1 cursor-pointer"
                      >
                        → View all
                      </button>
                    )}
                  </div>
                </div>
              )}

              <p className="text-gray-600">
                Showing {filtered.length} products ranked based on reddit reviews
              </p>
            </div>

            {/* Reviews Modal */}
            {showReviewsModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-black">All discussions:</h2>
                    <button
                      onClick={() => setShowReviewsModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      aria-label="Close modal"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                    <div className="space-y-3">
                      {allDiscussions.map((discussion, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700 hover:bg-gray-50 p-2 rounded transition-colors">
                          <span className="text-gray-400 mt-1">◉</span>
                          <div className="flex-1">
                            <a
                              href={discussion.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[#FF5F1F] transition-colors block"
                            >
                              <span className="font-medium">r/{discussion.subreddit}</span>: {discussion.title}
                            </a>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                discussion.tag === 'positive' ? 'bg-green-100 text-green-700' :
                                discussion.tag === 'negative' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {discussion.tag}
                              </span>
                              <span className="text-xs text-gray-500">by u/{discussion.author}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{discussion.productTitle}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filter and Sort Controls */}
            {products.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    onClick={() => { setSortBy('rank'); setShowPriceFilter(false); }}
                    className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${sortBy === 'rank' && !showPriceFilter
                      ? 'bg-[#FF5F1F] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Sort by Rank
                  </button>
                  <button
                    onClick={() => { setSortBy('positive'); setShowPriceFilter(false); }}
                    className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${sortBy === 'positive' && !showPriceFilter
                      ? 'bg-[#FF5F1F] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Sort by Positive Reviews
                  </button>
                  <button
                    onClick={() => { setSortBy('price'); setShowPriceFilter(false); }}
                    className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all ${sortBy === 'price' && !showPriceFilter
                      ? 'bg-[#FF5F1F] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    Sort by Price (Low to High)
                  </button>
                  
                  <button
                    onClick={() => setShowPriceFilter(prev => !prev)}
                    className={`px-6 py-2 cursor-pointer rounded-lg font-medium transition-all flex items-center gap-2 ${showPriceFilter || minPrice || maxPrice
                        ? 'bg-[#FF5F1F] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {showPriceFilter ? 'Close Price Filter' : 'Filter by Price'}
                    {(minPrice || maxPrice) && (
                      <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/30 font-bold">
                        Active
                      </span>
                    )}
                  </button>
                </div>
                
                {showPriceFilter && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 max-w-lg transition-all duration-300">
                    <h3 className="text-md font-semibold mb-3 text-black">Set Price Range (USD)</h3>
                    <div className="flex gap-4 items-center flex-wrap">
                      <input
                        type="number"
                        placeholder="Minimum Price"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-[#FF5F1F] focus:border-[#FF5F1F] transition-all"
                        min="0"
                        aria-label="Minimum Price"
                      />
                      <span className="text-gray-500 hidden sm:block">-</span>
                      <input
                        type="number"
                        placeholder="Maximum Price"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:ring-[#FF5F1F] focus:border-[#FF5F1F] transition-all"
                        min="0"
                        aria-label="Maximum Price"
                      />
                      <button
                          onClick={handleClearFilter}
                          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium w-full sm:w-auto"
                      >
                          Clear Filter
                      </button>
                    </div>
                  </div>
                )}
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
                  {minPrice || maxPrice 
                    ? `No products found within the specified price range.`
                    : 'No products found for this category.'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Horizontal Scrollable Product Cards Section */}
                <div className="relative mb-12">
                  {filtered.length > 3 && (
                    <button
                      onClick={() => scroll('left')}
                      className="absolute left-0 top-1/2 cursor-pointer -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-20 border border-gray-300 hover:bg-gray-100 transition-colors ml-2"
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
                      <ProductCard 
                        key={product._id?.toString()} 
                        product={product} 
                        rank={idx + 1}
                      />
                    ))}
                  </div>

                  {filtered.length > 3 && (
                    <button
                      onClick={() => scroll('right')}
                      className="absolute right-0 top-1/2 cursor-pointer -translate-y-1/2 bg-white p-2 rounded-full shadow-lg z-20 border border-gray-300 hover:bg-gray-100 transition-colors mr-2"
                      aria-label="Scroll Right"
                    >
                      <ChevronRight size={24} className="text-black" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  ⓘ Conducting these analyses comes with expenses. If you choose to buy through my links, you&apos;ll be helping keep this site running—at no additional cost to you. I may receive a small commission, and I truly appreciate your support!
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