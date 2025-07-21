export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  subcategory?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors?: string[];
  lengths?: string[];
  description?: string;
  features?: string[];
  hairType?: string;
  texture?: string;
  imageGallery?: string[];
  hairCareInstructions?: string;
  type?: string;
  liveVideoUrl?: string;
}