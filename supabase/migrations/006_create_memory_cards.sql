-- Memory Game Cards Table
-- Migration: 006_create_memory_cards.sql

-- Table for storing custom memory card images
CREATE TABLE public.memory_cards (
    id serial NOT NULL,
    name character varying(100) NOT NULL,
    image_url text NOT NULL,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT memory_cards_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX idx_memory_cards_featured ON public.memory_cards(is_featured) WHERE is_featured = true;
CREATE INDEX idx_memory_cards_active ON public.memory_cards(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.memory_cards ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all reads on memory_cards" ON public.memory_cards FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on memory_cards" ON public.memory_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on memory_cards" ON public.memory_cards FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all deletes on memory_cards" ON public.memory_cards FOR DELETE USING (true);

-- Insert some default emoji cards (these will be replaced with images)
INSERT INTO public.memory_cards (name, image_url, is_featured, is_active, sort_order) VALUES
    ('Gaming', '🎮', true, true, 1),
    ('Target', '🎯', true, true, 2),
    ('Art', '🎨', true, true, 3),
    ('Music', '🎵', true, true, 4),
    ('Star', '⭐', true, true, 5),
    ('Heart', '❤️', true, true, 6),
    ('Diamond', '💎', true, true, 7),
    ('Rocket', '🚀', true, true, 8),
    ('Fire', '🔥', true, true, 9),
    ('Lightning', '⚡', true, true, 10),
    ('Crown', '👑', true, true, 11),
    ('Gift', '🎁', true, true, 12),
    ('Trophy', '🏆', true, true, 13),
    ('Soccer', '⚽', true, true, 14),
    ('Basketball', '🏀', true, true, 15),
    ('Dice', '🎲', true, true, 16),
    ('Clover', '🍀', true, true, 17),
    ('Rainbow', '🌈', true, true, 18),
    ('Sun', '☀️', false, true, 19),
    ('Moon', '🌙', false, true, 20),
    ('Butterfly', '🦋', false, true, 21),
    ('Flower', '🌸', false, true, 22),
    ('Crystal', '🔮', false, true, 23),
    ('Sparkle', '✨', false, true, 24);
