import { supabase } from '@/integrations/supabase/client';
import { productSlug } from '@/lib/slugify';

export async function generateSitemap(): Promise<string> {
  const baseUrl = 'https://hairytalesbeautyhome.com';
  
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/shop', priority: '0.9', changefreq: 'daily' },
    { path: '/custom-braided-wigs', priority: '0.7', changefreq: 'weekly' },
    { path: '/wholesale-deals', priority: '0.7', changefreq: 'weekly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/faq', priority: '0.4', changefreq: 'monthly' },
    { path: '/shipping', priority: '0.4', changefreq: 'monthly' },
    { path: '/returns', priority: '0.4', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
  ];

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('is_active', true);

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, updated_at');

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${page.path}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  // Category pages
  if (categories) {
    for (const cat of categories) {
      const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
      xml += `
  <url>
    <loc>${baseUrl}/shop/${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  }

  // Product pages
  if (products) {
    for (const product of products) {
      const slug = productSlug(product.name, product.id);
      xml += `
  <url>
    <loc>${baseUrl}/product/${slug}</loc>
    <lastmod>${new Date(product.updated_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return xml;
}
