-- Seed data for SafetyPro e-commerce platform

-- Insert sample brands
INSERT INTO brands (id, name, slug, logo_path, is_active) VALUES
('b1', '3M', '3m', 'brands/3m-logo.png', true),
('b2', 'Honeywell', 'honeywell', 'brands/honeywell-logo.png', true),
('b3', 'DuPont', 'dupont', 'brands/dupont-logo.png', true),
('b4', 'MSA', 'msa', 'brands/msa-logo.png', true);

-- Insert sample categories
INSERT INTO categories (id, name, slug, description, parent_id, image_path, is_active, sort_order) VALUES
('c1', 'Head Protection', 'head-protection', 'Safety helmets and hard hats', null, 'categories/head-protection.jpg', true, 1),
('c2', 'Eye & Face Protection', 'eye-face-protection', 'Safety glasses and face shields', null, 'categories/eye-protection.jpg', true, 2),
('c3', 'Respiratory Protection', 'respiratory-protection', 'Masks and respirators', null, 'categories/respiratory.jpg', true, 3),
('c4', 'Hand Protection', 'hand-protection', 'Safety gloves', null, 'categories/hand-protection.jpg', true, 4),
('c5', 'Body Protection', 'body-protection', 'Safety vests and coveralls', null, 'categories/body-protection.jpg', true, 5),
('c6', 'Foot Protection', 'foot-protection', 'Safety boots and shoes', null, 'categories/foot-protection.jpg', true, 6);

-- Insert sample products
INSERT INTO products (
  id, sku, name, slug, category_id, brand_id,
  description_html, specs, attributes,
  price_mrp, price_sell, currency,
  stock_qty, low_stock_threshold,
  images, badges, tags,
  is_active, is_featured
) VALUES
(
  'p1',
  'HH-3M-001',
  '3M H-700 Series Hard Hat - White',
  '3m-h700-hard-hat-white',
  'c1',
  'b1',
  '<p>Premium hard hat with ratchet suspension system. Meets ANSI Z89.1 standards.</p>',
  '[{"key":"Material","value":"ABS Plastic"},{"key":"Weight","value":"350g"},{"key":"Standard","value":"ANSI Z89.1"}]'::jsonb,
  '{"color":["White","Yellow","Blue"],"size":["Standard","Large"]}'::jsonb,
  1200,
  999,
  'INR',
  50,
  10,
  '[{"path":"products/hard-hat-white.jpg","alt":"3M Hard Hat White","is_primary":true}]'::jsonb,
  ARRAY['Bestseller', 'Premium'],
  ARRAY['hard hat', 'safety helmet', 'head protection'],
  true,
  true
),
(
  'p2',
  'SG-3M-002',
  '3M SecureFit Safety Glasses - Clear Lens',
  '3m-securefit-safety-glasses',
  'c2',
  'b1',
  '<p>Lightweight safety glasses with anti-fog coating. Comfortable all-day wear.</p>',
  '[{"key":"Lens Material","value":"Polycarbonate"},{"key":"UV Protection","value":"99.9%"},{"key":"Weight","value":"25g"}]'::jsonb,
  '{"lens_color":["Clear","Smoke","Amber"]}'::jsonb,
  450,
  349,
  'INR',
  150,
  20,
  '[{"path":"products/safety-glasses.jpg","alt":"3M Safety Glasses","is_primary":true}]'::jsonb,
  ARRAY['Bestseller'],
  ARRAY['safety glasses', 'eye protection'],
  true,
  true
),
(
  'p3',
  'RM-HW-003',
  'Honeywell N95 Respirator Mask - Pack of 10',
  'honeywell-n95-respirator-mask',
  'c3',
  'b2',
  '<p>NIOSH approved N95 respirator masks. Filters at least 95% of airborne particles.</p>',
  '[{"key":"Filtration","value":"95%"},{"key":"Pack Size","value":"10 pieces"},{"key":"Certification","value":"NIOSH N95"}]'::jsonb,
  '{}'::jsonb,
  800,
  649,
  'INR',
  200,
  30,
  '[{"path":"products/n95-mask.jpg","alt":"N95 Respirator Mask","is_primary":true}]'::jsonb,
  ARRAY['Essential', 'Certified'],
  ARRAY['n95 mask', 'respirator', 'breathing protection'],
  true,
  true
),
(
  'p4',
  'GL-DP-004',
  'DuPont Cut-Resistant Gloves - Level 5',
  'dupont-cut-resistant-gloves',
  'c4',
  'b3',
  '<p>High-performance cut-resistant gloves with excellent grip. Level 5 cut protection.</p>',
  '[{"key":"Cut Level","value":"Level 5"},{"key":"Material","value":"HPPE + Nitrile"},{"key":"Size","value":"Multiple"}]'::jsonb,
  '{"size":["S","M","L","XL","XXL"]}'::jsonb,
  550,
  449,
  'INR',
  120,
  15,
  '[{"path":"products/cut-resistant-gloves.jpg","alt":"Cut Resistant Gloves","is_primary":true}]'::jsonb,
  ARRAY['Premium', 'Level 5'],
  ARRAY['safety gloves', 'cut resistant', 'hand protection'],
  true,
  true
),
(
  'p5',
  'VT-3M-005',
  '3M High-Visibility Safety Vest - Orange',
  '3m-hi-vis-safety-vest',
  'c5',
  'b1',
  '<p>ANSI Class 2 high-visibility safety vest with reflective stripes. Breathable mesh material.</p>',
  '[{"key":"Class","value":"ANSI Class 2"},{"key":"Material","value":"Polyester Mesh"},{"key":"Reflective Tape","value":"2-inch"}]'::jsonb,
  '{"size":["M","L","XL","XXL"],"color":["Orange","Yellow","Lime"]}'::jsonb,
  350,
  279,
  'INR',
  180,
  25,
  '[{"path":"products/safety-vest.jpg","alt":"High Visibility Safety Vest","is_primary":true}]'::jsonb,
  ARRAY['Bestseller'],
  ARRAY['safety vest', 'hi-vis', 'body protection'],
  true,
  true
),
(
  'p6',
  'SB-MSA-006',
  'MSA Steel Toe Safety Boots - Black',
  'msa-steel-toe-safety-boots',
  'c6',
  'b4',
  '<p>Durable steel toe safety boots with slip-resistant sole. Meets ASTM F2413 standards.</p>',
  '[{"key":"Toe Protection","value":"Steel Toe"},{"key":"Standard","value":"ASTM F2413"},{"key":"Sole","value":"Slip-Resistant"}]'::jsonb,
  '{"size":["6","7","8","9","10","11","12"]}'::jsonb,
  2500,
  1999,
  'INR',
  80,
  10,
  '[{"path":"products/safety-boots.jpg","alt":"Steel Toe Safety Boots","is_primary":true}]'::jsonb,
  ARRAY['Premium', 'Durable'],
  ARRAY['safety boots', 'steel toe', 'foot protection'],
  true,
  true
),
(
  'p7',
  'HH-HW-007',
  'Honeywell A79 Hard Hat with Face Shield',
  'honeywell-a79-hard-hat-face-shield',
  'c1',
  'b2',
  '<p>Complete head and face protection system with integrated face shield and hard hat.</p>',
  '[{"key":"Material","value":"ABS"},{"key":"Face Shield","value":"Polycarbonate"},{"key":"Weight","value":"450g"}]'::jsonb,
  '{"color":["Yellow","White"]}'::jsonb,
  1800,
  1449,
  'INR',
  45,
  10,
  '[{"path":"products/hard-hat-face-shield.jpg","alt":"Hard Hat with Face Shield","is_primary":true}]'::jsonb,
  ARRAY['Complete Protection'],
  ARRAY['hard hat', 'face shield', 'head protection'],
  true,
  false
),
(
  'p8',
  'GL-3M-008',
  '3M Nitrile Coated Work Gloves - 12 Pairs',
  '3m-nitrile-work-gloves',
  'c4',
  'b1',
  '<p>Comfortable nitrile coated work gloves with excellent grip. Value pack of 12 pairs.</p>',
  '[{"key":"Coating","value":"Nitrile"},{"key":"Quantity","value":"12 pairs"},{"key":"Breathability","value":"High"}]'::jsonb,
  '{"size":["M","L","XL"]}'::jsonb,
  600,
  499,
  'INR',
  95,
  15,
  '[{"path":"products/nitrile-gloves.jpg","alt":"Nitrile Work Gloves","is_primary":true}]'::jsonb,
  ARRAY['Value Pack'],
  ARRAY['work gloves', 'nitrile', 'hand protection'],
  true,
  true
);

