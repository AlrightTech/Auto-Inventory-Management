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

    // Validate VIN if provided
    if (body.vin && body.vin.length !== 17) {
      return NextResponse.json(
        { error: 'VIN must be 17 characters' },
        { status: 400 }
      );
    }

    // Check if VIN already exists
    if (body.vin) {
      const { data: existingVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('vin', body.vin)
        .single();

      if (existingVehicle) {
        return NextResponse.json(
          { error: 'Vehicle with this VIN already exists' },
          { status: 400 }
        );
      }
    }

    // Create vehicle
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({
        ...body,
        created_by: user.id,
      })
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(id, username, email)
      `)
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
    }

    return NextResponse.json({ data: vehicle }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/vehicles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}