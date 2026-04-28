-- Migration to enhance counselor profiles with specializations, ratings, and reviews

-- 1. Add fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS specializations TEXT[],
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;

-- 2. Populate Dr. Radha Sharma's profile with detailed info
-- UUID: 87a24859-7892-49f8-b26d-c2878fe09f43
UPDATE profiles 
SET 
  specializations = ARRAY['Anxiety', 'Academic Stress', 'Relationship Counseling', 'CBT'],
  rating = 4.92,
  reviews = '[
    {
      "id": "rev_1",
      "author": "Anonymous",
      "rating": 5,
      "comment": "Dr. Radha was incredibly patient and helped me navigate through my final exam anxiety. Her techniques really work!",
      "date": "2024-03-15"
    },
    {
      "id": "rev_2",
      "author": "Anonymous",
      "rating": 4,
      "comment": "Very helpful session. I felt heard and supported.",
      "date": "2024-02-28"
    }
  ]'::jsonb
WHERE id = '87a24859-7892-49f8-b26d-c2878fe09f43';

-- 3. Add some more diversity if other counselors exist (optional for demo)
