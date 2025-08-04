import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Palette, Scissors, Clock, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PriceDisplay from "@/components/PriceDisplay";

const CustomBraidedWigs = () => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    wig_type: "",
    length: "",
    color: "",
    texture: "",
    special_instructions: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const wigTypes = [
    "Box Braids Wig",
    "Knotless Braids Wig",
    "Twist Braids Wig",
    "Micro Braids Wig",
    "Goddess Braids Wig",
    "French Braids Wig",
    "Cornrow Wig",
    "Custom Style",
  ];

  const lengths = [
    '12"',
    '14"',
    '16"',
    '18"',
    '20"',
    '22"',
    '24"',
    '26"',
    '28"',
    '30"',
  ];
  const colors = [
    "Natural Black",
    "Dark Brown",
    "Medium Brown",
    "Light Brown",
    "Auburn",
    "Blonde",
    "Gray",
    "Custom Color",
  ];
  const textures = [
    "Yaki Straight",
    "Body Wave",
    "Deep Wave",
    "Kinky Straight",
    "Kinky Curly",
    "Water Wave",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("custom_wig_orders")
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Order Submitted!",
        description:
          "We'll contact you within 24 hours with a quote and timeline.",
      });

      // Reset form
      setFormData({
        customer_name: "",
        customer_email: "",
        customer_phone: "",
        wig_type: "",
        length: "",
        color: "",
        texture: "",
        special_instructions: "",
      });
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Custom Braided Wigs
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create your perfect braided wig with our expert stylists
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Palette className="w-5 h-5 mr-2 text-pink-500" />
              Custom Colors
            </div>
            <div className="flex items-center">
              <Scissors className="w-5 h-5 mr-2 text-pink-500" />
              Expert Crafting
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-pink-500" />
              2-3 Week Turnaround
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-pink-500" />
              Premium Quality
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Order Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">
                    Personal Information
                  </h3>
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.customer_name}
                      onChange={(e) =>
                        handleInputChange("customer_name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) =>
                        handleInputChange("customer_email", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.customer_phone}
                      onChange={(e) =>
                        handleInputChange("customer_phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Wig Specifications */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Wig Specifications</h3>
                  <div>
                    <Label htmlFor="wig-type">Wig Type *</Label>
                    <Select
                      value={formData.wig_type}
                      onValueChange={(value) =>
                        handleInputChange("wig_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select wig type" />
                      </SelectTrigger>
                      <SelectContent>
                        {wigTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="length">Length</Label>
                    <Select
                      value={formData.length}
                      onValueChange={(value) =>
                        handleInputChange("length", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        {lengths.map((length) => (
                          <SelectItem key={length} value={length}>
                            {length}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value) =>
                        handleInputChange("color", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="texture">Texture</Label>
                    <Select
                      value={formData.texture}
                      onValueChange={(value) =>
                        handleInputChange("texture", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select texture" />
                      </SelectTrigger>
                      <SelectContent>
                        {textures.map((texture) => (
                          <SelectItem key={texture} value={texture}>
                            {texture}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="instructions">Special Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any specific requirements, styling preferences, or additional notes..."
                      value={formData.special_instructions}
                      onChange={(e) =>
                        handleInputChange(
                          "special_instructions",
                          e.target.value
                        )
                      }
                      rows={4}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  variant="pink"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Custom Order"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Information Panel */}
          <div className="space-y-6">
            {/* Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Badge className="bg-pink-100 text-pink-700 mt-1">1</Badge>
                  <div>
                    <h4 className="font-medium">Submit Your Order</h4>
                    <p className="text-sm text-gray-600">
                      Fill out the form with your specifications
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-pink-100 text-pink-700 mt-1">2</Badge>
                  <div>
                    <h4 className="font-medium">Get Your Quote</h4>
                    <p className="text-sm text-gray-600">
                      We'll contact you within 24 hours with pricing
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-pink-100 text-pink-700 mt-1">3</Badge>
                  <div>
                    <h4 className="font-medium">Expert Crafting</h4>
                    <p className="text-sm text-gray-600">
                      Our stylists create your custom wig
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="bg-pink-100 text-pink-700 mt-1">4</Badge>
                  <div>
                    <h4 className="font-medium">Quality Check & Delivery</h4>
                    <p className="text-sm text-gray-600">
                      Final inspection and secure shipping
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <div className="flex justify-between items-center">
                  <span>Box Braids (16"-20")</span>
                  <div className="font-medium flex flex-row gap-2">
                    <PriceDisplay price={180} designCSS="" className="py-0" /> -
                    <PriceDisplay price={250} designCSS="" className="py-0" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Knotless Braids (16"-20")</span>
                  <div className="font-medium flex flex-row gap-2">
                      <PriceDisplay price={200} designCSS="" className="py-0" /> -
                  <PriceDisplay price={280} designCSS="" className="py-0" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Goddess Braids (16"-20")</span>
                  <span className="font-medium">$220 - $300</span>
                </div> */}
                <div className="flex justify-between items-center">
                  <span>Custom Styles</span>
                  <span className="font-medium">Quote on request</span>
                </div>
                <Separator />
                <div className="text-sm text-gray-600">
                  {/* <p>• Longer lengths: +$20-50</p>
                  <p>• Premium colors: +$30</p> */}
                  <p className="flex flex-row">
                    • Rush orders (1 week): +{" "}
                    <PriceDisplay price={100} designCSS="" className="py-0" />
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Questions?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Our custom wig specialists are here to help you create the
                  perfect piece.
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    📞 Call:{" "}
                    <a
                      href="tel:+233558384512"
                      className="hover:underline text-sm"
                    >
                      (+233) 558-384-512
                    </a>
                  </p>
                  <p>
                    📧 Email:{" "}
                    <a
                      href="mailto:hairytalesbeauty@gmail.com"
                      className="hover:underline"
                    >
                      hairytalesbeauty@gmail.com
                    </a>
                  </p>
                  {/* <p>💬 Live Chat: Available 9am-6pm EST</p> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CustomBraidedWigs;
