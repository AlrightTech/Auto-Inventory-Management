import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/vehicles/sold - Get all sold vehicles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all sold vehicles with creator information
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(id, username, email)
      `)
      .in('status', ['Sold', 'ARB', 'Withdrew'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sold vehicles:', error);
      return NextResponse.json({ error: 'Failed to fetch sold vehicles' }, { status: 500 });
    }

    // Transform the data to match the expected format
    const soldVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` (${vehicle.trim})` : ''}`,
      vin: vehicle.vin || 'N/A',
      purchaseDate: vehicle.created_at ? new Date(vehicle.created_at).toISOString().split('T')[0] : 'N/A',
      saleDate: vehicle.sale_date || 'N/A',
      boughtPrice: vehicle.bought_price || 0,
      soldPrice: vehicle.sold_price || 0,
      netProfit: (vehicle.sold_price || 0) - (vehicle.bought_price || 0),
      titleStatus: vehicle.title_status || 'Absent',
      arbStatus: vehicle.dealshield_arbitration_status || 'Absent',
      status: vehicle.status,
      location: vehicle.vehicle_location || vehicle.pickup_location_city || 'N/A',
      buyerName: vehicle.buyer_contact_name || 'N/A',
      paymentStatus: vehicle.sale_invoice_status === 'PAID' ? 'Received' : 'Pending'
    }));

    return NextResponse.json({ data: soldVehicles });
  } catch (error) {
    console.error('Error in GET /api/vehicles/sold:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
