-- Clear all data properly
TRUNCATE TABLE hero_settings CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE subcategories CASCADE;
TRUNCATE TABLE discounts CASCADE;
TRUNCATE TABLE instagram_posts CASCADE;
TRUNCATE TABLE instagram_settings CASCADE;
TRUNCATE TABLE social_links CASCADE;

-- Insert fresh sample data with correct category values
INSERT INTO categories (name, slug, description, is_active) VALUES
('Hair Extensions', 'hair-extensions', 'Premium quality hair extensions', true),
('Beauty Products', 'beauty-products', 'Professional beauty and care products', true);

INSERT INTO products (name, category, price, image, description, is_best_seller, is_new) VALUES
('Luxury Blonde Extensions', 'Hair Extensions', 299.99, 'https://images.unsplash.com/photo-1582467092130-8f0dcbc04b89?w=500', 'Premium blonde hair extensions with natural texture', true, false),
('Silky Brown Extensions', 'Hair Extensions', 249.99, 'https://images.unsplash.com/photo-1595475038665-82c0e2f40bb1?w=500', 'Beautiful brown hair extensions for volume and length', false, true),
('Hair Care Serum', 'Beauty Products', 49.99, 'https://images.unsplash.com/photo-1556228578-dd339d3b3a2a?w=500', 'Nourishing serum for healthy hair', false, false);

INSERT INTO hero_settings (title, subtitle, cta_text, cta_url, is_active) VALUES
('Transform Your Look with Premium Hair Extensions', 'Discover our collection of luxury hair extensions and beauty products for the perfect style transformation.', 'Shop Now', '/shop', true);

INSERT INTO social_links (platform, url, display_order, is_active) VALUES
('Instagram', 'https://instagram.com/hairytalesbeaty', 1, true),
('Facebook', 'https://facebook.com/hairytalesbeaty', 2, true),
('TikTok', 'https://tiktok.com/@hairytalesbeaty', 3, true);

INSERT INTO instagram_settings (display_feed, feed_title, feed_subtitle, instagram_handle) VALUES
(true, 'Follow Our Journey', 'See our latest transformations and beauty tips', '@hairytalesbeaty');