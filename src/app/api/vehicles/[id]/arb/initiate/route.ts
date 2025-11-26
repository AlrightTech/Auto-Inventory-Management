import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/vehicles/[id]/arb/initiate - Initiate ARB for a vehicle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;
    const body = await request.json();
    const { arb_type } = body; // 'Sold ARB' or 'Inventory ARB'

    if (!arb_type || !['Sold ARB', 'Inventory ARB'].includes(arb_type)) {
      return NextResponse.json(
        { error: 'Invalid ARB type. Must be "Sold ARB" or "Inventory ARB"' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get vehicle to verify it exists and check current status
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', vehicleId)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Validate ARB initiation based on type
    if (arb_type === 'Sold ARB' && vehicle.status !== 'Sold') {
      return NextResponse.json(
        { error: 'ARB from Sold section can only be initiated for vehicles with Sold status' },
        { status: 400 }
      );
    }

    if (arb_type === 'Inventory ARB' && vehicle.status === 'Sold') {
      return NextResponse.json(
        { error: 'ARB from Inventory section cannot be initiated for sold vehicles' },
        { status: 400 }
      );
    }

    // Create ARB record with Pending outcome
    const { data: arbRecord, error: arbError } = await supabase
      .from('vehicle_arb_records')
      .insert({
        vehicle_id: vehicleId,
        arb_type,
        outcome: 'Pending',
        created_by: user.id,
      })
      .select()
      .single();

    if (arbError) {
      console.error('Error creating ARB record:', arbError);
      return NextResponse.json(
        { error: 'Failed to create ARB record' },
        { status: 500 }
      );
    }

    // Update vehicle status to 'Pending Arbitration'
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ status: 'Pending Arbitration' })
      .eq('id', vehicleId);

    if (updateError) {
      console.error('Error updating vehicle status:', updateError);
      // Rollback ARB record creation
      await supabase
        .from('vehicle_arb_records')
        .delete()
        .eq('id', arbRecord.id);
      
      return NextResponse.json(
        { error: 'Failed to update vehicle status' },
        { status: 500 }
      );
    }

    // Log to timeline
    await supabase
      .from('vehicle_timeline')
      .insert({
        vehicle_id: vehicleId,
        action: 'ARB Initiated',
        user_id: user.id,
        note: `${arb_type} initiated`,
        status: 'Pending Arbitration',
      });

    return NextResponse.json({ data: arbRecord }, { status: 201 });
  } catch (error: any) {
    console.error('Error initiating ARB:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate ARB' },
      { status: 500 }
    );
  }
}


