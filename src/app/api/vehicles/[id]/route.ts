import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { VehicleUpdate } from '@/types/vehicle';

// GET /api/vehicles/[id] - Get specific vehicle (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
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

    // Get specific vehicle
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(id, username, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }
      console.error('Error fetching vehicle:', error);
      return NextResponse.json({ error: 'Failed to fetch vehicle' }, { status: 500 });
    }

    return NextResponse.json({ data: vehicle });
  } catch (error) {
    console.error('Error in GET /api/vehicles/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/vehicles/[id] - Update vehicle (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
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

    const body: Partial<VehicleUpdate> = await request.json();

    // Validate VIN if provided
    if (body.vin) {
      const trimmedVin = body.vin.trim();
      if (trimmedVin.length !== 10) {
        return NextResponse.json(
          { error: 'VIN must be exactly 10 characters' },
          { status: 400 }
        );
      }
      // Update body.vin with trimmed value
      body.vin = trimmedVin;
    }

    // Check if VIN already exists (excluding current vehicle)
    if (body.vin) {
      const { data: existingVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('vin', body.vin)
        .neq('id', id)
        .single();

      if (existingVehicle) {
        return NextResponse.json(
          { error: 'Vehicle with this VIN already exists' },
          { status: 400 }
        );
      }
    }

    // Remove id from body if present (shouldn't be in update)
    const { id: _, ...updateData } = body as any;
    
    // Filter out undefined values and null values for optional fields
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    // Check which columns exist in the vehicles table before updating
    // This prevents errors if a column doesn't exist yet
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Filter out any fields that might not exist in the schema
    // Only include fields that are in the VehicleUpdate type or known columns
    const allowedFields = [
      'status', 'title_status', 'arb_status', 'auction_name', 'auction_date',
      'vin', 'year', 'make', 'model', 'trim', 'exterior_color', 'interior_color',
      'odometer', 'psi_status', 'dealshield_arbitration_status',
      'bought_price', 'buy_fee', 'sale_invoice', 'total_vehicle_cost', 'other_charges', 'other_charges2',
      'sale_date', 'lane', 'run', 'channel', 'sale_invoice_paid_date',
      'facilitating_location', 'vehicle_location',
      'pickup_location_address1', 'pickup_location_address2', 'pickup_location_city',
      'pickup_location_state', 'pickup_location_zip', 'pickup_location_phone',
      'seller_name', 'buyer_dealership', 'buyer_contact_name', 'buyer_aa_id',
      'buyer_rep_aa_id', 'buyer_reference', 'sale_invoice_status'
    ];

    const safeUpdateData = Object.fromEntries(
      Object.entries(cleanUpdateData).filter(([key]) => allowedFields.includes(key))
    );

    // Update vehicle
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update(safeUpdateData)
      .eq('id', id)
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(id, username, email)
      `)
      .single();

    if (error) {
      console.error('Error updating vehicle:', error);
      console.error('Update data:', cleanUpdateData);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Provide more specific error messages
      let errorMessage = 'Failed to update vehicle';
      if (error.code === '23505') {
        errorMessage = 'A record with this value already exists';
      } else if (error.code === '23503') {
        errorMessage = 'Invalid reference: Related record does not exist';
      } else if (error.code === '23514') {
        errorMessage = `Validation error: ${error.message || 'Invalid value for one or more fields'}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    return NextResponse.json({ data: vehicle });
  } catch (error: any) {
    console.error('Error in PATCH /api/vehicles/[id]:', error);
    return NextResponse.json({ 
      error: error?.message || 'Internal server error',
      details: error?.toString()
    }, { status: 500 });
  }
}

// DELETE /api/vehicles/[id] - Delete vehicle (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
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

    // Delete vehicle
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/vehicles/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




