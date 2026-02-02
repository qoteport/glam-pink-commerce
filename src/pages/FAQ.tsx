import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  HelpCircle,
  Package,
  Truck,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      title: "Orders & Shopping",
      icon: Package,
      faqs: [
        {
          question: "How do I place an order?",
          answer:
            "Simply browse our products, select your desired items, choose your options (color, length), add to cart, and proceed to checkout. You can pay securely with our various payment methods.",
        },
        {
          question: "Can I modify or cancel my order?",
          answer:
            "You can modify or cancel your order within 1 hour of placing it by contacting our customer service. After processing begins, modifications may not be possible.",
        },
        {
          question: "Do you offer wholesale pricing?",
          answer:
            "Yes! We offer wholesale deals for bulk orders. Visit our Wholesale Deals page or contact us directly for custom pricing on large quantities.",
        },
        {
          question: "How do I track my order?",
          answer:
            'Once your order ships, you\'ll receive an email with a tracking number. You can also view your order status by logging into your account and visiting "My Orders".',
        },
      ],
    },
    {
      title: "Shipping & Delivery",
      icon: Truck,
      faqs: [
        {
          question: "What are your shipping options?",
          answer:
            "We offer Standard Shipping (5-7 days), Express Shipping (2-3 days), and Same Day Delivery in select cities. International shipping is also available.",
        },
        {
          question: "Do you offer free shipping?",
          answer:
            "Yes! Orders over ₵200 within Ghana qualify for free standard shipping. International orders have varying shipping costs based on location.",
        },
        {
          question: "How long does processing take?",
          answer:
            "Most orders are processed within 1-2 business days. Custom wigs require 7-14 business days for creation before shipping.",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Yes, we ship to over 50+ countries worldwide. International delivery takes 7-21 business days depending on location.",
        },
      ],
    },
    {
      title: "Payments",
      icon: CreditCard,
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept credit cards, debit cards, mobile money (MTN, Vodafone, AirtelTigo), bank transfers, and cash on delivery for local orders.",
        },
        {
          question: "Is my payment information secure?",
          answer:
            "Absolutely! We use industry-standard SSL encryption and work with trusted payment processors to ensure your information is completely secure.",
        },
        {
          question: "Can I pay on delivery?",
          answer:
            "Yes, we offer cash on delivery for orders within Ghana.",
        },
        {
          question: "What if my payment fails?",
          answer:
            "If your payment fails, you'll receive an email with instructions to retry. Your order will be held for 24 hours before cancellation.",
        },
      ],
    },
    {
      title: "Returns & Exchanges",
      icon: RefreshCw,
      faqs: [
        {
          question: "What is your return policy?",
          answer:
            "We offer 30-day returns for unused items in original condition. Custom-made items and opened hair care products cannot be returned.",
        },
        {
          question: "How do I return an item?",
          answer:
            "Contact us at returns@hairytalesbeauty.com with your order number. We'll provide a prepaid return label and process your refund within 5-7 days of receiving the return.",
        },
        {
          question: "Can I exchange for a different size or color?",
          answer:
            "Yes! We offer free exchanges for different sizes, colors, or lengths. Contact us to arrange an exchange.",
        },
        {
          question: "How long do refunds take?",
          answer:
            "Refunds are processed within 5-7 business days after we receive your returned item. The time to appear in your account depends on your payment method.",
        },
      ],
    },
  ];

  const filteredFAQs = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-blush-50">
      <div className="mb-[70px]">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Find answers to common questions about our products, orders,
            shipping, and policies.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {filteredFAQs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try different keywords or browse our categories below.
                </p>
                <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="w-5 h-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`item-${categoryIndex}-${faqIndex}`}
                      >
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Contact Support */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Still Have Questions?</CardTitle>
            <CardDescription>
              Can't find what you're looking for? Our support team is here to
              help!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div>
                <p className="text-gray-600 mb-2">
                  Contact our friendly customer service team for personalized
                  assistance.
                </p>
                <div className="text-sm text-gray-500">
                  <p>

                    <p>
                      Email:{" "}
                      <a
                        href="mailto:hairytalesbeautyhome@gmail.com"
                        className="hover:underline"
                      >
                        hairytalesbeautyhome@gmail.com
                      </a>
                    </p>
                  </p>
                  <div>
                    Phone:{" "}
                    <a
                      href="tel:+233558384512"
                      className="hover:underline text-sm"
                    >
                      (+233) 558-384-512
                    </a>
                  </div>
                  <div>
                    WhatsApp:{" "}
                    <a
                      href="https://wa.me/233542511844"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-sm"
                    >
                      (+233) 558-384-512
                    </a>
                  </div>
                  <p>Hours: Monday - Friday, 9AM - 6PM GMT</p>
                </div>
              </div>
              <Button>Contact Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default FAQ;
