import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reports/sales - Get sales reports
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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const location = searchParams.get('location');
    const buyerName = searchParams.get('buyerName');
    const make = searchParams.get('make');
    const model = searchParams.get('model');

    // Build query
    let vehicleQuery = supabase
      .from('vehicles')
      .select(`
        id,
        year,
        make,
        model,
        sale_date,
        sale_invoice,
        vehicle_location,
        buyer_dealership,
        buyer_contact_name,
        bought_price,
        buy_fee,
        other_charges
      `)
      .in('status', ['Sold', 'ARB', 'Pending Arbitration'])
      .not('sale_date', 'is', null)
      .order('sale_date', { ascending: false });

    // Apply filters
    if (dateFrom) {
      vehicleQuery = vehicleQuery.gte('sale_date', dateFrom);
    }
    if (dateTo) {
      vehicleQuery = vehicleQuery.lte('sale_date', dateTo);
    }
    if (location) {
      vehicleQuery = vehicleQuery.eq('vehicle_location', location);
    }
    if (buyerName) {
      vehicleQuery = vehicleQuery.or(`buyer_dealership.ilike.%${buyerName}%,buyer_contact_name.ilike.%${buyerName}%`);
    }
    if (make) {
      vehicleQuery = vehicleQuery.eq('make', make);
    }
    if (model) {
      vehicleQuery = vehicleQuery.eq('model', model);
    }

    const { data: vehicles, error: vehiclesError } = await vehicleQuery;

    if (vehiclesError) {
      console.error('Error fetching vehicles:', vehiclesError);
      return NextResponse.json(
        { error: 'Failed to fetch vehicles' },
        { status: 500 }
      );
    }

    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Get expenses for profit calculation
    const vehicleIds = vehicles.map(v => v.id);
    const { data: expenses, error: expensesError } = await supabase
      .from('vehicle_expenses')
      .select('vehicle_id, cost')
      .in('vehicle_id', vehicleIds);

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
    }

    // Get ARB adjustments
    const { data: arbRecords, error: arbError } = await supabase
      .from('vehicle_arb_records')
      .select('vehicle_id, arb_type, outcome, adjustment_amount')
      .in('vehicle_id', vehicleIds)
      .eq('arb_type', 'Inventory ARB')
      .eq('outcome', 'Price Adjustment');

    if (arbError) {
      console.error('Error fetching ARB records:', arbError);
    }

    // Group expenses and adjustments
    const expensesByVehicle = new Map<string, number>();
    (expenses || []).forEach(expense => {
      const current = expensesByVehicle.get(expense.vehicle_id) || 0;
      expensesByVehicle.set(expense.vehicle_id, current + Number(expense.cost));
    });

    const arbAdjustmentsByVehicle = new Map<string, number>();
    (arbRecords || []).forEach(arb => {
      if (arb.adjustment_amount) {
        const current = arbAdjustmentsByVehicle.get(arb.vehicle_id) || 0;
        arbAdjustmentsByVehicle.set(arb.vehicle_id, current + Number(arb.adjustment_amount));
      }
    });

    // Group by week
    const weeklyData = new Map<string, {
      week: string;
      vehicleCount: number;
      totalSales: number;
      avgSalePrice: number;
      totalProfit: number;
      vehicles: any[];
    }>();

    vehicles.forEach(vehicle => {
      const saleDate = new Date(vehicle.sale_date);
      const year = saleDate.getFullYear();
      const week = getWeekNumber(saleDate);
      const weekKey = `${year}-W${week.toString().padStart(2, '0')}`;

      const salePrice = Number(vehicle.sale_invoice) || 0;
      const purchasePrice = Number(vehicle.bought_price) || 0;
      const buyFee = Number(vehicle.buy_fee) || 0;
      const otherCharges = Number(vehicle.other_charges) || 0;
      const totalExpenses = expensesByVehicle.get(vehicle.id) || 0;
      const arbAdjustments = arbAdjustmentsByVehicle.get(vehicle.id) || 0;

      const totalCost = purchasePrice + buyFee + otherCharges + totalExpenses - arbAdjustments;
      const profit = salePrice - totalCost;

      const existing = weeklyData.get(weekKey) || {
        week: weekKey,
        vehicleCount: 0,
        totalSales: 0,
        avgSalePrice: 0,
        totalProfit: 0,
        vehicles: [],
      };

      existing.vehicleCount += 1;
      existing.totalSales += salePrice;
      existing.totalProfit += profit;
      existing.vehicles.push({
        id: vehicle.id,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        saleDate: vehicle.sale_date,
        salePrice,
        profit,
        location: vehicle.vehicle_location,
        buyer: vehicle.buyer_contact_name || vehicle.buyer_dealership,
      });

      weeklyData.set(weekKey, existing);
    });

    // Calculate averages and sort
    const report = Array.from(weeklyData.values()).map(data => ({
      week: data.week,
      vehicleCount: data.vehicleCount,
      totalSales: data.totalSales,
      avgSalePrice: data.totalSales / data.vehicleCount,
      totalProfit: data.totalProfit,
      vehicles: data.vehicles,
    })).sort((a, b) => b.totalSales - a.totalSales); // Sort by total sales descending

    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('Error in GET /api/reports/sales:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

