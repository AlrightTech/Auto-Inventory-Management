import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reports/arbitration - Get arbitration reports (Sold ARBs only)
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

    // Get all Sold ARB records
    let arbQuery = supabase
      .from('vehicle_arb_records')
      .select(`
        id,
        vehicle_id,
        outcome,
        adjustment_amount,
        transport_cost,
        created_at,
        vehicle:vehicles!vehicle_arb_records_vehicle_id_fkey(
          id,
          sale_invoice,
          sale_date
        )
      `)
      .eq('arb_type', 'Sold ARB')
      .order('created_at', { ascending: true });

    if (dateFrom) {
      arbQuery = arbQuery.gte('created_at', dateFrom);
    }
    if (dateTo) {
      arbQuery = arbQuery.lte('created_at', dateTo);
    }

    const { data: arbRecords, error: arbError } = await arbQuery;

    if (arbError) {
      console.error('Error fetching ARB records:', arbError);
      return NextResponse.json(
        { error: 'Failed to fetch ARB records' },
        { status: 500 }
      );
    }

    if (!arbRecords || arbRecords.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Group by month
    const monthlyData = new Map<string, {
      month: string;
      totalArbs: number;
      denied: number;
      withdrawn: number;
      withdrawnTransportCosts: number[];
      priceAdjusted: number;
      priceAdjustments: Array<{ amount: number; salePrice: number }>;
    }>();

    arbRecords.forEach(arb => {
      const date = new Date(arb.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      const existing = monthlyData.get(monthKey) || {
        month: monthKey,
        totalArbs: 0,
        denied: 0,
        withdrawn: 0,
        withdrawnTransportCosts: [],
        priceAdjusted: 0,
        priceAdjustments: [],
      };

      existing.totalArbs += 1;

      if (arb.outcome === 'Denied') {
        existing.denied += 1;
      } else if (arb.outcome === 'Buyer Withdrew') {
        existing.withdrawn += 1;
        if (arb.transport_cost) {
          existing.withdrawnTransportCosts.push(Number(arb.transport_cost));
        }
      } else if (arb.outcome === 'Price Adjustment') {
        existing.priceAdjusted += 1;
        const salePrice = arb.vehicle?.sale_invoice ? Number(arb.vehicle.sale_invoice) : 0;
        const adjustmentAmount = arb.adjustment_amount ? Number(arb.adjustment_amount) : 0;
        if (salePrice > 0 && adjustmentAmount > 0) {
          existing.priceAdjustments.push({
            amount: adjustmentAmount,
            salePrice,
          });
        }
      }

      monthlyData.set(monthKey, existing);
    });

    // Calculate averages and percentages
    const report = Array.from(monthlyData.values()).map(data => {
      // Calculate average transport cost for withdrawn
      const avgTransportCost = data.withdrawnTransportCosts.length > 0
        ? data.withdrawnTransportCosts.reduce((sum, cost) => sum + cost, 0) / data.withdrawnTransportCosts.length
        : 0;

      // Calculate average percentage and dollar amount for price adjustments
      let avgAdjustmentPercent = 0;
      let avgAdjustmentAmount = 0;

      if (data.priceAdjustments.length > 0) {
        const percentages = data.priceAdjustments.map(adj => 
          (adj.amount / adj.salePrice) * 100
        );
        avgAdjustmentPercent = percentages.reduce((sum, pct) => sum + pct, 0) / percentages.length;
        avgAdjustmentAmount = data.priceAdjustments.reduce((sum, adj) => sum + adj.amount, 0) / data.priceAdjustments.length;
      }

      return {
        month: data.month,
        totalArbs: data.totalArbs,
        denied: data.denied,
        withdrawn: {
          count: data.withdrawn,
          avgTransportCost: Math.round(avgTransportCost * 100) / 100,
        },
        priceAdjusted: {
          count: data.priceAdjusted,
          avgPercent: Math.round(avgAdjustmentPercent * 100) / 100,
          avgAmount: Math.round(avgAdjustmentAmount * 100) / 100,
        },
      };
    }).sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('Error in GET /api/reports/arbitration:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

