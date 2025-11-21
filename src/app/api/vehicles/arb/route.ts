import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/vehicles/arb - Get all ARB vehicles
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

    // Get all vehicles with ARB status
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(id, username, email)
      `)
      .eq('status', 'ARB')
      .order('arb_initiated_at', { ascending: false });

    if (error) {
      console.error('Error fetching ARB vehicles:', error);
      return NextResponse.json({ error: 'Failed to fetch ARB vehicles' }, { status: 500 });
    }

    // Transform the data
    const arbVehicles = vehicles.map(vehicle => {
      const boughtPrice = Number(vehicle.bought_price) || 0;
      const buyFee = Number(vehicle.buy_fee) || 0;
      const otherCharges = Number(vehicle.other_charges) || 0;
      const soldPrice = Number(vehicle.sale_invoice) || 0;
      const totalCost = boughtPrice + buyFee + otherCharges;
      
      // Get expenses for this vehicle
      // Note: We'll need to fetch expenses separately or include them in a join
      
      return {
        id: vehicle.id,
        vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` (${vehicle.trim})` : ''}`,
        vin: vehicle.vin || 'N/A',
        soldDate: vehicle.sale_date ? new Date(vehicle.sale_date).toISOString().split('T')[0] : null,
        soldPrice: soldPrice,
        boughtPrice: boughtPrice,
        buyerName: vehicle.buyer_contact_name || vehicle.buyer_dealership || 'N/A',
        arbDate: vehicle.arb_initiated_at ? new Date(vehicle.arb_initiated_at).toISOString().split('T')[0] : null,
        arbType: vehicle.arb_type || 'sold_arb', // Default to sold_arb for backward compatibility
        outcome: vehicle.arb_outcome || 'pending',
        adjustmentAmount: vehicle.arb_adjustment_amount ? Number(vehicle.arb_adjustment_amount) : null,
        transportType: vehicle.arb_transport_type || null,
        transportCompany: vehicle.arb_transport_company || null,
        transportCost: vehicle.arb_transport_cost ? Number(vehicle.arb_transport_cost) : null,
        status: vehicle.status,
        originalStatus: vehicle.status === 'ARB' ? (vehicle.arb_type === 'sold_arb' ? 'Sold' : 'Pending') : vehicle.status,
      };
    });

    return NextResponse.json({ data: arbVehicles });
  } catch (error) {
    console.error('Error in GET /api/vehicles/arb:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vehicles/arb - Initiate ARB for a vehicle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vehicleId, arbType } = body;

    if (!vehicleId || !arbType) {
      return NextResponse.json(
        { error: 'Vehicle ID and ARB type are required' },
        { status: 400 }
      );
    }

    if (!['sold_arb', 'inventory_arb'].includes(arbType)) {
      return NextResponse.json(
        { error: 'Invalid ARB type. Must be sold_arb or inventory_arb' },
        { status: 400 }
      );
    }

    // Get the vehicle to check its current status
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('status, sale_invoice')
      .eq('id', vehicleId)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Validate ARB type matches vehicle status
    if (arbType === 'sold_arb' && vehicle.status !== 'Sold') {
      return NextResponse.json(
        { error: 'Sold ARB can only be initiated for vehicles with Sold status' },
        { status: 400 }
      );
    }

    if (arbType === 'inventory_arb' && !['Pending', 'In Progress'].includes(vehicle.status)) {
      return NextResponse.json(
        { error: 'Inventory ARB can only be initiated for vehicles in Inventory (Pending or In Progress status)' },
        { status: 400 }
      );
    }

    // Update vehicle to ARB status
    const { data: updatedVehicle, error: updateError } = await supabase
      .from('vehicles')
      .update({
        status: 'ARB',
        arb_type: arbType,
        arb_initiated_at: new Date().toISOString(),
        arb_outcome: null, // Reset outcome
        arb_adjustment_amount: null,
        arb_transport_type: null,
        arb_transport_company: null,
        arb_transport_cost: null,
      })
      .eq('id', vehicleId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating vehicle to ARB:', updateError);
      return NextResponse.json(
        { error: 'Failed to initiate ARB' },
        { status: 500 }
      );
    }

    // Log to timeline
    try {
      await supabase.from('vehicle_timeline').insert({
        vehicle_id: vehicleId,
        action: arbType === 'sold_arb' ? 'ARB Initiated (Sold)' : 'ARB Initiated (Inventory)',
        user_id: user.id,
        action_date: new Date().toISOString().split('T')[0],
        action_time: new Date().toTimeString().split(' ')[0].substring(0, 8),
        note: `ARB initiated from ${arbType === 'sold_arb' ? 'Sold' : 'Inventory'} section`,
        status: 'ARB',
      });
    } catch (timelineError) {
      console.error('Error logging to timeline:', timelineError);
      // Don't fail the request if timeline logging fails
    }

    return NextResponse.json({ data: updatedVehicle }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/vehicles/arb:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

