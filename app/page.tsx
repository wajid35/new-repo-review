'use client';
import Navbar from './components/NavbarComponent';
import Footer from './components/Footer';
import Categories from '@/app/categories/page';

export default function Home() {
  return (
    <div className="bg-white text-[#FF5F1F]">
      <Navbar />
      <Categories />
      <Footer />
    </div>
  );
}
