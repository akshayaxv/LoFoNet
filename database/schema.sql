-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(10) CHECK (type IN ('lost', 'found')),
    category VARCHAR(50) NOT NULL,
    color VARCHAR(50),
    distinguishing_marks TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    location_city VARCHAR(100),
    date_occurred DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'matched', 'contacted', 'closed')),
    user_id UUID REFERENCES users(id),
    contact_phone VARCHAR(20),
    match_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report Images Table
CREATE TABLE IF NOT EXISTS report_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('match', 'status', 'system')),
    read BOOLEAN DEFAULT FALSE,
    related_report_id UUID REFERENCES reports(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Matches Table (Stores potential matches found by the system)
CREATE TABLE IF NOT EXISTS ai_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lost_report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    found_report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    
    -- Detailed scoring system
    image_score DECIMAL(4,2) DEFAULT 0.00,
    text_score DECIMAL(4,2) DEFAULT 0.00,
    location_score DECIMAL(4,2) DEFAULT 0.00,
    final_score DECIMAL(4,2) DEFAULT 0.00,
    
    -- Legacy field for backwards compatibility
    confidence_score INTEGER,
    
    -- Status and timestamps
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(lost_report_id, found_report_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_location_city ON reports(location_city);
CREATE INDEX IF NOT EXISTS idx_reports_type_category_status ON reports(type, category, status);
CREATE INDEX IF NOT EXISTS idx_ai_matches_lost_report ON ai_matches(lost_report_id);
CREATE INDEX IF NOT EXISTS idx_ai_matches_found_report ON ai_matches(found_report_id);
CREATE INDEX IF NOT EXISTS idx_ai_matches_status ON ai_matches(status);
CREATE INDEX IF NOT EXISTS idx_ai_matches_final_score ON ai_matches(final_score DESC);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_matches_updated_at ON ai_matches;
CREATE TRIGGER update_ai_matches_updated_at 
    BEFORE UPDATE ON ai_matches 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();