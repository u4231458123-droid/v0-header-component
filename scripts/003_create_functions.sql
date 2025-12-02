-- Get dashboard statistics for a company
CREATE OR REPLACE FUNCTION get_dashboard_stats(target_company_id UUID, target_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_bookings_today', (
      SELECT COUNT(*) FROM bookings 
      WHERE company_id = target_company_id 
      AND DATE(pickup_time) = target_date
    ),
    'completed_bookings_today', (
      SELECT COUNT(*) FROM bookings 
      WHERE company_id = target_company_id 
      AND DATE(pickup_time) = target_date 
      AND status = 'completed'
    ),
    'revenue_today', (
      SELECT COALESCE(SUM(price), 0) FROM bookings 
      WHERE company_id = target_company_id 
      AND DATE(pickup_time) = target_date 
      AND status = 'completed'
    ),
    'available_drivers', (
      SELECT COUNT(*) FROM drivers 
      WHERE company_id = target_company_id 
      AND status = 'available'
    ),
    'active_bookings', (
      SELECT COUNT(*) FROM bookings 
      WHERE company_id = target_company_id 
      AND status IN ('confirmed', 'assigned', 'in_progress')
    )
  ) INTO result;
  
  RETURN result;
END;
$$;
