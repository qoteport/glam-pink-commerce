
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MyOrders from '@/components/MyOrders';

const MyOrdersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
       <div className="mb-[100px]">
        <Header />
      </div>
      <MyOrders />
      <Footer />
    </div>
  );
};

export default MyOrdersPage;
