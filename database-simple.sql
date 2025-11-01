-- STEP 1: Clean Start - Drop everything first
DROP TABLE IF EXISTS target_markets CASCADE;
DROP TABLE IF EXISTS potential_buyers CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ai_predictions CASCADE;
DROP TABLE IF EXISTS market_reports CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS gtip_codes CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

DROP VIEW IF EXISTS company_overview CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- STEP 2: Create Companies table (BASE - no dependencies)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  country TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  hs_code TEXT,
  category TEXT,
  unit_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: Create AI Predictions table
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL,
  target_market TEXT,
  period TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  prediction_data JSONB,
  key_insights TEXT[],
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: Create other tables
CREATE TABLE market_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  market_name TEXT NOT NULL,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 6: Create indexes
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_predictions_company ON ai_predictions(company_id);
CREATE INDEX idx_reports_company ON market_reports(company_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- STEP 7: Insert test data
INSERT INTO companies (id, name, email, country, industry)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo İhracat A.Ş.',
  'demo@create-anything.com',
  'Turkey',
  'Textile'
);

INSERT INTO products (company_id, product_name, hs_code, category, unit_price, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Premium Cotton T-Shirt',
  '6109.10',
  'Apparel',
  15.99,
  'High-quality 100% organic cotton t-shirt'
);

-- STEP 8: Verify
SELECT 
  'SUCCESS! Tables created: ' || COUNT(*)::TEXT as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('companies', 'products', 'ai_predictions', 'market_reports', 'notifications');

SELECT 'Test company: ' || name as test_data FROM companies LIMIT 1;
SELECT 'Test product: ' || product_name as test_data FROM products LIMIT 1;

