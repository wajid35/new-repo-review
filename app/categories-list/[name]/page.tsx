"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IProduct } from "@/models/post";
import { ExternalLink } from "lucide-react";
import Navbar from "@/app/components/NavbarComponent";
import Footer from "@/app/components/Footer";

// --- New Type Definitions for Category Data and FAQs ---
interface IFaq {
  _id?: string;
  question: string;
  answer: string;
}

interface ICategoryData {
  _id: string;
  name: string;
  image: { url: string; fileId: string; name: string };
  faqs: IFaq[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}
// --------------------------------------------------------

const CategoryProducts: React.FC = () => {
  const params = useParams();
  const rawCategory = decodeURIComponent(params?.name as string || "");
  const categoryName = rawCategory.replace(/-/g, " ");
  
  const [products, setProducts] = useState<IProduct[]>([]);
  // --- New state for category data (including FAQs) ---
  const [categoryData, setCategoryData] = useState<ICategoryData | null>(null);
  // ----------------------------------------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Products
        const productResponse = await fetch("/api/auth/post");
        if (!productResponse.ok) throw new Error("Failed to fetch products");
        const productData = await productResponse.json();
        setProducts(productData);

        // 2. Fetch Category Data (including FAQs)
        // ASSUMPTION: This is the correct endpoint to get category details
        const categoryResponse = await fetch(
          `/api/categories?name=${encodeURIComponent(categoryName)}`
        );
        if (!categoryResponse.ok)
          console.warn("Category data fetch failed (FAQs might not display)");
        
        const categoryJson = await categoryResponse.json();
        
        // FIX: Access the first element of the 'data' array based on the API response structure
        if (categoryJson && categoryJson.data && categoryJson.data.length > 0) {
            const data = categoryJson.data[0]; 
            setCategoryData(data as ICategoryData);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryName]);

  const filtered = products
    .filter(
      (p) =>
        p.category?.toLowerCase() === categoryName.toLowerCase() &&
        typeof p.productRank === "number"
    )
    .sort((a, b) => {
      // Primary sort: Positive review percentage (highest first)
      const positiveA = a.positiveReviewPercentage ?? 0;
      const positiveB = b.positiveReviewPercentage ?? 0;
      
      if (positiveB !== positiveA) {
        return positiveB - positiveA;
      }
      
      // Secondary sort: Product rank (highest first)
      return (b.productRank ?? 0) - (a.productRank ?? 0);
    });

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // --- Get FAQs from state ---
  const faqs = categoryData?.faqs || [];
  // ---------------------------

  return (
    <>
    <Navbar/>
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">
            {filtered.length} Most Recommended {categoryName} on Reddit
          </h1>
          <p className="text-xl text-gray-700 mb-2">
            {formatDate()}
          </p>
          <p className="text-gray-600 mb-4">
            Based on aggregated reviews from discussions & redditors in the past 1 year
          </p>
          {/* <Link 
            href="#" 
            className="text-[#FF5F1F] hover:underline inline-flex items-center gap-1"
          >
            Full list with filtering (updated weekly) →
          </Link> */}
        </div>

        {/* Error/Loading */}
        {loading ? (
          <div className="text-center text-black py-16">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-16">{error}</div>
        ) : filtered.length === 0 ? (
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
          <div className="space-y-6">
            {filtered.map((product, idx) => (
              <div
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                key={product._id?.toString()}
              >
                <div className="flex gap-6 items-center justify-center">
                  {/* Rank Number */}
                  <div className="text-3xl font-bold text-gray-800 w-12 flex-shrink-0">
                    {idx + 1}
                  </div>

                  {/* Product Image */}
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {product.productPhotos && product.productPhotos.length > 0 ? (
                      <Image
                        src={product.productPhotos[0]}
                        alt={product.productTitle}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Product Info & Reviews */}
                  <div className="flex-1 flex gap-6 items-center justify-center min-w-0">
                    {/* Product Title & Brand */}
                    <div className="mb-4 flex-shrink-0" style={{ width: '250px' }}>
                      <p className="text-sm text-gray-600 mb-1">
                        {product.category || 'Brand'}
                      </p>
                      <Link 
                        href={`/products/${product._id?.toString()}`}
                        className="text-sm font-bold text-black hover:text-[#FF5F1F] transition-colors"
                      >
                        {product.productTitle}
                      </Link>
                      <p className="text-gray-600 mt-1">
                        {product.productPrice}
                      </p>
                    </div>

                    {/* Review Bars - Horizontal */}
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Positive */}
                      <div className="flex items-center gap-3">
                        <span className="text-green-600 text-sm font-medium w-8 flex-shrink-0">
                          👍 {product.positiveReviewPercentage || 0}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-green-500 h-6 rounded-full transition-all duration-300"
                            style={{
                              width: `${product.positiveReviewPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Neutral */}
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-600 text-sm font-medium w-8 flex-shrink-0">
                          😐 {product.neutralReviewPercentage || 0}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-yellow-500 h-6 rounded-full transition-all duration-300"
                            style={{
                              width: `${product.neutralReviewPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Negative */}
                      <div className="flex items-center gap-3">
                        <span className="text-red-600 text-sm font-medium w-8 flex-shrink-0">
                          👎 {product.negativeReviewPercentage || 0}
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-red-500 h-6 rounded-full transition-all duration-300"
                            style={{
                              width: `${product.negativeReviewPercentage || 0}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* FAQs Section (Appended Below Products) */}
        {/* -------------------------------------------------- */}
        {faqs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-black mb-6 text-center">
              Frequently Asked Questions (FAQs)
            </h2>
            <div className="space-y-4 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                // Simple Accordion Style for FAQs
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
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default CategoryProducts;