import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/reports/profit-per-car - Get profit per car report
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
    const vin = searchParams.get('vin');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build query for sold vehicles
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(id, username, email)
      `)
      .in('status', ['Sold', 'ARB', 'Withdrew']);

    // Apply filters
    if (dateFrom) {
      query = query.gte('sale_date', dateFrom);
    }
    if (dateTo) {
      query = query.lte('sale_date', dateTo);
    }
    if (vin) {
      query = query.ilike('vin', `%${vin}%`);
    }

    // Get vehicles
    const { data: vehicles, error: vehiclesError } = await query
      .order('sale_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError);
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
    }

    // Get total count for pagination
    const { count } = await query.select('*', { count: 'exact', head: true });

    // Get all vehicle IDs
    const vehicleIds = vehicles.map(v => v.id);

    // Get expenses for all vehicles
    const { data: allExpenses } = await supabase
      .from('vehicle_expenses')
      .select('vehicle_id, cost')
      .in('vehicle_id', vehicleIds);

    // Group expenses by vehicle_id
    const expensesByVehicle: Record<string, number> = {};
    if (allExpenses) {
      allExpenses.forEach(expense => {
        const vehicleId = expense.vehicle_id;
        const cost = Number(expense.cost) || 0;
        expensesByVehicle[vehicleId] = (expensesByVehicle[vehicleId] || 0) + cost;
      });
    }

    // Calculate profit for each vehicle
    const profitReport = vehicles.map(vehicle => {
      const boughtPrice = Number(vehicle.bought_price) || 0;
      const buyFee = Number(vehicle.buy_fee) || 0;
      const otherCharges = Number(vehicle.other_charges) || 0;
      const soldPrice = Number(vehicle.sale_invoice) || 0;
      
      // Calculate effective purchase price (for inventory ARB adjustments)
      let effectivePurchasePrice = boughtPrice;
      let arbAdjustment = 0;
      
      if (vehicle.arb_type === 'inventory_arb' && vehicle.arb_outcome === 'price_adjustment' && vehicle.arb_adjustment_amount) {
        // Positive adjustment reduces purchase price
        effectivePurchasePrice = boughtPrice - Number(vehicle.arb_adjustment_amount);
        arbAdjustment = Number(vehicle.arb_adjustment_amount);
      } else if (vehicle.arb_type === 'sold_arb' && vehicle.arb_outcome === 'price_adjustment' && vehicle.arb_adjustment_amount) {
        // Sold ARB price adjustment is already in expenses, but track separately
        arbAdjustment = -Number(vehicle.arb_adjustment_amount); // Negative because it reduces profit
      }

      // Get total expenses for this vehicle
      const totalExpenses = expensesByVehicle[vehicle.id] || 0;
      
      // Calculate total cost
      const totalCost = effectivePurchasePrice + buyFee + otherCharges + totalExpenses;
      
      // Calculate profit
      const profit = soldPrice - totalCost;

      return {
        id: vehicle.id,
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
        vin: vehicle.vin || 'N/A',
        purchasePrice: effectivePurchasePrice,
        buyFee: buyFee,
        otherCharges: otherCharges,
        soldPrice: soldPrice,
        totalExpenses: totalExpenses,
        arbAdjustment: arbAdjustment,
        profit: profit,
        saleDate: vehicle.sale_date,
        status: vehicle.status,
        arbType: vehicle.arb_type,
        arbOutcome: vehicle.arb_outcome,
      };
    });

    return NextResponse.json({
      data: profitReport,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/reports/profit-per-car:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

