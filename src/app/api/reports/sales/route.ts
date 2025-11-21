import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/reports/sales - Get weekly sales report
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query for sold vehicles
    let query = supabase
      .from('vehicles')
      .select('*')
      .in('status', ['Sold', 'ARB', 'Withdrew'])
      .not('sale_date', 'is', null);

    // Apply date filters
    if (dateFrom) {
      query = query.gte('sale_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('sale_date', dateTo);
    }

    // Get all vehicles
    const { data: vehicles, error: vehiclesError } = await query.order('sale_date', { ascending: false });

    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError);
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
    }

    // Group by week (Monday to Sunday)
    const weeklyData: Record<string, {
      weekRange: string;
      totalCarsSold: number;
      vehicles: any[];
    }> = {};

    vehicles.forEach(vehicle => {
      if (!vehicle.sale_date) return;

      const saleDate = new Date(vehicle.sale_date);
      const day = saleDate.getDay();
      const diff = saleDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(saleDate.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const weekKey = monday.toISOString().split('T')[0];
      const weekRange = `${monday.toISOString().split('T')[0]} to ${sunday.toISOString().split('T')[0]}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekRange,
          totalCarsSold: 0,
          vehicles: [],
        };
      }

      weeklyData[weekKey].totalCarsSold += 1;
      weeklyData[weekKey].vehicles.push({
        id: vehicle.id,
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
        vin: vehicle.vin || 'N/A',
        saleDate: vehicle.sale_date,
        soldPrice: Number(vehicle.sale_invoice) || 0,
        status: vehicle.status,
      });
    });

    // Convert to array and sort
    const report = Object.entries(weeklyData).map(([weekKey, data]) => ({
      weekKey,
      weekRange: data.weekRange,
      totalCarsSold: data.totalCarsSold,
      vehicles: data.vehicles,
    })).sort((a, b) => b.weekKey.localeCompare(a.weekKey));

    return NextResponse.json({ data: report });
  } catch (error) {
    console.error('Error in GET /api/reports/sales:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

