import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/reports/missing-titles - Get missing titles report
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
    const vin = searchParams.get('vin');
    const section = searchParams.get('section'); // 'inventory', 'sold', 'arb', or null for all

    // Define missing title statuses
    const missingTitleStatuses = ['Absent', 'In Transit', 'Available not Received'];

    // Build queries for each section
    const sections: Record<string, any> = {};

    // Inventory section
    if (!section || section === 'inventory') {
      let inventoryQuery = supabase
        .from('vehicles')
        .select('*')
        .in('status', ['Pending', 'In Progress'])
        .in('title_status', missingTitleStatuses);

      if (vin) {
        inventoryQuery = inventoryQuery.ilike('vin', `%${vin}%`);
      }

      const { data: inventoryVehicles } = await inventoryQuery.order('created_at', { ascending: false });

      sections.inventory = (inventoryVehicles || []).map(vehicle => {
        const purchaseDate = vehicle.created_at ? new Date(vehicle.created_at) : new Date();
        const daysMissing = Math.floor((new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: vehicle.id,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
          vin: vehicle.vin || 'N/A',
          section: 'Inventory',
          daysMissing: daysMissing,
          currentTitleStatus: vehicle.title_status,
          purchaseDate: vehicle.created_at,
        };
      });
    }

    // Sold section
    if (!section || section === 'sold') {
      let soldQuery = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'Sold')
        .in('title_status', missingTitleStatuses);

      if (vin) {
        soldQuery = soldQuery.ilike('vin', `%${vin}%`);
      }

      const { data: soldVehicles } = await soldQuery.order('sale_date', { ascending: false });

      sections.sold = (soldVehicles || []).map(vehicle => {
        const purchaseDate = vehicle.created_at ? new Date(vehicle.created_at) : new Date();
        const daysMissing = Math.floor((new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: vehicle.id,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
          vin: vehicle.vin || 'N/A',
          section: 'Sold',
          daysMissing: daysMissing,
          currentTitleStatus: vehicle.title_status,
          purchaseDate: vehicle.created_at,
        };
      });
    }

    // ARB section
    if (!section || section === 'arb') {
      let arbQuery = supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'ARB')
        .in('title_status', missingTitleStatuses);

      if (vin) {
        arbQuery = arbQuery.ilike('vin', `%${vin}%`);
      }

      const { data: arbVehicles } = await arbQuery.order('arb_initiated_at', { ascending: false });

      sections.arb = (arbVehicles || []).map(vehicle => {
        const purchaseDate = vehicle.created_at ? new Date(vehicle.created_at) : new Date();
        const daysMissing = Math.floor((new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: vehicle.id,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`,
          vin: vehicle.vin || 'N/A',
          section: 'ARB',
          daysMissing: daysMissing,
          currentTitleStatus: vehicle.title_status,
          purchaseDate: vehicle.created_at,
        };
      });
    }

    // Combine all sections
    const allMissingTitles = [
      ...(sections.inventory || []),
      ...(sections.sold || []),
      ...(sections.arb || []),
    ].sort((a, b) => b.daysMissing - a.daysMissing); // Sort by days missing (longest first)

    // Calculate summary
    const summary = {
      inventory: sections.inventory?.length || 0,
      sold: sections.sold?.length || 0,
      arb: sections.arb?.length || 0,
      total: allMissingTitles.length,
      longestMissing: allMissingTitles.length > 0 ? allMissingTitles[0].daysMissing : 0,
    };

    return NextResponse.json({
      data: allMissingTitles,
      summary,
      bySection: sections,
    });
  } catch (error) {
    console.error('Error in GET /api/reports/missing-titles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

