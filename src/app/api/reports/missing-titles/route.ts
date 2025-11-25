import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reports/missing-titles - Get missing titles report
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
    const section = searchParams.get('section'); // 'inventory', 'sold', 'arb', or 'all'

    const missingTitles: any[] = [];

    // A. Inventory Missing Titles
    if (!section || section === 'all' || section === 'inventory') {
      const { data: inventoryVehicles, error: inventoryError } = await supabase
        .from('vehicles')
        .select(`
          id,
          year,
          make,
          model,
          trim,
          vin,
          title_status,
          created_at,
          seller_name,
          vehicle_location
        `)
        .in('status', ['Pending', 'In Progress'])
        .in('title_status', ['Absent', 'In Transit', 'Available not Received']);

      if (!inventoryError && inventoryVehicles) {
        inventoryVehicles.forEach(vehicle => {
          const purchaseDate = new Date(vehicle.created_at);
          const daysMissing = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

          missingTitles.push({
            vehicleId: vehicle.id,
            stockNumber: vehicle.id.substring(0, 8),
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim || '',
            vin: vehicle.vin || 'N/A',
            seller: vehicle.seller_name || 'N/A',
            purchaseOrSaleDate: vehicle.created_at,
            daysMissing,
            currentStatus: 'Inventory',
            titleStatus: vehicle.title_status,
            location: vehicle.vehicle_location || 'N/A',
          });
        });
      }
    }

    // B. Sold Missing Titles
    if (!section || section === 'all' || section === 'sold') {
      const { data: soldVehicles, error: soldError } = await supabase
        .from('vehicles')
        .select(`
          id,
          year,
          make,
          model,
          trim,
          vin,
          title_status,
          sale_date,
          created_at,
          seller_name,
          vehicle_location
        `)
        .in('status', ['Sold', 'ARB', 'Pending Arbitration'])
        .in('title_status', ['Absent', 'In Transit', 'Available not Received']);

      if (!soldError && soldVehicles) {
        soldVehicles.forEach(vehicle => {
          const saleDate = vehicle.sale_date ? new Date(vehicle.sale_date) : new Date(vehicle.created_at);
          const daysMissing = Math.floor((Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24));

          missingTitles.push({
            vehicleId: vehicle.id,
            stockNumber: vehicle.id.substring(0, 8),
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim || '',
            vin: vehicle.vin || 'N/A',
            seller: vehicle.seller_name || 'N/A',
            purchaseOrSaleDate: vehicle.sale_date || vehicle.created_at,
            daysMissing,
            currentStatus: 'Sold',
            titleStatus: vehicle.title_status,
            location: vehicle.vehicle_location || 'N/A',
          });
        });
      }
    }

    // C. ARB Section Missing Titles
    if (!section || section === 'all' || section === 'arb') {
      // Get vehicles with ARB status
      const { data: arbVehicles, error: arbError } = await supabase
        .from('vehicles')
        .select(`
          id,
          year,
          make,
          model,
          trim,
          vin,
          title_status,
          sale_date,
          created_at,
          seller_name,
          vehicle_location,
          status
        `)
        .eq('status', 'Pending Arbitration')
        .in('title_status', ['Absent', 'In Transit', 'Available not Received']);

      if (!arbError && arbVehicles) {
        arbVehicles.forEach(vehicle => {
          const referenceDate = vehicle.sale_date 
            ? new Date(vehicle.sale_date) 
            : new Date(vehicle.created_at);
          const daysMissing = Math.floor((Date.now() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));

          missingTitles.push({
            vehicleId: vehicle.id,
            stockNumber: vehicle.id.substring(0, 8),
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim || '',
            vin: vehicle.vin || 'N/A',
            seller: vehicle.seller_name || 'N/A',
            purchaseOrSaleDate: vehicle.sale_date || vehicle.created_at,
            daysMissing,
            currentStatus: 'ARB',
            titleStatus: vehicle.title_status,
            location: vehicle.vehicle_location || 'N/A',
          });
        });
      }
    }

    // Sort by days missing (descending)
    missingTitles.sort((a, b) => b.daysMissing - a.daysMissing);

    return NextResponse.json({ data: missingTitles });
  } catch (error: any) {
    console.error('Error in GET /api/reports/missing-titles:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

