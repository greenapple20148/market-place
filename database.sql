
-- 2. PRODUCTS TABLE (Updated with moderation_logs)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  seller_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  images TEXT[] DEFAULT '{}',
  category TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  tags TEXT[],
  declared_handmade BOOLEAN DEFAULT TRUE,
  moderation_status TEXT DEFAULT 'approved', -- approved, pending_review, flagged, rejected
  moderation_reason TEXT,
  moderation_logs JSONB DEFAULT '[]', -- Added for compliance tracking
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- (Keep other tables and policies as defined previously)
