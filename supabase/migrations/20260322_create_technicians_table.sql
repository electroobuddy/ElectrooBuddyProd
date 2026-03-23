
-- Create technicians table
CREATE TABLE IF NOT EXISTS public.technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  address text,
  skills text[] DEFAULT '{}',
  experience integer DEFAULT 0,
  daily_limit integer DEFAULT 5,
  status text DEFAULT 'active' CHECK (status IN ('active', 'busy', 'offline')),
  priority integer DEFAULT 1,
  profile_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_technicians_status ON public.technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_priority ON public.technicians(priority DESC);
CREATE INDEX IF NOT EXISTS idx_technicians_daily_limit ON public.technicians(daily_limit);
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON public.technicians(user_id);

-- RLS Policies for technicians table

-- Admins can do everything
CREATE POLICY "Admins can manage technicians"
  ON public.technicians FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Technicians can view their own profile
CREATE POLICY "Technicians can view own profile"
  ON public.technicians FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Function to get technician's daily assignment count
CREATE OR REPLACE FUNCTION public.get_technician_today_assignments(technician_id uuid)
RETURNS integer AS $$
DECLARE
  count integer;
BEGIN
  SELECT COUNT(*)::integer INTO count
  FROM public.bookings
  WHERE assigned_technician_id = technician_id
    AND assignment_date = CURRENT_DATE;
  RETURN count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comment
COMMENT ON TABLE public.technicians IS 'Technician profiles with skills and availability';

