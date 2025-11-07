import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all timeline entries for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');

    const { data, error } = await supabase
      .from('vehicle_timeline')
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          email
        )
      `)
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false })
      .order('action_date', { ascending: false })
      .order('action_time', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      // If table doesn't exist, return empty array gracefully
      if (error.code === '42P01') {
        return NextResponse.json({ data: [], total: 0 });
      }
      throw error;
    }

    // Get total count
    const { count } = await supabase
      .from('vehicle_timeline')
      .select('*', { count: 'exact', head: true })
      .eq('vehicle_id', vehicleId);

    return NextResponse.json({ 
      data: data || [], 
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error: any) {
    console.error('Error fetching vehicle timeline:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch timeline entries' },
      { status: 500 }
    );
  }
}

// POST - Create a new timeline entry
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;
    const body = await request.json();
    const { action, actionDate, actionTime, cost, expenseValue, note, status } = body;

    // Validate required fields
    if (!action || action.trim() === '') {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Use current date/time if not provided
    const date = actionDate || new Date().toISOString().split('T')[0];
    const time = actionTime || new Date().toTimeString().split(' ')[0].substring(0, 8);

    // Check for duplicate entry using the unique constraint
    const { data: existing } = await supabase
      .from('vehicle_timeline')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .eq('action', action.trim())
      .eq('action_date', date)
      .eq('action_time', time)
      .eq('note', note?.trim() || '')
      .single();

    if (existing) {
      // Return existing entry instead of creating duplicate
      const { data: existingFull } = await supabase
        .from('vehicle_timeline')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            email
          )
        `)
        .eq('id', existing.id)
        .single();

      return NextResponse.json({ data: existingFull }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('vehicle_timeline')
      .insert({
        vehicle_id: vehicleId,
        action: action.trim(),
        user_id: user?.id || null,
        action_date: date,
        action_time: time,
        cost: cost ? parseFloat(cost) : null,
        expense_value: expenseValue ? parseFloat(expenseValue) : null,
        note: note?.trim() || null,
        status: status || null,
      })
      .select(`
        *,
        profiles:user_id (
          id,
          username,
          email
        )
      `)
      .single();

    if (error) {
      // If table doesn't exist, return friendly error
      if (error.code === '42P01') {
        return NextResponse.json(
          { error: 'Timeline table not found. Please run database migrations.' },
          { status: 503 }
        );
      }
      // If duplicate entry (unique constraint violation), return existing
      if (error.code === '23505') {
        const { data: existingFull } = await supabase
          .from('vehicle_timeline')
          .select(`
            *,
            profiles:user_id (
              id,
              username,
              email
            )
          `)
          .eq('vehicle_id', vehicleId)
          .eq('action', action.trim())
          .eq('action_date', date)
          .eq('action_time', time)
          .single();

        if (existingFull) {
          return NextResponse.json({ data: existingFull }, { status: 200 });
        }
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle timeline entry:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create timeline entry' },
      { status: 500 }
    );
  }
}

