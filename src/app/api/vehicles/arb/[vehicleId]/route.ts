import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/vehicles/arb/[vehicleId] - Update ARB outcome
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const supabase = await createClient();
    const { vehicleId } = await params;
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { outcome, adjustmentAmount, transportType, transportCompany, transportCost } = body;

    if (!outcome) {
      return NextResponse.json(
        { error: 'Outcome is required' },
        { status: 400 }
      );
    }

    // Get the vehicle to check ARB type
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('arb_type, status, bought_price, sale_invoice')
      .eq('id', vehicleId)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    if (vehicle.status !== 'ARB') {
      return NextResponse.json(
        { error: 'Vehicle is not in ARB status' },
        { status: 400 }
      );
    }

    const arbType = vehicle.arb_type || 'sold_arb'; // Default for backward compatibility

    // Validate outcome based on ARB type
    if (arbType === 'sold_arb') {
      if (!['denied', 'price_adjustment', 'buyer_withdrew'].includes(outcome)) {
        return NextResponse.json(
          { error: 'Invalid outcome for Sold ARB. Must be: denied, price_adjustment, or buyer_withdrew' },
          { status: 400 }
        );
      }
    } else if (arbType === 'inventory_arb') {
      if (!['withdrawn', 'price_adjustment', 'denied'].includes(outcome)) {
        return NextResponse.json(
          { error: 'Invalid outcome for Inventory ARB. Must be: withdrawn, price_adjustment, or denied' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      arb_outcome: outcome,
      arb_resolved_at: new Date().toISOString(),
    };

    let newStatus: string;
    let timelineAction: string;
    let timelineNote: string;

    // Handle outcomes based on ARB type
    if (arbType === 'sold_arb') {
      switch (outcome) {
        case 'denied':
          newStatus = 'Sold';
          timelineAction = 'ARB Denied';
          timelineNote = 'ARB Denied – returned to Sold.';
          updateData.arb_adjustment_amount = null;
          break;

        case 'price_adjustment':
          if (!adjustmentAmount || isNaN(parseFloat(adjustmentAmount))) {
            return NextResponse.json(
              { error: 'Adjustment amount is required for price adjustment' },
              { status: 400 }
            );
          }
          newStatus = 'Sold';
          timelineAction = 'ARB Price Adjustment';
          timelineNote = `ARB Price Adjustment – amount $${parseFloat(adjustmentAmount).toFixed(2)} added to expenses.`;
          updateData.arb_adjustment_amount = parseFloat(adjustmentAmount);
          
          // Create expense entry
          try {
            await supabase.from('vehicle_expenses').insert({
              vehicle_id: vehicleId,
              expense_description: 'Arbitration Modified',
              expense_date: new Date().toISOString().split('T')[0],
              cost: parseFloat(adjustmentAmount),
              notes: 'ARB price adjustment expense',
              created_by: user.id,
            });
          } catch (expenseError) {
            console.error('Error creating expense:', expenseError);
            // Continue even if expense creation fails
          }
          break;

        case 'buyer_withdrew':
          if (!transportType || !transportCompany || !transportCost || isNaN(parseFloat(transportCost))) {
            return NextResponse.json(
              { error: 'Transport type, company, and cost are required for buyer withdrawal' },
              { status: 400 }
            );
          }
          newStatus = 'Withdrew';
          timelineAction = 'ARB Buyer Withdrew';
          timelineNote = `ARB Buyer Withdrew – returned to Inventory with transport cost $${parseFloat(transportCost).toFixed(2)} logged.`;
          updateData.arb_transport_type = transportType;
          updateData.arb_transport_company = transportCompany;
          updateData.arb_transport_cost = parseFloat(transportCost);
          
          // Create expense entry for transport cost
          try {
            await supabase.from('vehicle_expenses').insert({
              vehicle_id: vehicleId,
              expense_description: `Transport Cost - ${transportCompany}`,
              expense_date: new Date().toISOString().split('T')[0],
              cost: parseFloat(transportCost),
              notes: `Transport type: ${transportType}`,
              created_by: user.id,
            });
          } catch (expenseError) {
            console.error('Error creating transport expense:', expenseError);
            // Continue even if expense creation fails
          }
          break;
      }
    } else {
      // inventory_arb
      switch (outcome) {
        case 'withdrawn':
          newStatus = 'Complete'; // Or we could add a new status like 'Removed'
          timelineAction = 'Inventory ARB Withdrawn';
          timelineNote = 'Inventory ARB Withdrawn – Vehicle removed from inventory.';
          updateData.arb_adjustment_amount = null;
          break;

        case 'price_adjustment':
          if (!adjustmentAmount || isNaN(parseFloat(adjustmentAmount))) {
            return NextResponse.json(
              { error: 'Adjustment amount is required for price adjustment' },
              { status: 400 }
            );
          }
          // For inventory ARB, positive adjustment reduces purchase price
          newStatus = 'Pending'; // Stay in inventory
          timelineAction = 'Inventory ARB Price Adjustment';
          timelineNote = `Inventory ARB Price Adjustment – positive adjustment $${parseFloat(adjustmentAmount).toFixed(2)} applied to reduce cost.`;
          updateData.arb_adjustment_amount = parseFloat(adjustmentAmount);
          // Note: We don't create an expense for inventory ARB price adjustment
          // The adjustment will be factored into profit calculation by reducing effective purchase price
          break;

        case 'denied':
          newStatus = 'Pending'; // Stay in inventory
          timelineAction = 'Inventory ARB Denied';
          timelineNote = 'Inventory ARB Denied – no change.';
          updateData.arb_adjustment_amount = null;
          break;
      }
    }

    updateData.status = newStatus;

    // Update vehicle
    const { data: updatedVehicle, error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', vehicleId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating ARB outcome:', updateError);
      return NextResponse.json(
        { error: 'Failed to update ARB outcome' },
        { status: 500 }
      );
    }

    // Log to timeline
    try {
      await supabase.from('vehicle_timeline').insert({
        vehicle_id: vehicleId,
        action: timelineAction,
        user_id: user.id,
        action_date: new Date().toISOString().split('T')[0],
        action_time: new Date().toTimeString().split(' ')[0].substring(0, 8),
        note: timelineNote,
        status: newStatus,
        expense_value: outcome === 'price_adjustment' && arbType === 'sold_arb' 
          ? parseFloat(adjustmentAmount) 
          : outcome === 'buyer_withdrew' 
            ? parseFloat(transportCost) 
            : null,
      });
    } catch (timelineError) {
      console.error('Error logging to timeline:', timelineError);
      // Don't fail the request if timeline logging fails
    }

    return NextResponse.json({ data: updatedVehicle });
  } catch (error) {
    console.error('Error in PATCH /api/vehicles/arb/[vehicleId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

