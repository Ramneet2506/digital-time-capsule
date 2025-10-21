-- schema.sql

-- 1. Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Capsules Table
CREATE TABLE capsules (
    capsule_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    unlock_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_communal BOOLEAN DEFAULT FALSE,
    creator_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contents Table
CREATE TABLE contents (
    content_id SERIAL PRIMARY KEY,
    capsule_id INT REFERENCES capsules(capsule_id) ON DELETE CASCADE,
    contributor_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    content_type VARCHAR(50) NOT NULL, -- e.g., 'text', 'image', 'video'
    content_text TEXT, -- Used for text entries
    content_url VARCHAR(255), -- Used for image/video links (S3 URL)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sentiment_score FLOAT DEFAULT 0.0
);