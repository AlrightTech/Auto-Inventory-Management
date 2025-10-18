import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { VehicleInsert } from '@/types';

// GET /api/vehicles - List all vehicles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase
      .from('vehicles')
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (make) {
      query = query.eq('make', make);
    }
    
    if (model) {
      query = query.eq('model', model);
    }
    
    if (year) {
      query = query.eq('year', parseInt(year));
    }
    
    if (search) {
      query = query.or(`make.ilike.%${search}%,model.ilike.%${search}%,vin.ilike.%${search}%`);
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    
    if (error) {
      console.error('Error fetching vehicles:', error);
      return NextResponse.json({ error: 'Failed to fetch vehicles' }, { status: 500 });
    }
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/vehicles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: VehicleInsert = await request.json();
    
    // Validate required fields
    if (!body.make || !body.model || !body.year) {
      return NextResponse.json(
        { error: 'Make, model, and year are required' },
        { status: 400 }
      );
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create vehicle
    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        ...body,
        created_by: user.id
      })
      .select(`
        *,
        created_by_user:profiles!vehicles_created_by_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating vehicle:', error);
      return NextResponse.json({ error: 'Failed to create vehicle' }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/vehicles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
