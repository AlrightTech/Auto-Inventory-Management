import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reports/summary - Get weekly/monthly summary
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
    const period = searchParams.get('period') || 'weekly'; // 'weekly' or 'monthly'
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Get all sold vehicles
    let vehicleQuery = supabase
      .from('vehicles')
      .select(`
        id,
        sale_date,
        sale_invoice,
        bought_price,
        buy_fee,
        other_charges,
        status
      `)
      .in('status', ['Sold', 'ARB', 'Pending Arbitration'])
      .not('sale_date', 'is', null)
      .order('sale_date', { ascending: true });

    if (dateFrom) {
      vehicleQuery = vehicleQuery.gte('sale_date', dateFrom);
    }
    if (dateTo) {
      vehicleQuery = vehicleQuery.lte('sale_date', dateTo);
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

    // Get all expenses
    const vehicleIds = vehicles.map(v => v.id);
    const { data: expenses, error: expensesError } = await supabase
      .from('vehicle_expenses')
      .select('vehicle_id, cost, expense_date')
      .in('vehicle_id', vehicleIds);

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
    }

    // Get ARB records for adjustments
    const { data: arbRecords, error: arbError } = await supabase
      .from('vehicle_arb_records')
      .select('vehicle_id, arb_type, outcome, adjustment_amount, created_at')
      .in('vehicle_id', vehicleIds);

    if (arbError) {
      console.error('Error fetching ARB records:', arbError);
    }

    // Group expenses by vehicle
    const expensesByVehicle = new Map<string, number>();
    (expenses || []).forEach(expense => {
      const current = expensesByVehicle.get(expense.vehicle_id) || 0;
      expensesByVehicle.set(expense.vehicle_id, current + Number(expense.cost));
    });

    // Group ARB adjustments by vehicle
    const arbAdjustmentsByVehicle = new Map<string, number>();
    (arbRecords || []).forEach(arb => {
      if (arb.arb_type === 'Inventory ARB' && arb.outcome === 'Price Adjustment' && arb.adjustment_amount) {
        const current = arbAdjustmentsByVehicle.get(arb.vehicle_id) || 0;
        arbAdjustmentsByVehicle.set(arb.vehicle_id, current + Number(arb.adjustment_amount));
      }
    });

    // Group vehicles by period
    const groupedData = new Map<string, {
      period: string;
      vehicleCount: number;
      grossSales: number;
      totalExpenses: number;
      netProfit: number;
      vehicles: any[];
    }>();

    vehicles.forEach(vehicle => {
      const saleDate = new Date(vehicle.sale_date);
      let periodKey: string;

      if (period === 'weekly') {
        // Get week number and year
        const year = saleDate.getFullYear();
        const week = getWeekNumber(saleDate);
        periodKey = `${year}-W${week.toString().padStart(2, '0')}`;
      } else {
        // Monthly
        const year = saleDate.getFullYear();
        const month = saleDate.getMonth() + 1;
        periodKey = `${year}-${month.toString().padStart(2, '0')}`;
      }

      const purchasePrice = Number(vehicle.bought_price) || 0;
      const buyFee = Number(vehicle.buy_fee) || 0;
      const otherCharges = Number(vehicle.other_charges) || 0;
      const salePrice = Number(vehicle.sale_invoice) || 0;
      const totalExpenses = expensesByVehicle.get(vehicle.id) || 0;
      const arbAdjustments = arbAdjustmentsByVehicle.get(vehicle.id) || 0;

      const totalCost = purchasePrice + buyFee + otherCharges + totalExpenses - arbAdjustments;
      const profit = salePrice - totalCost;

      const existing = groupedData.get(periodKey) || {
        period: periodKey,
        vehicleCount: 0,
        grossSales: 0,
        totalExpenses: 0,
        netProfit: 0,
        vehicles: [],
      };

      existing.vehicleCount += 1;
      existing.grossSales += salePrice;
      existing.totalExpenses += totalExpenses;
      existing.netProfit += profit;
      existing.vehicles.push({
        id: vehicle.id,
        saleDate: vehicle.sale_date,
        salePrice,
        profit,
      });

      groupedData.set(periodKey, existing);
    });

    // Convert to array and sort
    const summary = Array.from(groupedData.values()).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    return NextResponse.json({ data: summary });
  } catch (error: any) {
    console.error('Error in GET /api/reports/summary:', error);
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

