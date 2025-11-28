import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/tasks/bulk - Bulk update tasks
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskIds, updates } = body;

    // Validate input
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Task IDs array is required' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Updates object is required' },
        { status: 400 }
      );
    }

    // Bulk update tasks
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .in('id', taskIds)
      .select(`
        *,
        vehicle:vehicles(*),
        assigned_user:profiles!tasks_assigned_to_fkey(*),
        assigned_by_user:profiles!tasks_assigned_by_fkey(*)
      `);

    if (error) {
      console.error('Error bulk updating tasks:', error);
      return NextResponse.json(
        { error: 'Failed to update tasks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      message: `${data.length} task(s) updated successfully`,
      count: data.length
    });
  } catch (error) {
    console.error('Error in PATCH /api/tasks/bulk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}






