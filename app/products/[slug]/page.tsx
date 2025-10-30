'use client';

import { useParams } from 'next/navigation';
import ProductDetail from '@/app/components/ProductDetailContent';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;

  if (!slug) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Product</h2>
          <p className="text-gray-600">Product slug is missing from the URL.</p>
        </div>
      </div>
    );
  }

  return <ProductDetail productSlug={slug} />;
}