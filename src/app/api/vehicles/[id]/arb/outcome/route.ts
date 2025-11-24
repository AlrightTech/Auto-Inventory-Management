import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/vehicles/[id]/arb/outcome - Process ARB outcome
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;
    const body = await request.json();
    const {
      arb_type,
      outcome,
      adjustment_amount,
      transport_type,
      transport_location,
      transport_date,
      transport_cost,
      notes,
    } = body;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    if (!arb_type || !outcome) {
      return NextResponse.json(
        { error: 'ARB type and outcome are required' },
        { status: 400 }
      );
    }

    // Get vehicle
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

    // Get the most recent pending ARB record for this vehicle
    const { data: pendingArb, error: arbError } = await supabase
      .from('vehicle_arb_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .eq('outcome', 'Pending')
      .eq('arb_type', arb_type)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (arbError || !pendingArb) {
      return NextResponse.json(
        { error: 'No pending ARB record found for this vehicle' },
        { status: 404 }
      );
    }

    // Process outcome based on ARB type
    let vehicleUpdate: any = {};
    let expenseData: any = null;
    let timelineNote = '';

    if (arb_type === 'Sold ARB') {
      // SOLD ARB LOGIC
      if (outcome === 'Denied') {
        // Denied: Revert to Sold, no changes
        vehicleUpdate.status = 'Sold';
        timelineNote = 'ARB Denied - Reverted to Sold status';
      } else if (outcome === 'Price Adjustment') {
        // Price Adjustment: Add expense, revert to Sold
        if (!adjustment_amount || adjustment_amount <= 0) {
          return NextResponse.json(
            { error: 'Adjustment amount is required for Price Adjustment' },
            { status: 400 }
          );
        }
        vehicleUpdate.status = 'Sold';
        expenseData = {
          vehicle_id: vehicleId,
          expense_description: 'Arbitration Modified',
          expense_date: new Date().toISOString().split('T')[0],
          cost: Math.abs(adjustment_amount), // Store as positive value
          notes: notes || 'ARB Price Adjustment',
          created_by: user.id,
        };
        timelineNote = `ARB Price Adjustment: $${adjustment_amount}`;
      } else if (outcome === 'Buyer Withdrew') {
        // Buyer Withdrew: Return to Inventory, add transport cost
        if (!transport_cost || transport_cost <= 0) {
          return NextResponse.json(
            { error: 'Transport cost is required for Buyer Withdrew' },
            { status: 400 }
          );
        }
        vehicleUpdate.status = 'Pending'; // Return to inventory
        vehicleUpdate.sale_invoice = null; // Clear sale info
        vehicleUpdate.sale_date = null;
        vehicleUpdate.buyer_dealership = null;
        vehicleUpdate.buyer_contact_name = null;
        vehicleUpdate.buyer_aa_id = null;
        vehicleUpdate.buyer_reference = null;
        vehicleUpdate.sale_invoice_status = null;
        
        expenseData = {
          vehicle_id: vehicleId,
          expense_description: `Transport - ${transport_type || 'N/A'}`,
          expense_date: transport_date || new Date().toISOString().split('T')[0],
          cost: transport_cost,
          notes: `Transport Location: ${transport_location || 'N/A'}. ${notes || ''}`,
          created_by: user.id,
        };
        timelineNote = `Buyer Withdrew - Transport Cost: $${transport_cost}`;
      }
    } else if (arb_type === 'Inventory ARB') {
      // INVENTORY ARB LOGIC
      if (outcome === 'Withdrawn') {
        // Withdrawn: Remove from inventory (delete vehicle)
        // We'll mark it as deleted or set a special status
        // For now, we'll set status to 'Withdrew' and clear purchase info
        vehicleUpdate.status = 'Withdrew';
        vehicleUpdate.bought_price = null;
        vehicleUpdate.buy_fee = null;
        vehicleUpdate.other_charges = null;
        timelineNote = 'ARB Withdrawn - Vehicle removed from inventory';
      } else if (outcome === 'Price Adjustment') {
        // Price Adjustment: Positive adjustment reduces purchase cost
        if (!adjustment_amount || adjustment_amount <= 0) {
          return NextResponse.json(
            { error: 'Adjustment amount is required for Price Adjustment' },
            { status: 400 }
          );
        }
        // Effective Purchase Price = Original Purchase Price - Adjustment Amount
        const currentBoughtPrice = Number(vehicle.bought_price) || 0;
        const newBoughtPrice = Math.max(0, currentBoughtPrice - adjustment_amount);
        vehicleUpdate.bought_price = newBoughtPrice;
        vehicleUpdate.status = 'Pending'; // Stay in inventory
        
        // Note: We don't store this as an expense because we're reducing bought_price directly
        // The ARB record itself tracks the adjustment amount
        // When the vehicle is sold, profit will be calculated using the reduced bought_price
        timelineNote = `ARB Price Adjustment: $${adjustment_amount} (reduces purchase cost from $${currentBoughtPrice} to $${newBoughtPrice})`;
      } else if (outcome === 'Denied') {
        // Denied: No changes, stay in inventory
        vehicleUpdate.status = 'Pending';
        timelineNote = 'ARB Denied - No changes';
      }
    }

    // Update ARB record with outcome
    const { data: updatedArb, error: updateArbError } = await supabase
      .from('vehicle_arb_records')
      .update({
        outcome,
        adjustment_amount: adjustment_amount || null,
        transport_type: transport_type || null,
        transport_location: transport_location || null,
        transport_date: transport_date || null,
        transport_cost: transport_cost || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', pendingArb.id)
      .select()
      .single();

    if (updateArbError) {
      console.error('Error updating ARB record:', updateArbError);
      return NextResponse.json(
        { error: 'Failed to update ARB record' },
        { status: 500 }
      );
    }

    // Update vehicle
    const { error: updateVehicleError } = await supabase
      .from('vehicles')
      .update(vehicleUpdate)
      .eq('id', vehicleId);

    if (updateVehicleError) {
      console.error('Error updating vehicle:', updateVehicleError);
      return NextResponse.json(
        { error: 'Failed to update vehicle' },
        { status: 500 }
      );
    }

    // Add expense if needed
    if (expenseData) {
      const { error: expenseError } = await supabase
        .from('vehicle_expenses')
        .insert(expenseData);

      if (expenseError) {
        console.error('Error creating expense:', expenseError);
        // Don't fail the whole operation, just log it
      }
    }

    // Log to timeline
    await supabase
      .from('vehicle_timeline')
      .insert({
        vehicle_id: vehicleId,
        action: 'ARB Outcome Processed',
        user_id: user.id,
        note: timelineNote,
        status: vehicleUpdate.status || vehicle.status,
        expense_value: adjustment_amount || transport_cost || null,
      });

    return NextResponse.json({ 
      data: {
        arb_record: updatedArb,
        vehicle: { ...vehicle, ...vehicleUpdate },
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error processing ARB outcome:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process ARB outcome' },
      { status: 500 }
    );
  }
}

