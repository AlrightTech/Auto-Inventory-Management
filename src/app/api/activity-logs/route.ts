import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/permissions';
import { PERMISSIONS } from '@/lib/permissions';

// GET /api/activity-logs - Get activity logs (admin or users with permission)
export async function GET(request: NextRequest) {
  try {
    // Check if user has permission to view activity logs
    const authResult = await requirePermission(
      request,
      PERMISSIONS.SYSTEM.ACTIVITY_LOGS
    );
    if (authResult.error) return authResult.response;
    const { supabase } = authResult;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entity_type');
    const entityId = searchParams.get('entity_id');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('activity_logs')
      .select(
        `
        *,
        user:profiles!activity_logs_user_id_fkey(
          id,
          email,
          username
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }
    if (action) {
      query = query.eq('action', action);
    }

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch activity logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: logs || [],
      count: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/activity-logs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

