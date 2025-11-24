import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/vehicles/[id]/arb/history - Get ARB history for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get ARB history for this vehicle
    const { data: arbHistory, error } = await supabase
      .from('vehicle_arb_records')
      .select(`
        *,
        created_by_user:profiles!vehicle_arb_records_created_by_fkey(id, username, email)
      `)
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ARB history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ARB history' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: arbHistory || [] });
  } catch (error: any) {
    console.error('Error in GET /api/vehicles/[id]/arb/history:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

