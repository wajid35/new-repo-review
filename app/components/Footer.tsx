"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t border-[#FF5F1F]/30 bg-white text-[#FF5F1F]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center py-8 px-6 gap-4">

        {/* Left section */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Link href="/"> 
            <div className="flex items-center">
              <svg className="w-32 h-10 md:w-40 md:h-12" viewBox="0 0 800 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(0, 20)" fill="#FF4500">
                  <g transform="translate(20, 0)">
                    <path d="M 25 10 L 50 45 L 35 45 L 35 50 L 15 50 L 15 45 L 0 45 Z" fill="#FF4500"/>
                    <rect x="15" y="45" width="20" height="50" fill="#FF4500"/>
                  </g>

                  <text x="72" y="100" fontFamily="Arial, sans-serif" fontSize="100" fontWeight="700" fill="#FF4500">
                    RedditRev
                  </text>

                  <g transform="translate(320, -3)">
                    <circle cx="20" cy="15" r="5" fill="white" stroke="#FF4500" strokeWidth="3"/>
                    <circle cx="20" cy="30" r="15" fill="white" stroke="#FF4500" strokeWidth="3"/>
                    <circle cx="15" cy="30" r="3" fill="#FF4500"/>
                    <circle cx="25" cy="30" r="3" fill="#FF4500"/>
                  </g>
                </g>
              </svg>
            </div>
          </Link>
          <p className="text-sm text-black/70 text-center md:text-left">
            Hand-picked resources <span className="text-[#FF5F1F]">♥</span> for Reddit product reviews.
          </p>
        </div>

        {/* Right section nav */}
        <div className="flex flex-wrap justify-center md:justify-end text-black gap-6 text-[16px]">
          <Link href="/pipeline" className="hover:text-[#e34f14] transition-colors">Pipeline</Link>
          <Link href="/faq" className="hover:text-[#e34f14] transition-colors">FAQs</Link>
          <Link href="/privacy-policy" className="hover:text-[#e34f14] transition-colors">Privacy Policy</Link>
          <Link href="/categories-list" className="hover:text-[#e34f14] transition-colors">Products Ranked List</Link>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="text-center py-4 text-sm text-[#FF5F1F]/80">
        © {new Date().getFullYear()} RedditRevs. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;