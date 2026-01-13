-- Puzzle Game Images Table
-- Migration: 008_create_puzzle_images.sql

-- Table for storing puzzle images that will be randomly shown to users
CREATE TABLE public.puzzle_images (
    id serial NOT NULL,
    name character varying(100) NOT NULL,
    image_url text NOT NULL,
    description text,
    is_featured boolean DEFAULT false,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    times_played integer DEFAULT 0,
    times_solved integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT puzzle_images_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX idx_puzzle_images_featured ON public.puzzle_images(is_featured) WHERE is_featured = true;
CREATE INDEX idx_puzzle_images_active ON public.puzzle_images(is_active) WHERE is_active = true;
CREATE INDEX idx_puzzle_images_sort ON public.puzzle_images(sort_order);

-- Enable RLS
ALTER TABLE public.puzzle_images ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all reads on puzzle_images" ON public.puzzle_images FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on puzzle_images" ON public.puzzle_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on puzzle_images" ON public.puzzle_images FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all deletes on puzzle_images" ON public.puzzle_images FOR DELETE USING (true);

-- Insert some default puzzle images (using Unsplash URLs)
INSERT INTO public.puzzle_images (name, image_url, description, is_featured, is_active, sort_order) VALUES
    ('Ocean Sunset', 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=600&fit=crop', 'Beautiful ocean sunset', true, true, 1),
    ('Mountain Peak', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop', 'Majestic mountain landscape', true, true, 2),
    ('Forest Path', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=600&fit=crop', 'Peaceful forest trail', true, true, 3),
    ('City Lights', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=600&fit=crop', 'City skyline at night', true, true, 4),
    ('Tropical Beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop', 'Paradise beach view', true, true, 5),
    ('Northern Lights', 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=600&fit=crop', 'Aurora borealis display', true, true, 6),
    ('Desert Dunes', 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=600&fit=crop', 'Golden sand dunes', false, true, 7),
    ('Waterfall', 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&h=600&fit=crop', 'Cascading waterfall', false, true, 8),
    ('Autumn Leaves', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop', 'Colorful fall foliage', false, true, 9),
    ('Starry Night', 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=600&h=600&fit=crop', 'Night sky with stars', false, true, 10),
    ('Flower Garden', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=600&fit=crop', 'Colorful flower field', false, true, 11),
    ('Snow Mountains', 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=600&h=600&fit=crop', 'Snow-capped peaks', false, true, 12);

-- Add foreign key reference from puzzle_awards to puzzle_images
ALTER TABLE public.puzzle_awards 
ADD CONSTRAINT puzzle_awards_image_fk 
FOREIGN KEY (puzzle_image_id) REFERENCES public.puzzle_images(id) ON DELETE SET NULL;
