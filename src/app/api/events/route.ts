import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { EventInsert } from '@/types';

// GET /api/events - List all events
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase
      .from('events')
      .select(`
        *,
        assigned_user:profiles!events_assigned_to_fkey(*),
        created_by_user:profiles!events_created_by_fkey(*)
      `)
      .order('event_date', { ascending: true });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    
    if (dateFrom) {
      query = query.gte('event_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('event_date', dateTo);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,notes.ilike.%${search}%`);
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    
    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
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
    console.error('Error in GET /api/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: EventInsert = await request.json();
    
    // Validate required fields
    if (!body.title || !body.event_date || !body.event_time) {
      return NextResponse.json(
        { error: 'Title, event date, and event time are required' },
        { status: 400 }
      );
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create event
    const { data, error } = await supabase
      .from('events')
      .insert({
        ...body,
        created_by: user.id
      })
      .select(`
        *,
        assigned_user:profiles!events_assigned_to_fkey(*),
        created_by_user:profiles!events_created_by_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
