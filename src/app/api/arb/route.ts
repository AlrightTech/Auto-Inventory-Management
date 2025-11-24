import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/arb - Get all ARB records with vehicle details
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const arbType = searchParams.get('arb_type');
    const outcome = searchParams.get('outcome');

    // Build query
    let query = supabase
      .from('vehicle_arb_records')
      .select(`
        *,
        vehicle:vehicles!vehicle_arb_records_vehicle_id_fkey(
          id,
          year,
          make,
          model,
          trim,
          vin,
          status,
          sale_invoice,
          bought_price,
          sale_date,
          buyer_dealership,
          buyer_contact_name
        ),
        created_by_user:profiles!vehicle_arb_records_created_by_fkey(id, username, email)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (arbType) {
      query = query.eq('arb_type', arbType);
    }
    if (outcome) {
      query = query.eq('outcome', outcome);
    }

    const { data: arbRecords, error } = await query;

    if (error) {
      console.error('Error fetching ARB records:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ARB records' },
        { status: 500 }
      );
    }

    // Transform data for frontend
    const transformedData = (arbRecords || []).map(record => ({
      id: record.id,
      vehicleId: record.vehicle_id,
      vehicle: record.vehicle 
        ? `${record.vehicle.year} ${record.vehicle.make} ${record.vehicle.model}${record.vehicle.trim ? ` (${record.vehicle.trim})` : ''}`
        : 'Unknown Vehicle',
      vin: record.vehicle?.vin || 'N/A',
      arbType: record.arb_type,
      outcome: record.outcome,
      adjustmentAmount: record.adjustment_amount,
      transportType: record.transport_type,
      transportLocation: record.transport_location,
      transportDate: record.transport_date,
      transportCost: record.transport_cost,
      notes: record.notes,
      createdAt: record.created_at,
      createdBy: record.created_by_user,
      soldDate: record.vehicle?.sale_date,
      soldPrice: record.vehicle?.sale_invoice,
      buyerName: record.vehicle?.buyer_contact_name || record.vehicle?.buyer_dealership || 'N/A',
    }));

    return NextResponse.json({ data: transformedData });
  } catch (error: any) {
    console.error('Error in GET /api/arb:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

