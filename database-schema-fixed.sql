-- Create Anything App - Database Schema (FIXED)
-- Supabase PostgreSQL Database
-- Version: 1.1 - Fixed dependency order
-- Date: 2025-11-01

-- ============================================
-- STEP 1: CREATE TABLES (No Dependencies First)
-- ============================================

-- Companies table (no dependencies)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  country TEXT,
  city TEXT,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (references companies)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'user',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table (references companies)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  hs_code TEXT,
  category TEXT,
  material TEXT,
  technical_specs TEXT,
  unit_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  description TEXT,
  image_url TEXT,
  min_order_quantity INTEGER,
  production_capacity TEXT,
  certifications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('market_forecast', 'price_trend', 'demand_prediction')),
  target_market TEXT,
  product_category TEXT,
  hs_code TEXT,
  period TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  prediction_data JSONB NOT NULL,
  key_insights TEXT[],
  recommendations TEXT[],
  data_sources TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Reports table
CREATE TABLE IF NOT EXISTS market_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  market_name TEXT NOT NULL,
  country_code TEXT,
  report_type TEXT,
  report_period TEXT,
  report_data JSONB,
  trade_volume DECIMAL(15,2),
  growth_rate DECIMAL(5,2),
  key_competitors TEXT[],
  market_trends TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Target Markets table
CREATE TABLE IF NOT EXISTS target_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  market_score DECIMAL(3,2),
  potential_revenue DECIMAL(15,2),
  market_barriers TEXT[],
  opportunities TEXT[],
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'identified',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  target_market TEXT,
  campaign_type TEXT,
  budget DECIMAL(15,2),
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft',
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Potential Buyers table
CREATE TABLE IF NOT EXISTS potential_buyers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_country TEXT,
  buyer_industry TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  estimated_order_volume TEXT,
  interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')),
  notes TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GTIP Codes table (independent)
CREATE TABLE IF NOT EXISTS gtip_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gtip_code TEXT UNIQUE NOT NULL,
  description_tr TEXT NOT NULL,
  description_en TEXT,
  category TEXT,
  tax_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_hs_code ON products(hs_code);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_company_id ON ai_predictions(company_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_type ON ai_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_market_reports_company_id ON market_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_target_markets_company_id ON target_markets(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_potential_buyers_company_id ON potential_buyers(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_gtip_codes_code ON gtip_codes(gtip_code);

-- ============================================
-- STEP 3: INSERT SAMPLE DATA
-- ============================================

-- Insert test company
INSERT INTO companies (id, name, email, country, industry)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo İhracat A.Ş.',
  'demo@create-anything.com',
  'Turkey',
  'Textile'
) ON CONFLICT (id) DO NOTHING;

-- Insert test product
INSERT INTO products (company_id, product_name, hs_code, category, unit_price, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Premium Cotton T-Shirt',
  '6109.10',
  'Apparel',
  15.99,
  'High-quality 100% organic cotton t-shirt for export'
) ON CONFLICT DO NOTHING;

-- Insert test GTIP codes
INSERT INTO gtip_codes (gtip_code, description_tr, description_en, category, tax_rate)
VALUES 
  ('6109.10', 'Pamuktan T-shirtler', 'T-shirts of cotton', 'Apparel', 12.0),
  ('6203.41', 'Yünden veya ince hayvan kılından pantolonlar', 'Trousers of wool or fine animal hair', 'Apparel', 12.0),
  ('6204.62', 'Pamuktan pantolonlar (kadın/kız)', 'Trousers of cotton, women/girls', 'Apparel', 12.0)
ON CONFLICT (gtip_code) DO NOTHING;

-- ============================================
-- STEP 4: CREATE VIEWS
-- ============================================
CREATE OR REPLACE VIEW company_overview AS
SELECT 
  c.id,
  c.name,
  c.country,
  c.industry,
  COUNT(DISTINCT p.id) as total_products,
  COUNT(DISTINCT ap.id) as total_predictions,
  COUNT(DISTINCT tm.id) as total_target_markets
FROM companies c
LEFT JOIN products p ON c.id = p.company_id
LEFT JOIN ai_predictions ap ON c.id = ap.company_id
LEFT JOIN target_markets tm ON c.id = tm.company_id
GROUP BY c.id, c.name, c.country, c.industry;

-- ============================================
-- STEP 5: CREATE FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- STEP 6: CREATE TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Database schema created successfully! Tables: ' || COUNT(*)::TEXT || ' created.' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('companies', 'users', 'products', 'ai_predictions', 'market_reports', 
                     'target_markets', 'campaigns', 'potential_buyers', 'notifications', 'gtip_codes');

