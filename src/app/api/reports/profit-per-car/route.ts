import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkPermission } from '@/lib/route-protection';

// GET /api/reports/profit-per-car - Get profit per car report
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check report permission
    const hasAccess = await checkPermission('reports.profit_per_car');
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'Sold';
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const location = searchParams.get('location');

    // Build query for sold vehicles
    let vehicleQuery = supabase
      .from('vehicles')
      .select(`
        id,
        year,
        make,
        model,
        trim,
        vin,
        bought_price,
        buy_fee,
        other_charges,
        sale_invoice,
        sale_date,
        vehicle_location,
        status,
        created_at
      `)
      .in('status', ['Sold', 'ARB', 'Pending Arbitration'])
      .order('sale_date', { ascending: false });

    // Apply filters
    if (make) {
      vehicleQuery = vehicleQuery.eq('make', make);
    }
    if (model) {
      vehicleQuery = vehicleQuery.eq('model', model);
    }
    if (location) {
      vehicleQuery = vehicleQuery.eq('vehicle_location', location);
    }
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

    // Get all expenses for these vehicles
    const vehicleIds = vehicles.map(v => v.id);
    const { data: expenses, error: expensesError } = await supabase
      .from('vehicle_expenses')
      .select('vehicle_id, expense_description, cost, expense_date')
      .in('vehicle_id', vehicleIds);

    if (expensesError) {
      console.error('Error fetching expenses:', expensesError);
    }

    // Get ARB records to find Inventory ARB positive adjustments
    const { data: arbRecords, error: arbError } = await supabase
      .from('vehicle_arb_records')
      .select('vehicle_id, arb_type, outcome, adjustment_amount')
      .in('vehicle_id', vehicleIds)
      .eq('arb_type', 'Inventory ARB')
      .eq('outcome', 'Price Adjustment');

    if (arbError) {
      console.error('Error fetching ARB records:', arbError);
    }

    // Group expenses by vehicle
    const expensesByVehicle = new Map<string, any[]>();
    (expenses || []).forEach(expense => {
      const vehicleExpenses = expensesByVehicle.get(expense.vehicle_id) || [];
      vehicleExpenses.push(expense);
      expensesByVehicle.set(expense.vehicle_id, vehicleExpenses);
    });

    // Group ARB adjustments by vehicle
    const arbAdjustmentsByVehicle = new Map<string, number>();
    (arbRecords || []).forEach(arb => {
      if (arb.adjustment_amount) {
        const current = arbAdjustmentsByVehicle.get(arb.vehicle_id) || 0;
        arbAdjustmentsByVehicle.set(arb.vehicle_id, current + Number(arb.adjustment_amount));
      }
    });

    // Get ARB actions for each vehicle
    const { data: allArbRecords, error: allArbError } = await supabase
      .from('vehicle_arb_records')
      .select('vehicle_id, arb_type, outcome, adjustment_amount, transport_cost, created_at')
      .in('vehicle_id', vehicleIds)
      .order('created_at', { ascending: false });

    const arbActionsByVehicle = new Map<string, any[]>();
    (allArbRecords || []).forEach(arb => {
      const actions = arbActionsByVehicle.get(arb.vehicle_id) || [];
      actions.push(arb);
      arbActionsByVehicle.set(arb.vehicle_id, actions);
    });

    // Calculate profit for each vehicle
    const profitReport = vehicles.map(vehicle => {
      const purchasePrice = Number(vehicle.bought_price) || 0;
      const buyFee = Number(vehicle.buy_fee) || 0;
      const otherCharges = Number(vehicle.other_charges) || 0;
      const salePrice = Number(vehicle.sale_invoice) || 0;

      // Get expenses for this vehicle
      const vehicleExpenses = expensesByVehicle.get(vehicle.id) || [];
      const totalExpenses = vehicleExpenses.reduce((sum, exp) => sum + Number(exp.cost), 0);

      // Get Inventory ARB positive adjustments (these reduce purchase cost)
      const inventoryArbAdjustments = arbAdjustmentsByVehicle.get(vehicle.id) || 0;

      // Calculate profit: Sale Price - (Purchase Price + Total Expenses - Inventory ARB Positive Adjustments)
      const totalCost = purchasePrice + buyFee + otherCharges + totalExpenses - inventoryArbAdjustments;
      const netProfit = salePrice - totalCost;

      // Get ARB actions
      const arbActions = arbActionsByVehicle.get(vehicle.id) || [];

      return {
        stockNumber: vehicle.id.substring(0, 8), // Use first 8 chars of UUID as stock number
        vehicleId: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        trim: vehicle.trim || '',
        vin: vehicle.vin || 'N/A',
        purchasePrice,
        buyFee,
        otherCharges,
        salePrice,
        totalExpenses,
        inventoryArbAdjustments,
        netProfit,
        saleDate: vehicle.sale_date,
        location: vehicle.vehicle_location || 'N/A',
        status: vehicle.status,
        expenses: vehicleExpenses.map(exp => ({
          description: exp.expense_description,
          cost: Number(exp.cost),
          date: exp.expense_date,
        })),
        arbActions: arbActions.map(arb => ({
          type: arb.arb_type,
          outcome: arb.outcome,
          adjustmentAmount: arb.adjustment_amount ? Number(arb.adjustment_amount) : null,
          transportCost: arb.transport_cost ? Number(arb.transport_cost) : null,
          date: arb.created_at,
        })),
      };
    });

    return NextResponse.json({ data: profitReport });
  } catch (error: any) {
    console.error('Error in GET /api/reports/profit-per-car:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

