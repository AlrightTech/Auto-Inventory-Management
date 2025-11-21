import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/reports/arb - Get ARB reports (Sold ARB only)
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
    const outcome = searchParams.get('outcome');

    // Build query for Sold ARB vehicles only
    let query = supabase
      .from('vehicles')
      .select('*')
      .eq('arb_type', 'sold_arb')
      .not('arb_initiated_at', 'is', null);

    // Apply filters
    if (dateFrom) {
      query = query.gte('arb_initiated_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('arb_initiated_at', dateTo);
    }
    if (outcome) {
      query = query.eq('arb_outcome', outcome);
    }

    // Get all ARB vehicles
    const { data: vehicles, error: vehiclesError } = await query.order('arb_initiated_at', { ascending: false });

    if (vehiclesError) {
      console.error('Error fetching ARB vehicles:', vehiclesError);
      return NextResponse.json({ error: 'Failed to fetch ARB vehicles' }, { status: 500 });
    }

    // Group by month
    const monthlyData: Record<string, {
      totalCount: number;
      denied: number;
      priceAdjusted: number;
      buyerWithdrew: number;
      vehicles: any[];
      totalTransportCost: number;
      totalAdjustmentAmount: number;
      totalSoldPrice: number;
    }> = {};

    vehicles.forEach(vehicle => {
      if (!vehicle.arb_initiated_at) return;

      const arbDate = new Date(vehicle.arb_initiated_at);
      const monthKey = `${arbDate.getFullYear()}-${String(arbDate.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          totalCount: 0,
          denied: 0,
          priceAdjusted: 0,
          buyerWithdrew: 0,
          vehicles: [],
          totalTransportCost: 0,
          totalAdjustmentAmount: 0,
          totalSoldPrice: 0,
        };
      }

      monthlyData[monthKey].totalCount += 1;
      monthlyData[monthKey].totalSoldPrice += Number(vehicle.sale_invoice) || 0;

      const soldPrice = Number(vehicle.sale_invoice) || 0;
      const adjustmentAmount = Number(vehicle.arb_adjustment_amount) || 0;
      const transportCost = Number(vehicle.arb_transport_cost) || 0;
      const percentageAdjusted = soldPrice > 0 ? (adjustmentAmount / soldPrice) * 100 : 0;

      const vehicleData = {
        id: vehicle.id,
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
        vin: vehicle.vin || 'N/A',
        soldPrice: soldPrice,
        adjustmentAmount: vehicle.arb_outcome === 'price_adjustment' ? adjustmentAmount : null,
        percentageAdjusted: vehicle.arb_outcome === 'price_adjustment' ? percentageAdjusted : null,
        transportCost: vehicle.arb_outcome === 'buyer_withdrew' ? transportCost : null,
        finalOutcome: vehicle.arb_outcome,
        arbDate: vehicle.arb_initiated_at,
      };

      monthlyData[monthKey].vehicles.push(vehicleData);

      if (vehicle.arb_outcome === 'denied') {
        monthlyData[monthKey].denied += 1;
      } else if (vehicle.arb_outcome === 'price_adjustment') {
        monthlyData[monthKey].priceAdjusted += 1;
        monthlyData[monthKey].totalAdjustmentAmount += adjustmentAmount;
      } else if (vehicle.arb_outcome === 'buyer_withdrew') {
        monthlyData[monthKey].buyerWithdrew += 1;
        monthlyData[monthKey].totalTransportCost += transportCost;
      }
    });

    // Calculate averages and convert to array
    const report = Object.entries(monthlyData).map(([month, data]) => {
      const avgTransportCost = data.buyerWithdrew > 0 ? data.totalTransportCost / data.buyerWithdrew : 0;
      const avgAdjustmentAmount = data.priceAdjusted > 0 ? data.totalAdjustmentAmount / data.priceAdjusted : 0;
      const avgPercentageAdjusted = data.totalSoldPrice > 0 && data.priceAdjusted > 0
        ? (data.totalAdjustmentAmount / data.totalSoldPrice) * 100
        : 0;

      return {
        month,
        totalCount: data.totalCount,
        outcomeBreakdown: {
          denied: data.denied,
          priceAdjusted: data.priceAdjusted,
          buyerWithdrew: data.buyerWithdrew,
        },
        withdrawnCases: {
          count: data.buyerWithdrew,
          avgTransportCost: avgTransportCost,
        },
        priceAdjustedCases: {
          count: data.priceAdjusted,
          avgPercentageAdjusted: avgPercentageAdjusted,
          avgAdjustmentAmount: avgAdjustmentAmount,
        },
        vehicles: data.vehicles,
      };
    }).sort((a, b) => b.month.localeCompare(a.month));

    // Calculate overall averages
    const totalWithdrawn = vehicles.filter(v => v.arb_outcome === 'buyer_withdrew').length;
    const totalPriceAdjusted = vehicles.filter(v => v.arb_outcome === 'price_adjustment').length;
    const totalTransportCost = vehicles
      .filter(v => v.arb_outcome === 'buyer_withdrew')
      .reduce((sum, v) => sum + (Number(v.arb_transport_cost) || 0), 0);
    const totalAdjustmentAmount = vehicles
      .filter(v => v.arb_outcome === 'price_adjustment')
      .reduce((sum, v) => sum + (Number(v.arb_adjustment_amount) || 0), 0);
    const totalSoldPrice = vehicles.reduce((sum, v) => sum + (Number(v.sale_invoice) || 0), 0);

    const overallAverages = {
      avgTransportCost: totalWithdrawn > 0 ? totalTransportCost / totalWithdrawn : 0,
      avgPercentageAdjusted: totalSoldPrice > 0 && totalPriceAdjusted > 0
        ? (totalAdjustmentAmount / totalSoldPrice) * 100
        : 0,
      avgAdjustmentAmount: totalPriceAdjusted > 0 ? totalAdjustmentAmount / totalPriceAdjusted : 0,
    };

    return NextResponse.json({
      data: report,
      overallAverages,
    });
  } catch (error) {
    console.error('Error in GET /api/reports/arb:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

