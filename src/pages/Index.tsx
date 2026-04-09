
import React from 'react';
import Header from '@/components/Header';
import DynamicHero from '@/components/DynamicHero';
import ProductShowcase from '@/components/ProductShowcase';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import OfferBanner from '@/components/OfferBanner';
import SEOHead from '@/components/SEOHead';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Hairy Tales Beauty Home - Premium Wigs & Hair Extensions"
        description="Shop premium quality wigs, bundles, closures, and frontals. Trusted by thousands worldwide. Free shipping on select orders."
        canonicalPath="/"
      />
      <div className="mb-[100px]">
        <Header />
      </div>
      <main className='lg:mx-[50px]'>
        <DynamicHero />
        <div className='mt-5'>
          <OfferBanner />
        </div>
        <ProductShowcase />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
