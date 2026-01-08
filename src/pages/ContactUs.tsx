import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Crown,
  Heart,
  Star,
  Gift,
  Truck,
  Shield,
  Clock,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  followers_count: number;
}

const ContactUs = () => {
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setSocialLinks(data || []);
    } catch (error) {
      console.error("Error fetching social links:", error);
    }
  };

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    switch (platformLower) {
      case "instagram":
        return Instagram;
      case "facebook":
        return Facebook;
      case "youtube":
        return Youtube;
      case "twitter":
        return Twitter;
      case "linkedin":
        return Linkedin;
      default:
        return Instagram;
    }
  };

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon!",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-blush-50">
      <div className="mb-[100px]">
        <Header />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a question or need help? We'd love to hear from you. Send us a
            message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you within 24
                hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
                <CardDescription>
                  Reach out to us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blush-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-gray-600">hairytalesbeauty@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-blush-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <a
                          href="tel:+233558384512"
                          className="hover:underline text-sm"
                        >
                          (+233) 558-384-512
                        </a>
                        <a
                          href="https://wa.me/233558384512"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:underline text-sm"
                        >
                          WhatsApp
                        </a>
                      </div>

                      <div className="flex items-center space-x-2">
                        <a
                          href="tel:+233542511844"
                          className="hover:underline text-sm"
                        >
                          (+233) 542-511-844
                        </a>
                        <a
                          href="https://wa.me/233542511844"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:underline text-sm"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blush-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-gray-600">Madina new road</p>
                    <p className="text-gray-600">Accra, Greater Accra Region</p>
                    <p className="text-gray-600">Ghana</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blush-600 mt-1" />
                  <div>
                    <h3 className="font-semibold">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM
                    </p>
                    <p className="text-gray-600">
                      Saturday: 10:00 AM - 4:00 PM
                    </p>
                    <p className="text-gray-600">Sunday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
                <CardDescription>
                  Stay connected with us on social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-start space-x-6">
                  {socialLinks.map((social) => {
                    const IconComponent = getSocialIcon(social.platform);
                    return (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center space-y-1 hover:scale-110 transition-transform duration-200"
                        title={social.platform}
                      >
                        <div className="w-12 h-12  rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                          <IconComponent size={20} />
                        </div>
                        <span className="text-xs text-blush-500">
                          {formatFollowerCount(social.followers_count)}
                        </span>
                      </a>
                    );
                  })}
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

export default ContactUs;
