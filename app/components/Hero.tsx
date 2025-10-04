import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-white" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
      <div className="absolute top-40 left-10 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="pt-20 pb-16 text-center lg:pt-32 lg:pb-24">
          {/* Badge */}
          <div 
            className={`inline-flex items-center gap-2 px-5 py-2 bg-orange-100 rounded-full mb-8 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-900">Powered by Reddit Communities</span>
          </div>

          {/* Main heading */}
          <h1 
            className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-gray-900 mb-6 leading-tight transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            Discover What
            <br />
            <span className="relative inline-block">
              <span className="text-orange-500">Reddit Loves</span>
              <svg className="absolute -bottom-3 left-0 right-0 w-full" height="20" viewBox="0 0 300 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 15 Q75 5, 150 10 T295 15" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p 
            className={`text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            We analyze authentic Reddit discussions to find products that real people actually recommend. 
            <span className="font-semibold text-gray-900"> No ads, no bias</span> — just honest opinions.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Link href="/products">
            <button className="group cursor-pointer w-full sm:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
              Start Exploring
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
            
            <Link href="#categories">
            <button className="group w-full cursor-pointer sm:w-auto px-8 py-4 bg-white border-2 border-gray-200 hover:border-orange-500 text-gray-700 hover:text-orange-600 font-semibold rounded-full transition-all duration-300 flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Browse Categories
            </button>
            </Link>
          </div>

          {/* Social proof */}
          <div 
            className={`flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 border-2 border-white" />
                ))}
              </div>
              <span className="font-medium text-gray-700">Growing community</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-gray-700">Updated daily</span>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div 
          className={`grid md:grid-cols-3 gap-8 pb-20 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="group bg-white border-2 border-gray-100 hover:border-orange-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real Reviews</h3>
            <p className="text-gray-600 leading-relaxed">
              Authentic feedback from real Reddit users who&#39;ve actually used the products.
            </p>
          </div>

          <div className="group bg-white border-2 border-gray-100 hover:border-orange-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Search className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
              We crunch the numbers so you don&#39;t have to. Get insights from thousands of discussions.
            </p>
          </div>

          <div className="group bg-white border-2 border-gray-100 hover:border-orange-200 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Always Fresh</h3>
            <p className="text-gray-600 leading-relaxed">
              Our database grows daily with new products and reviews from active communities.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div 
          className={`text-center pb-20 transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-lg text-gray-600 mb-6">
            Just getting started? <span className="font-semibold text-gray-900">Join us</span> as we build the most trusted product discovery platform.
          </p>
         <Link href="/pipeline">
          <div className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:gap-3 transition-all cursor-pointer">
            <span>See how it works</span>
            <ArrowRight className="w-5 h-5" />
          </div>
          </Link>
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