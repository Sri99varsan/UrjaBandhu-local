-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    bio TEXT,
    image_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    twitter_url VARCHAR(500),
    github_url VARCHAR(500),
    email VARCHAR(255),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger for teams
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at 
    BEFORE UPDATE ON public.teams 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active teams
CREATE POLICY "Allow public read access to active teams" ON public.teams
    FOR SELECT USING (is_active = true);

-- Create policy to allow authenticated users to manage teams (for admin functionality)
CREATE POLICY "Allow authenticated users to manage teams" ON public.teams
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample team data
INSERT INTO public.teams (name, role, department, bio, order_index, is_active) VALUES
('Arunavo Mukherjee', 'Founder & CEO', 'Executive', 'Passionate about sustainable energy solutions and building the future of smart energy management.', 1, true),
('Priya Sharma', 'CTO', 'Technology', 'Leading our technical vision with expertise in IoT, machine learning, and energy analytics.', 2, true),
('Rajesh Kumar', 'Head of Product', 'Product', 'Driving product innovation and user experience design for our energy management platform.', 3, true),
('Sneha Patel', 'Energy Analyst', 'Research', 'Specialized in energy consumption patterns and optimization strategies for Indian households.', 4, true),
('Vikram Singh', 'Lead Developer', 'Technology', 'Full-stack developer with expertise in React, Node.js, and modern web technologies.', 5, true),
('Kavita Nair', 'UX/UI Designer', 'Design', 'Creating intuitive and accessible interfaces for energy management and monitoring.', 6, true);