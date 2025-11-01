# 🚀 Supabase Hızlı Kurulum (5 Dakika)

## Adım 1: Supabase Projesi Oluştur

1. [Supabase Dashboard](https://supabase.com/dashboard) → Giriş yap/Kayıt ol
2. "New project" butonuna tıkla
3. Bilgileri doldur:
   ```
   Name: create-anything-db
   Database Password: [güçlü bir şifre - kaydet!]
   Region: Frankfurt (eu-central-1)
   Pricing Plan: Free
   ```
4. "Create new project" → Proje hazırlanıyor (2-3 dakika)

## Adım 2: Connection String Al

1. Project Settings → Database
2. "Connection string" bölümünde "URI" sekmesi
3. `[YOUR-PASSWORD]` yerine şifrenizi yazın
4. Connection string'i kopyalayın:
   ```
   postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

## Adım 3: Environment Variable Güncelle

`apps/web/.env` dosyasını açın ve güncelleyin:
```env
DATABASE_URL="postgresql://postgres.xxx:YOUR-PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```

## Adım 4: Veritabanı Tablolarını Oluştur

Supabase SQL Editor'de aşağıdaki SQL'i çalıştırın:

```sql
-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  country TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  hs_code TEXT,
  category TEXT,
  material TEXT,
  technical_specs TEXT,
  unit_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Predictions table
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL, -- market_forecast, price_trend, demand_prediction
  target_market TEXT,
  product_category TEXT,
  hs_code TEXT,
  period TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  prediction_data JSONB,
  key_insights TEXT[],
  recommendations TEXT[],
  data_sources TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market Reports table
CREATE TABLE market_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  market_name TEXT NOT NULL,
  report_type TEXT,
  report_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_company_id ON products(company_id);
CREATE INDEX idx_ai_predictions_company_id ON ai_predictions(company_id);
CREATE INDEX idx_market_reports_company_id ON market_reports(company_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (companies can only see their own data)
CREATE POLICY "Companies can view own data" ON companies
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own company products" ON products
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE auth.uid()::text = id::text)
  );

CREATE POLICY "Users can view own predictions" ON ai_predictions
  FOR SELECT USING (
    company_id IN (SELECT id FROM companies WHERE auth.uid()::text = id::text)
  );

-- Başarılı! 🎉
```

## Adım 5: Test Et

```bash
cd apps/web
npm run dev
```

Server başladıktan sonra:
```bash
curl http://localhost:3000/api/products?company_id=test
```

✅ Çalışıyorsa hazırsınız!

---

## 🔐 Authentication Entegrasyonu (Opsiyonel)

Supabase Auth kullanmak için:

1. Supabase Dashboard → Authentication → Providers
2. Email provider'ı aktif et
3. `apps/web/.env` dosyasına ekle:
```env
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
```

---

## 📊 Faydalı SQL Komutları

### Test verisi ekle
```sql
-- Test company
INSERT INTO companies (id, name, email, country, industry)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test İhracat A.Ş.',
  'test@example.com',
  'Turkey',
  'Textile'
);

-- Test product
INSERT INTO products (company_id, product_name, hs_code, category, unit_price)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Cotton T-Shirt',
  '6109.10',
  'Apparel',
  12.50
);
```

### Tüm tabloları listele
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Satır sayılarını kontrol et
```sql
SELECT 
  'companies' as table_name, COUNT(*) as row_count FROM companies
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'ai_predictions', COUNT(*) FROM ai_predictions;
```

---

## 🎉 Tamamlandı!

Artık uygulama Supabase ile tamamen entegre!

**Sonraki adım:** `npm run dev` ile server'ı başlatın 🚀

