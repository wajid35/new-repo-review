"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IProduct } from "@/models/post";
import { BarChart3, ExternalLink } from "lucide-react";

const CategoryProducts: React.FC = () => {
  const params = useParams();
  const rawCategory = decodeURIComponent(params?.name as string || "");
  const categoryName = rawCategory.replace(/-/g, " ");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/post");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProducts(data);
        console.log("Fetched products:", data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filtered = products
    .filter(
      (p) =>
        p.category?.toLowerCase() === categoryName.toLowerCase() &&
        typeof p.productRank === "number"
    )
    .sort((a, b) => (b.productRank ?? 0) - (a.productRank ?? 0));

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            {categoryName} <span className="text-[#FF5F1F]">Products</span>
          </h1>
          <p className="text-gray-600">
            Showing {filtered.length} products ranked based on reddit reviews
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, idx) => (
              <div
                className="bg-white rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-[#FF5F1F]/50 group relative shadow-sm"
                key={product._id?.toString()}
              >
                {/* Rank Badge - Moved to top */}
                <div className="absolute top-4 left-4 bg-[#FF5F1F] text-white rounded-lg px-3 py-1 font-bold text-sm z-10 shadow-lg">
                  #{idx + 1}
                </div>

                {/* Product Image */}
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                  {product.productPhotos && product.productPhotos.length > 0 ? (
                    <Image
                      src={product.productPhotos[0]}
                      alt={product.productTitle}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
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

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#FF5F1F]">
                      {product.productPrice}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/products/${product._id?.toString()}`}
                      className="bg-[#FF5F1F] hover:bg-[#FF5F1F]/90 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <BarChart3 size={18} />
                      View Analysis
                    </Link>
                    <Link href={product.affiliateLink} className="bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2" target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={18} />
                      Affiliate Link
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;