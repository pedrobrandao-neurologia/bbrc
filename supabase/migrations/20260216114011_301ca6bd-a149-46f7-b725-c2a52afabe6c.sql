
-- Patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  education TEXT NOT NULL, -- 'analfabeto', '1-3', '4-7', '8+'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Public insert/select for now (no auth required for clinical tool)
CREATE POLICY "Anyone can insert patients" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read patients" ON public.patients FOR SELECT USING (true);

-- Test sessions table
CREATE TABLE public.test_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  naming_score INTEGER DEFAULT 0,
  incidental_score INTEGER DEFAULT 0,
  immediate_score INTEGER DEFAULT 0,
  learning_score INTEGER DEFAULT 0,
  fluency_count INTEGER DEFAULT 0,
  clock_score INTEGER DEFAULT 0,
  delayed_score INTEGER DEFAULT 0,
  recognition_score INTEGER DEFAULT 0,
  transcripts JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert test_sessions" ON public.test_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read test_sessions" ON public.test_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can update test_sessions" ON public.test_sessions FOR UPDATE USING (true);
