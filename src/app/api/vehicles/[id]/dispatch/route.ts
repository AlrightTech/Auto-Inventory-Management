import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all dispatch records for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;

    const { data, error } = await supabase
      .from('vehicle_dispatch')
      .select(`
        *,
        profiles:created_by (
          id,
          username,
          email
        )
      `)
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, return empty array gracefully
      if (error.code === '42P01') {
        return NextResponse.json({ data: [] });
      }
      throw error;
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('Error fetching vehicle dispatch records:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dispatch records' },
      { status: 500 }
    );
  }
}

// POST - Create a new dispatch record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;
    const body = await request.json();
    const { location, transportCompany, transportCost, notes, address, state, zip, acAssignCarrier, fileUrl, fileName } = body;

    // Validate required fields
    if (!location || location.trim() === '') {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    if (!transportCompany || transportCompany.trim() === '') {
      return NextResponse.json(
        { error: 'Transport Company is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('vehicle_dispatch')
      .insert({
        vehicle_id: vehicleId,
        location: location.trim(),
        transport_company: transportCompany.trim(),
        transport_cost: transportCost ? parseFloat(transportCost) : null,
        notes: notes?.trim() || null,
        address: address?.trim() || null,
        state: state?.trim() || null,
        zip: zip?.trim() || null,
        ac_assign_carrier: acAssignCarrier?.trim() || null,
        file_url: fileUrl || null,
        file_name: fileName || null,
        created_by: user?.id || null,
      })
      .select(`
        *,
        profiles:created_by (
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
          { error: 'Dispatch table not found. Please run database migrations.' },
          { status: 503 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle dispatch record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create dispatch record' },
      { status: 500 }
    );
  }
}

