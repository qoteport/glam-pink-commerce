import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, MessageCircle, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const QuoteRequestForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_whatsapp: '',
    company_name: '',
    business_type: '',
    products_interested: '',
    quantity_needed: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('quote_requests')
        .insert([formData]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Quote Request Submitted!',
        description: 'We will get back to you within 24 hours.',
      });
    } catch (error) {
      console.error('Error submitting quote:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit quote request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-4">Thank You!</h3>
          <p className="text-muted-foreground mb-6">
            Your quote request has been received. Our wholesale team will contact you within 24 hours.
          </p>
          <Button onClick={() => setIsSubmitted(false)}>
            Submit Another Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Contact Info Sidebar */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>Contact Us Directly</CardTitle>
          <CardDescription>Reach out through any of these channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Phone</h4>
              <a href="tel:+233558384512" className="text-muted-foreground hover:text-primary transition-colors">
               +233 558 384 512
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">WhatsApp</h4>
              <a 
                href="https://wa.me/+233542511844?text=Hello! I'm interested in wholesale pricing for your products."
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-green-600 transition-colors"
              >
                +233 542 511 844
              </a>
              <p className="text-xs text-muted-foreground mt-1">Click to chat directly</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Email</h4>
              <a href="mailto:hairytalesbeauty@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                hairytalesbeauty@gmail.com
              </a>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Location</h4>
              <p className="text-muted-foreground text-sm">
                Accra, Ghana
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Business Hours</h4>
              <p className="text-muted-foreground text-sm">
                Mon - Fri: 9AM - 6PM<br />
                Sat: 10AM - 4PM
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Request a Quote</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you with pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Full Name *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email Address *</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone Number</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_whatsapp">WhatsApp Number</Label>
                <Input
                  id="customer_whatsapp"
                  name="customer_whatsapp"
                  value={formData.customer_whatsapp}
                  onChange={handleChange}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company/Business Name</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type</Label>
                <Select onValueChange={(value) => handleSelectChange('business_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salon">Salon</SelectItem>
                    <SelectItem value="retailer">Retailer</SelectItem>
                    <SelectItem value="distributor">Distributor</SelectItem>
                    <SelectItem value="stylist">Independent Stylist</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="products_interested">Products Interested In</Label>
                <Input
                  id="products_interested"
                  name="products_interested"
                  value={formData.products_interested}
                  onChange={handleChange}
                  placeholder="e.g., Lace wigs, Braided wigs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity_needed">Quantity Needed</Label>
                <Select onValueChange={(value) => handleSelectChange('quantity_needed', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quantity range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-10">5 - 10 pieces</SelectItem>
                    <SelectItem value="10-25">10 - 25 pieces</SelectItem>
                    <SelectItem value="25-50">25 - 50 pieces</SelectItem>
                    <SelectItem value="50-100">50 - 100 pieces</SelectItem>
                    <SelectItem value="100+">100+ pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your requirements, specific products, or any questions..."
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Quote Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteRequestForm;
