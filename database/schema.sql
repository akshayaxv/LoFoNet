-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(10) CHECK (type IN ('lost', 'found')),
    category VARCHAR(50) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    location_city VARCHAR(100),
    date_occurred DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'matched', 'contacted', 'closed')),
    user_id UUID REFERENCES users(id),
    contact_phone VARCHAR(20),
    match_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report Images Table
CREATE TABLE report_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
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
CREATE TABLE ai_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lost_report_id UUID REFERENCES reports(id),
    found_report_id UUID REFERENCES reports(id),
    confidence_score INTEGER,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lost_report_id, found_report_id)
);
