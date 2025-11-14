"use client";
import Button from "@/app/components/Button";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/aboutus' },
  { label: 'FAQs', href: '/faq' },
  { label: 'Top Ranked List', href: '/categories-list' },
]

export default function Navbar() {
  const [isOpen, setisOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <section className={twMerge(
        "py-4 lg:py-8 fixed w-full top-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white/70 backdrop-blur-lg shadow-lg" : "bg-white"
      )}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={twMerge(
            "border border-[#FF5F1F]/30 text-[#FF5F1F] rounded-[27px] md:rounded-full shadow-md transition-all duration-300",
            isScrolled ? "bg-white/60 backdrop-blur-md" : "bg-white/80"
          )}>
            <div className="flex items-center justify-between p-2 px-4 md:pr-2">

              {/* Left: Logo */}
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

              {/* Middle: Nav Links */}
              <nav className="hidden lg:flex gap-6 font-medium text-black">
                {navLinks.map((i) => (
                  <a href={i.href} key={i.label} className="hover:text-[#ff7847] transition-colors">
                    {i.label}
                  </a>
                ))}
              </nav>

              {/* Right: Menu + Buttons */}
              <div className="flex items-center gap-4">
                {/* Mobile menu */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  onClick={() => setisOpen(!isOpen)}
                  className="feather feather-menu md:hidden text-[#FF5F1F] cursor-pointer"
                >
                  <line x1={3} y1={12} x2={21} y2={12} className={twMerge('origin-center transition-transform duration-300', isOpen && 'rotate-45 translate-0.5 translate-y-1')} />
                  <line x1={3} y1={6} x2={21} y2={6} className={twMerge('origin-center transition-all duration-300', isOpen && 'opacity-0 rotate-180')} />
                  <line x1={3} y1={18} x2={21} y2={18} className={twMerge('origin-center transition-transform duration-300', isOpen && '-rotate-45')} />
                </svg>

                {/* Desktop buttons */}
                <Link href="/categories">
                  <Button variant="secondary" className="hidden cursor-pointer md:inline-flex items-center text-[#FF5F1F] border-[#FF5F1F] hover:bg-[#FF5F1F] hover:text-white transition">
                    Ranked Categories
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="primary" className="hidden cursor-pointer md:inline-flex items-center bg-[#FF5F1F] text-white hover:bg-[#e34f14] transition">
                    All Products
                  </Button>
                </Link>
              </div>
            </div>
            <AnimatePresence>
              {isOpen && (
                <motion.div className="overflow-hidden"
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                >
                  <div className="flex flex-col items-center gap-4 py-4 text-[#FF5F1F]">
                    {navLinks.map((i) =>
                      <a href={i.href} key={i.label} className="hover:text-[#ff7847] transition-colors">{i.label}</a>
                    )}
                    <Link href="/categories">
                      <Button variant="secondary" className="text-[#FF5F1F] border-[#FF5F1F] hover:bg-[#FF5F1F] hover:text-white transition">Ranked Categories</Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="primary" className="bg-[#FF5F1F] text-white hover:bg-[#e34f14] transition">All Products</Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
      <div className="h-24 md:h-28 lg:h-32"></div>
    </>
  )
}