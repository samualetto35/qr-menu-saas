-- QR Menu SaaS Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  country_code VARCHAR(5),
  business_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- Menus table
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  template JSONB NOT NULL,
  categories JSONB DEFAULT '[]'::jsonb,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scan_count INTEGER DEFAULT 1,
  unique_scans INTEGER DEFAULT 1,
  device_info JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu analytics summary (for performance)
CREATE TABLE menu_analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_scans INTEGER DEFAULT 0,
  unique_scans INTEGER DEFAULT 0,
  mobile_scans INTEGER DEFAULT 0,
  tablet_scans INTEGER DEFAULT 0,
  desktop_scans INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_id, date)
);

-- User subscriptions (for future payment integration)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_menus_user_id ON menus(user_id);
CREATE INDEX idx_menus_is_active ON menus(is_active);
CREATE INDEX idx_analytics_menu_id ON analytics(menu_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp);
CREATE INDEX idx_analytics_summary_menu_date ON menu_analytics_summary(menu_id, date);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Menus policies
CREATE POLICY "Users can view own menus" ON menus FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own menus" ON menus FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own menus" ON menus FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own menus" ON menus FOR DELETE USING (auth.uid() = user_id);

-- Public access to active menus (for QR code scanning)
CREATE POLICY "Public can view active menus" ON menus FOR SELECT USING (is_active = true);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert analytics" ON analytics FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own analytics summary" ON menu_analytics_summary FOR SELECT USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_analytics_summary_updated_at BEFORE UPDATE ON menu_analytics_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to aggregate analytics daily
CREATE OR REPLACE FUNCTION aggregate_daily_analytics()
RETURNS VOID AS $$
BEGIN
  INSERT INTO menu_analytics_summary (menu_id, user_id, date, total_scans, unique_scans, mobile_scans, tablet_scans, desktop_scans)
  SELECT 
    a.menu_id,
    a.user_id,
    DATE(a.timestamp) as date,
    COUNT(*) as total_scans,
    COUNT(DISTINCT a.ip_address) as unique_scans,
    COUNT(*) FILTER (WHERE a.device_info->>'type' = 'mobile') as mobile_scans,
    COUNT(*) FILTER (WHERE a.device_info->>'type' = 'tablet') as tablet_scans,
    COUNT(*) FILTER (WHERE a.device_info->>'type' = 'desktop') as desktop_scans
  FROM analytics a
  WHERE DATE(a.timestamp) = CURRENT_DATE - INTERVAL '1 day'
  GROUP BY a.menu_id, a.user_id, DATE(a.timestamp)
  ON CONFLICT (menu_id, date) 
  DO UPDATE SET 
    total_scans = EXCLUDED.total_scans,
    unique_scans = EXCLUDED.unique_scans,
    mobile_scans = EXCLUDED.mobile_scans,
    tablet_scans = EXCLUDED.tablet_scans,
    desktop_scans = EXCLUDED.desktop_scans,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
