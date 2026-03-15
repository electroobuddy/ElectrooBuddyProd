-- Create a table to log status change notifications
CREATE TABLE IF NOT EXISTS public.booking_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  old_status text,
  new_status text NOT NULL,
  user_email text,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.booking_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can see all notifications
CREATE POLICY "Admins can manage notifications"
  ON public.booking_notifications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can see their own booking notifications
CREATE POLICY "Users can view own notifications"
  ON public.booking_notifications FOR SELECT TO authenticated
  USING (booking_id IN (SELECT id FROM public.bookings WHERE user_id = auth.uid()));