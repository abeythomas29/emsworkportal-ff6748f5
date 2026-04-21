-- Purchase requests table for everyone to request items, admins fulfill
CREATE TABLE public.purchase_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pcs',
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low','normal','high','urgent')),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','ordered','received','rejected')),
  -- order fulfillment fields
  vendor TEXT,
  order_date DATE,
  expected_delivery DATE,
  order_notes TEXT,
  handled_by UUID,
  handled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view all requests (transparent portal)
CREATE POLICY "Authenticated users can view all purchase requests"
ON public.purchase_requests FOR SELECT
TO authenticated
USING (true);

-- Users can create their own requests, status must start as pending, no order fields set
CREATE POLICY "Users can create their own purchase requests"
ON public.purchase_requests FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND vendor IS NULL
  AND order_date IS NULL
  AND handled_by IS NULL
);

-- Users can update (edit fields) or delete their own pending requests only
CREATE POLICY "Users can update their own pending purchase requests"
ON public.purchase_requests FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete their own pending purchase requests"
ON public.purchase_requests FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can do anything
CREATE POLICY "Admins can manage all purchase requests"
ON public.purchase_requests FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_purchase_requests_updated_at
BEFORE UPDATE ON public.purchase_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX idx_purchase_requests_user_id ON public.purchase_requests(user_id);
CREATE INDEX idx_purchase_requests_status ON public.purchase_requests(status);
CREATE INDEX idx_purchase_requests_created_at ON public.purchase_requests(created_at DESC);