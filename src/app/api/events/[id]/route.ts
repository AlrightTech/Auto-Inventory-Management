import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { EventUpdate } from '@/types';

// GET /api/events/[id] - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        assigned_user:profiles!events_assigned_to_fkey(*),
        created_by_user:profiles!events_created_by_fkey(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching event:', error);
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/events/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/events/[id] - Update a specific event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body: EventUpdate = await request.json();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data, error } = await supabase
      .from('events')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        assigned_user:profiles!events_assigned_to_fkey(*),
        created_by_user:profiles!events_created_by_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PATCH /api/events/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete a specific event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
