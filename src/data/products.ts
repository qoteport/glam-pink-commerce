
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: 'wigs' | 'bundles' | 'closures' | 'frontals';
  subcategory?: string;
  isNew?: boolean;
  isBestSeller?: boolean;
  colors?: string[];
  lengths?: string[];
  description?: string;
  features?: string[];
  hairType?: string;
  texture?: string;
}

export const products: Product[] = [
  // Wigs
  {
    id: '1',
    name: 'Brazilian Curly Lace Front Wig',
    price: 299,
    originalPrice: 399,
    rating: 4.9,
    reviewCount: 156,
    image: '/placeholder-wig-1.jpg',
    category: 'wigs',
    subcategory: 'Lace Front',
    isBestSeller: true,
    colors: ['#8B4513', '#D2B48C', '#000000'],
    lengths: ['16', '18', '20', '22'],
    description: 'Premium Brazilian curly lace front wig with natural hairline and breathable cap.',
    features: ['100% Virgin Hair', 'Pre-plucked Hairline', 'Bleached Knots', 'Natural Density'],
    hairType: 'Virgin Brazilian',
    texture: 'Curly'
  },
  {
    id: '2',
    name: 'Straight HD Lace Frontal Wig',
    price: 249,
    originalPrice: 329,
    rating: 4.8,
    reviewCount: 98,
    image: '/placeholder-wig-2.jpg',
    category: 'wigs',
    subcategory: 'HD Lace',
    isNew: true,
    colors: ['#000000', '#8B4513', '#654321'],
    lengths: ['14', '16', '18', '20'],
    description: 'Invisible HD lace frontal wig with silky straight texture.',
    features: ['HD Lace', 'Glueless Install', 'Natural Scalp', '150% Density'],
    hairType: 'Virgin Peruvian',
    texture: 'Straight'
  },
  {
    id: '3',
    name: 'Deep Wave 360 Lace Wig',
    price: 349,
    originalPrice: 449,
    rating: 4.9,
    reviewCount: 87,
    image: '/placeholder-wig-3.jpg',
    category: 'wigs',
    subcategory: '360 Lace',
    isBestSeller: true,
    colors: ['#8B4513', '#000000', '#D2B48C'],
    lengths: ['18', '20', '22', '24'],
    description: '360 lace wig with gorgeous deep wave pattern and full coverage.',
    features: ['360° Lace Coverage', 'Deep Wave Pattern', 'Medium Cap', '180% Density'],
    hairType: 'Virgin Malaysian',
    texture: 'Deep Wave'
  },
  {
    id: '4',
    name: 'Body Wave Bob Wig',
    price: 189,
    originalPrice: 249,
    rating: 4.7,
    reviewCount: 134,
    image: '/placeholder-wig-4.jpg',
    category: 'wigs',
    subcategory: 'Bob',
    colors: ['#000000', '#8B4513'],
    lengths: ['12', '14'],
    description: 'Chic body wave bob wig perfect for everyday wear.',
    features: ['Ready to Wear', 'Natural Parting', 'Soft Touch', '130% Density'],
    hairType: 'Virgin Indian',
    texture: 'Body Wave'
  },
  {
    id: '5',
    name: 'Kinky Straight Headband Wig',
    price: 199,
    originalPrice: 259,
    rating: 4.6,
    reviewCount: 76,
    image: '/placeholder-wig-5.jpg',
    category: 'wigs',
    subcategory: 'Headband',
    isNew: true,
    colors: ['#000000', '#654321'],
    lengths: ['16', '18', '20'],
    description: 'Convenient headband wig with kinky straight texture.',
    features: ['No Glue Needed', 'Adjustable Band', 'Natural Texture', '150% Density'],
    hairType: 'Virgin Brazilian',
    texture: 'Kinky Straight'
  },
  // Bundles
  {
    id: '6',
    name: 'Body Wave Hair Bundle Set',
    price: 199,
    originalPrice: 279,
    rating: 4.7,
    reviewCount: 203,
    image: '/placeholder-bundle-1.jpg',
    category: 'bundles',
    colors: ['#000000', '#8B4513', '#D2B48C', '#654321'],
    lengths: ['16', '18', '20'],
    description: 'Premium body wave hair bundles - set of 3.',
    features: ['100% Virgin Hair', 'Machine Weft', 'No Shedding', 'Can Be Dyed'],
    hairType: 'Virgin Brazilian',
    texture: 'Body Wave'
  },
  {
    id: '7',
    name: 'Straight Hair Bundles',
    price: 159,
    originalPrice: 219,
    rating: 4.8,
    reviewCount: 167,
    image: '/placeholder-bundle-2.jpg',
    category: 'bundles',
    isBestSeller: true,
    colors: ['#000000', '#8B4513'],
    lengths: ['14', '16', '18', '20'],
    description: 'Silky straight hair bundles with natural shine.',
    features: ['Premium Grade', 'Double Weft', 'Heat Resistant', 'Long Lasting'],
    hairType: 'Virgin Peruvian',
    texture: 'Straight'
  },
  {
    id: '8',
    name: 'Loose Wave Bundle Deal',
    price: 229,
    originalPrice: 299,
    rating: 4.9,
    reviewCount: 142,
    image: '/placeholder-bundle-3.jpg',
    category: 'bundles',
    colors: ['#000000', '#8B4513', '#D2B48C'],
    lengths: ['18', '20', '22'],
    description: 'Luxurious loose wave bundles with natural movement.',
    features: ['Virgin Quality', 'Minimal Processing', 'Soft Texture', 'Full Bundles'],
    hairType: 'Virgin Malaysian',
    texture: 'Loose Wave'
  },
  // Closures & Frontals
  {
    id: '9',
    name: '4x4 Lace Closure Straight',
    price: 89,
    originalPrice: 119,
    rating: 4.5,
    reviewCount: 89,
    image: '/placeholder-closure-1.jpg',
    category: 'closures',
    colors: ['#000000', '#8B4513'],
    lengths: ['14', '16', '18'],
    description: '4x4 lace closure with straight texture for natural parting.',
    features: ['Swiss Lace', 'Bleached Knots', 'Three Part Options', 'Natural Hairline'],
    hairType: 'Virgin Brazilian',
    texture: 'Straight'
  },
  {
    id: '10',
    name: '13x4 Lace Frontal Curly',
    price: 129,
    originalPrice: 169,
    rating: 4.7,
    reviewCount: 65,
    image: '/placeholder-frontal-1.jpg',
    category: 'frontals',
    colors: ['#8B4513', '#000000'],
    lengths: ['16', '18', '20'],
    description: '13x4 lace frontal with beautiful curly pattern.',
    features: ['Ear to Ear', 'Pre-plucked', 'Natural Curl Pattern', 'Medium Brown Lace'],
    hairType: 'Virgin Indian',
    texture: 'Curly'
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getSimilarProducts = (productId: string, limit = 4): Product[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return products
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery) ||
    product.texture?.toLowerCase().includes(lowercaseQuery) ||
    product.hairType?.toLowerCase().includes(lowercaseQuery)
  );
};
