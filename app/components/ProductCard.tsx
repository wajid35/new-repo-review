"use client";

import Image from "next/image";
import Link from "next/link";
import { BarChart3, ExternalLink } from "lucide-react";

// Define the type for the product
interface IProduct {
  _id?: string;
  productTitle: string;
  productPhotos?: string[];
  productPrice?: string;
  category: string;
  productRank?: number;
  positiveReviewPercentage?: number;
  neutralReviewPercentage?: number;
  negativeReviewPercentage?: number;
  affiliateLink?: string;
  affiliateLinkText?: string;
}

interface ProductCardProps {
  product: IProduct;
  rank: number; // Display rank (1, 2, 3...)
}

// Helper function to create URL-friendly slug from product title
const createProductSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

const ProductCard: React.FC<ProductCardProps> = ({ product, rank }) => {
  const productSlug = createProductSlug(product.productTitle);

  const affiliateLinkText = product.affiliateLinkText ?? 'Buy Now';

  return (
    <div
      className="bg-white rounded-xl p-6 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-[#FF5F1F]/50 group relative shadow-sm w-full md:w-80 flex-shrink-0 snap-center"
      key={product._id?.toString()}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 left-4 bg-[#FF5F1F] text-white rounded-lg px-3 py-1 font-bold text-sm z-10 shadow-lg">
        #{rank}
      </div>

      {/* Product Image */}
      <Link
        href={`/products/${productSlug}`}
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
            href={`/products/${productSlug}`}
            className="bg-[#FF5F1F] hover:bg-[#FF5F1F]/90 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 size={18} />
            View Analysis
          </Link>
          <a
            href={product.affiliateLink ?? '#'}
            className="bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={18} />
            <span>{affiliateLinkText}</span>
            <span>{`USD ${product.productPrice}`}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;