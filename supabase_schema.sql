-- Create the 'consultations' table
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_name TEXT,
    status TEXT DEFAULT 'pending' -- pending, processing, completed, failed
);

-- Create the 'transcripts' table
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    raw_text TEXT,
    structured_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the 'prescriptions' table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
    patient_name TEXT,
    diagnosis TEXT,
    full_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set Row Level Security (RLS) to open for testing
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access" ON consultations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON consultations FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read access" ON transcripts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON transcripts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON transcripts FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous read access" ON prescriptions FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access" ON prescriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access" ON prescriptions FOR UPDATE USING (true);
