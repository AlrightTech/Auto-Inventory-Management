import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { VehicleInsert } from '@/types/vehicle';

// GET /api/vehicles - Get all vehicles (admin only)
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

    // Get all vehicles with creator information
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(id, username, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
    }

    return NextResponse.json({ data: vehicles });
  } catch (error) {
    console.error('Error in GET /api/vehicles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vehicles - Create new vehicle (admin only)
export async function POST(request: NextRequest) {
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

    const body: VehicleInsert = await request.json();

    // Validate required fields
    if (!body.make || !body.model || !body.year) {
      return NextResponse.json(
        { error: 'Make, model, and year are required' },
        { status: 400 }
      );
    }

    // Validate year
    if (body.year < 1900 || body.year > new Date().getFullYear() + 1) {
      return NextResponse.json(
        { error: 'Invalid year' },
        { status: 400 }
      );
    }

    // Validate VIN - must be 17 characters if provided (standard VIN length)
    // VIN is optional but if provided, should be 17 characters
    const trimmedVin = body.vin ? body.vin.trim() : null;
    
    if (trimmedVin && trimmedVin.length !== 17) {
      return NextResponse.json(
        { error: 'VIN must be exactly 17 characters if provided' },
        { status: 400 }
      );
    }

    // Check if VIN already exists
    if (trimmedVin) {
      const { data: existingVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('vin', trimmedVin)
        .single();

      if (existingVehicle) {
        return NextResponse.json(
          { error: 'Vehicle with this VIN already exists' },
          { status: 400 }
        );
      }
    }

    // Create vehicle - include all fields that exist in the database schema
    const vehicleData = {
      // Basic Vehicle Information
      make: body.make,
      model: body.model,
      year: body.year,
      vin: trimmedVin || null,
      trim: body.trim || null,
      exterior_color: body.exterior_color || null,
      interior_color: body.interior_color || null,
      
      // Vehicle Status and Details
      status: (body.status && ['Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress', 'Pending Arbitration'].includes(body.status)) 
        ? body.status 
        : 'Pending',
      odometer: body.odometer || null,
      // Title status - use all valid values from migration
      title_status: (body.title_status && [
        'Absent', 
        'In Transit', 
        'Received', 
        'Available not Received', 
        'Present', 
        'Released', 
        'Validated', 
        'Sent but not Validated'
      ].includes(body.title_status)) 
        ? body.title_status 
        : 'Absent',
      psi_status: body.psi_status || null,
      dealshield_arbitration_status: body.dealshield_arbitration_status || null,
      
      // Financial Information
      bought_price: body.bought_price || null,
      buy_fee: body.buy_fee || null,
      sale_invoice: body.sale_invoice || null,
      total_vehicle_cost: body.total_vehicle_cost || null,
      other_charges: body.other_charges || null,
      
      // Sale Information
      sale_date: body.sale_date || null,
      lane: body.lane || null,
      run: body.run || null,
      channel: body.channel || null,
      
      // Location Information
      facilitating_location: body.facilitating_location || null,
      vehicle_location: body.vehicle_location || null,
      pickup_location_address1: body.pickup_location_address1 || null,
      pickup_location_city: body.pickup_location_city || null,
      pickup_location_state: body.pickup_location_state || null,
      pickup_location_zip: body.pickup_location_zip || null,
      pickup_location_phone: body.pickup_location_phone || null,
      
      // Seller and Buyer Information
      seller_name: body.seller_name || null,
      buyer_dealership: body.buyer_dealership || null,
      buyer_contact_name: body.buyer_contact_name || null,
      buyer_aa_id: body.buyer_aa_id || null,
      buyer_reference: body.buyer_reference || null,
      sale_invoice_status: (body.sale_invoice_status && ['PAID', 'UNPAID'].includes(body.sale_invoice_status)) 
        ? body.sale_invoice_status 
        : null,
      
      // System Fields
      created_by: user.id,
    };

    // Log the data being sent for debugging
    console.log('Creating vehicle with data:', vehicleData);

    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert(vehicleData)
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(id, username, email)
      `)
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      console.error('Vehicle data:', JSON.stringify(vehicleData, null, 2));
      console.error('Supabase error details:', JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create vehicle';
      if (error.code === '23505') {
        errorMessage = 'A vehicle with this VIN already exists';
      } else if (error.code === '23503') {
        errorMessage = 'Invalid reference: The user profile does not exist';
      } else if (error.code === '23514') {
        errorMessage = `Validation error: ${error.message || 'Invalid value for one or more fields'}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({ data: vehicle }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/vehicles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}