-- Insert sample testimonials
INSERT INTO testimonials (author_name, author_role, quote, rating, is_active, sort_order) VALUES
('Rajesh Kumar', 'Safety Manager, ABC Industries', 'Outstanding quality and service. SafetyPro has been our trusted partner for over 5 years. Their product range and delivery speed are unmatched.', 5, true, 1),
('Priya Sharma', 'Operations Director, XYZ Manufacturing', 'The best safety equipment supplier in India. Their team understands our needs and always delivers on time. Highly recommended!', 5, true, 2);

-- Insert sample suppliers
INSERT INTO suppliers (name, logo_path, website_url, is_active, sort_order) VALUES
('First Solar', 'suppliers/first-solar.png', 'https://firstsolar.com', true, 1),
('Nordex', 'suppliers/nordex.png', 'https://nordex.com', true, 2),
('TPI Composites', 'suppliers/tpi.png', 'https://tpicomposites.com', true, 3),
('Siemens Gamesa', 'suppliers/siemens-gamesa.png', 'https://siemensgamesa.com', true, 4),
('Wittur', 'suppliers/wittur.png', 'https://wittur.com', true, 5);

-- Insert sample banners
INSERT INTO banners (title, subtitle, cta_text, cta_url, image_path, position, priority, is_active) VALUES
('YOUR SAFETY, OUR PRIORITY', 'India''s Largest Safety Equipment Supplier', 'Shop Now', '/shop', 'banners/hero-safety.jpg', 'hero', 1, true),
('New Arrivals', 'Check out our latest safety equipment', 'View Collection', '/shop?filter=new', 'banners/new-arrivals.jpg', 'promo', 2, true);

-- Insert sample blog post
INSERT INTO posts (
  title, slug, content_html, excerpt, tags,
  is_published, published_at
) VALUES (
  'Essential Safety Equipment for Construction Sites',
  'essential-safety-equipment-construction',
  '<h2>Introduction</h2><p>Construction sites are inherently dangerous workplaces. Proper safety equipment is essential to protect workers from potential hazards.</p><h2>Must-Have Equipment</h2><ul><li>Hard Hats</li><li>Safety Glasses</li><li>High-Visibility Vests</li><li>Steel Toe Boots</li><li>Work Gloves</li></ul><p>Investing in quality safety equipment is investing in your team''s wellbeing.</p>',
  'Learn about the essential safety equipment every construction site needs to keep workers protected.',
  ARRAY['safety', 'construction', 'equipment'],
  true,
  now()
);

-- Note: Admin account creation should be done separately via a secure script
-- Admin password should be hashed with bcrypt before inserting