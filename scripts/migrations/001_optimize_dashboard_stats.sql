-- Optimierte Dashboard-Statistik-Funktion
-- Konsolidiert 13 separate Queries in einen einzigen RPC-Call für maximale Performance

CREATE OR REPLACE FUNCTION get_comprehensive_dashboard_stats(target_company_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today DATE := CURRENT_DATE;
  yesterday DATE := CURRENT_DATE - 1;
  thirty_days_ago TIMESTAMP := NOW() - INTERVAL '30 days';
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    -- Buchungs-Statistiken
    'bookings_today', (SELECT COUNT(*) FROM bookings WHERE company_id = target_company_id AND DATE(created_at) = today),
    'bookings_yesterday', (SELECT COUNT(*) FROM bookings WHERE company_id = target_company_id AND DATE(created_at) = yesterday),
    'active_bookings', (SELECT COUNT(*) FROM bookings WHERE company_id = target_company_id AND status IN ('pending', 'confirmed', 'assigned', 'in_progress')),
    
    -- Fahrer-Statistiken
    'drivers_available', (SELECT COUNT(*) FROM drivers WHERE company_id = target_company_id AND status = 'available'),
    'drivers_total', (SELECT COUNT(*) FROM drivers WHERE company_id = target_company_id),
    
    -- Kunden-Statistiken
    'customers_total', (SELECT COUNT(*) FROM customers WHERE company_id = target_company_id),
    
    -- Rechnungs-Statistiken
    'pending_invoices', (SELECT COUNT(*) FROM invoices WHERE company_id = target_company_id AND status = 'pending'),
    
    -- Umsatz (Letzte 30 Tage)
    'revenue_30_days', (
      SELECT COALESCE(SUM(price), 0) 
      FROM bookings 
      WHERE company_id = target_company_id 
      AND status = 'completed' 
      AND created_at >= thirty_days_ago
    ),
    
    -- Aktuelle Fahrzeuge (nur Koordinaten für Karte)
    'vehicle_locations', (
      SELECT json_agg(json_build_object(
        'id', v.id,
        'license_plate', v.license_plate,
        'lat', v.current_lat,
        'lng', v.current_lng,
        'status', v.status
      ))
      FROM vehicles v
      WHERE v.company_id = target_company_id
      AND v.current_lat IS NOT NULL 
      AND v.current_lng IS NOT NULL
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

