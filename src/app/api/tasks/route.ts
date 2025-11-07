import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { TaskInsert } from '@/types';

// GET /api/tasks - List all tasks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const assignedTo = searchParams.get('assignedTo');
    const vehicleId = searchParams.get('vehicleId');
    const search = searchParams.get('search');
    
    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        vehicle:vehicles(*),
        assigned_user:profiles!tasks_assigned_to_fkey(*),
        assigned_by_user:profiles!tasks_assigned_by_fkey(*)
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }
    
    if (search) {
      query = query.or(`task_name.ilike.%${search}%,notes.ilike.%${search}%`);
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.range(from, to);
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
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
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: TaskInsert = await request.json();
    
    // Validate required fields
    if (!body.task_name || !body.due_date) {
      return NextResponse.json(
        { error: 'Task name and due date are required' },
        { status: 400 }
      );
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Create task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...body,
        assigned_by: user.id
      })
      .select(`
        *,
        vehicle:vehicles(*),
        assigned_user:profiles!tasks_assigned_to_fkey(*),
        assigned_by_user:profiles!tasks_assigned_by_fkey(*)
      `)
      .single();
    
    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
