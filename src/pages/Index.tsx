
import React from 'react';
import Header from '@/components/Header';
import DynamicHero from '@/components/DynamicHero';
import ProductShowcase from '@/components/ProductShowcase';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
       <div className="mb-[100px]">
        <Header />
      </div>
      <main className='lg:mx-[50px]'>
        <DynamicHero />
        <ProductShowcase />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
