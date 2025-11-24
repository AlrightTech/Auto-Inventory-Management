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
      .in('status', ['Sold', 'ARB', 'Withdrew', 'Pending Arbitration'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sold vehicles:', error);
      return NextResponse.json({ error: 'Failed to fetch sold vehicles' }, { status: 500 });
    }

    // Fetch expenses for all vehicles in one query
    const vehicleIds = vehicles.map(v => v.id);
    const { data: allExpenses, error: expensesError } = vehicleIds.length > 0
      ? await supabase
          .from('vehicle_expenses')
          .select('vehicle_id, cost')
          .in('vehicle_id', vehicleIds)
      : { data: [], error: null };

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
      // Continue without expenses if there's an error
    }

    // Group expenses by vehicle_id
    const expensesByVehicle = new Map<string, number>();
    (allExpenses || []).forEach(expense => {
      const currentTotal = expensesByVehicle.get(expense.vehicle_id) || 0;
      // Handle negative costs (ARB positive adjustments) - they reduce total cost
      expensesByVehicle.set(expense.vehicle_id, currentTotal + Number(expense.cost));
    });

    // Transform the data to match the expected format
    const soldVehicles = vehicles.map(vehicle => {
      const boughtPrice = Number(vehicle.bought_price) || 0;
      const buyFee = Number(vehicle.buy_fee) || 0;
      const otherCharges = Number(vehicle.other_charges) || 0;
      const soldPrice = Number(vehicle.sale_invoice) || 0;
      
      // Get total expenses for this vehicle (including ARB adjustments)
      const totalExpenses = expensesByVehicle.get(vehicle.id) || 0;
      
      // Calculate total cost: purchase price + fees + charges + expenses
      // Note: Negative expenses (ARB positive adjustments) will reduce the total
      const totalCost = boughtPrice + buyFee + otherCharges + totalExpenses;
      const netProfit = soldPrice - totalCost;

      return {
        id: vehicle.id,
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` (${vehicle.trim})` : ''}`,
        vin: vehicle.vin || 'N/A',
        purchaseDate: vehicle.created_at ? new Date(vehicle.created_at).toISOString().split('T')[0] : 'N/A',
        saleDate: vehicle.sale_date ? new Date(vehicle.sale_date).toISOString().split('T')[0] : (vehicle.created_at ? new Date(vehicle.created_at).toISOString().split('T')[0] : 'N/A'),
        boughtPrice: boughtPrice,
        buyFee: buyFee,
        otherCharges: otherCharges,
        totalExpenses: totalExpenses,
        totalCost: totalCost,
        soldPrice: soldPrice,
        netProfit: netProfit,
        titleStatus: vehicle.title_status || 'Absent',
        arbStatus: vehicle.dealshield_arbitration_status || 'Absent',
        status: vehicle.status,
        location: vehicle.vehicle_location || vehicle.pickup_location_city || 'N/A',
        buyerName: vehicle.buyer_contact_name || vehicle.buyer_dealership || 'N/A',
        paymentStatus: vehicle.sale_invoice_status === 'PAID' ? 'Received' : 'Pending'
      };
    });

    return NextResponse.json({ data: soldVehicles });
  } catch (error) {
    console.error('Error in GET /api/vehicles/sold:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
