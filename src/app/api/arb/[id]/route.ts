import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/arb/[id] - Get a specific ARB record by ID
export async function GET(
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

    // Get ARB record with vehicle and user details
    const { data: arbRecord, error } = await supabase
      .from('vehicle_arb_records')
      .select(`
        *,
        vehicle:vehicles(
          id,
          year,
          make,
          model,
          trim,
          vin,
          status,
          sale_invoice,
          sale_date,
          buyer_dealership,
          buyer_contact_name
        ),
        created_by_user:profiles(id, username, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'ARB record not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching ARB record:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: error.message || 'Failed to fetch ARB record', details: error },
        { status: 500 }
      );
    }

    if (!arbRecord) {
      return NextResponse.json(
        { error: 'ARB record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: arbRecord });
  } catch (error: any) {
    console.error('Error in GET /api/arb/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

