import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/reports/profit-summary - Get weekly/monthly profit/loss summary
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
    const period = searchParams.get('period') || 'weekly'; // 'weekly' or 'monthly'
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

    if (!vehicles || vehicles.length === 0) {
      return NextResponse.json({ data: [] });
    }

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

    // Calculate profit for each vehicle and group by period
    interface PeriodData {
      totalProfit: number;
      totalLoss: number;
      vehiclesSold: number;
      vehicles: any[];
    }
    
    const periodData: Record<string, PeriodData> = {};

    vehicles.forEach((vehicle: any) => {
      const boughtPrice = Number(vehicle.bought_price) || 0;
      const buyFee = Number(vehicle.buy_fee) || 0;
      const otherCharges = Number(vehicle.other_charges) || 0;
      const soldPrice = Number(vehicle.sale_invoice) || 0;
      
      // Calculate effective purchase price (for inventory ARB adjustments)
      let effectivePurchasePrice = boughtPrice;
      if (vehicle.arb_type === 'inventory_arb' && vehicle.arb_outcome === 'price_adjustment' && vehicle.arb_adjustment_amount) {
        effectivePurchasePrice = boughtPrice - Number(vehicle.arb_adjustment_amount);
      }

      const totalExpenses = expensesByVehicle[vehicle.id] || 0;
      const totalCost = effectivePurchasePrice + buyFee + otherCharges + totalExpenses;
      const profit = soldPrice - totalCost;

      // Determine period key
      let periodKey: string;
      if (vehicle.sale_date) {
        const saleDate = new Date(vehicle.sale_date);
        if (period === 'weekly') {
          // Get Monday of the week
          const day = saleDate.getDay();
          const diff = saleDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
          const monday = new Date(saleDate.setDate(diff));
          monday.setHours(0, 0, 0, 0);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          periodKey = `${monday.toISOString().split('T')[0]} to ${sunday.toISOString().split('T')[0]}`;
        } else {
          // Monthly
          periodKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
        }
      } else {
        periodKey = 'Unknown';
      }

      if (!periodData[periodKey]) {
        periodData[periodKey] = {
          totalProfit: 0,
          totalLoss: 0,
          vehiclesSold: 0,
          vehicles: [],
        };
      }

      if (profit >= 0) {
        periodData[periodKey].totalProfit += profit;
      } else {
        periodData[periodKey].totalLoss += Math.abs(profit);
      }
      periodData[periodKey].vehiclesSold += 1;
      periodData[periodKey].vehicles.push({
        id: vehicle.id,
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        profit,
        saleDate: vehicle.sale_date,
      });
    });

    // Convert to array and calculate averages
    const summaryEntries = Object.entries(periodData);
    const summary = summaryEntries.map((entry: [string, PeriodData]) => {
      const [period, data] = entry;
      return {
        period,
        totalProfit: data.totalProfit,
        totalLoss: data.totalLoss,
        netProfit: data.totalProfit - data.totalLoss,
        vehiclesSold: data.vehiclesSold,
        averageProfit: data.vehiclesSold > 0 ? (data.totalProfit - data.totalLoss) / data.vehiclesSold : 0,
        vehicles: data.vehicles,
      };
    });
    
    summary.sort((a, b) => {
      // Sort by period (most recent first)
      return b.period.localeCompare(a.period);
    });

    return NextResponse.json({ data: summary });
  } catch (error) {
    console.error('Error in GET /api/reports/profit-summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

