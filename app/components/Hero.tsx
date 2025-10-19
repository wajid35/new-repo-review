import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Reddit1 from '@/public/reddit-1.svg';
import Image from 'next/image';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="h-auto bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-white" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
      <div className="absolute top-40 left-10 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="text-center">
          {/* Badge */}
          <div
            className={`inline-flex mt-4 items-center gap-2 px-5 py-2 bg-orange-100 rounded-full mb-1 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
          >
            <Image src={Reddit1} alt='reddit logo' className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-900">Reddit’s Favorite Products — Curated by Real People, No Ads</span>
          </div>

          {/* Main heading */}
          <h1
            className={`text-5xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 leading-tight transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
          >
            Discover What
            <br />
            <span className="relative inline-block">
              <span className="text-orange-500">Reddit Loves</span>
              <svg className="absolute -bottom-3 left-0 right-0 w-full" height="20" viewBox="0 0 300 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 15 Q75 5, 150 10 T295 15" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p
            className={`text-xl sm:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            We scan hundreds of Reddit threads to bring you the most loved, most recommended products —
            <span className="font-semibold text-gray-900"> no fluff, no paid placements</span> — just honest opinions.
          </p>

        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}