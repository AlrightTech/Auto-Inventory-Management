import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch a single dispatch record
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dispatchId: string }> }
) {
  try {
    const supabase = await createClient();
    const { dispatchId } = await params;

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
      .eq('id', dispatchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dispatch record not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching dispatch record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dispatch record' },
      { status: 500 }
    );
  }
}

// PATCH - Update a dispatch record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dispatchId: string }> }
) {
  try {
    const supabase = await createClient();
    const { dispatchId } = await params;
    const body = await request.json();
    const { location, transportCompany, transportCost, notes, address, state, zip, acAssignCarrier, fileUrl, fileName } = body;

    // Build update object
    const updateData: any = {};
    if (location !== undefined) updateData.location = location.trim();
    if (transportCompany !== undefined) updateData.transport_company = transportCompany.trim();
    if (transportCost !== undefined) updateData.transport_cost = transportCost ? parseFloat(transportCost) : null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (state !== undefined) updateData.state = state?.trim() || null;
    if (zip !== undefined) updateData.zip = zip?.trim() || null;
    if (acAssignCarrier !== undefined) updateData.ac_assign_carrier = acAssignCarrier?.trim() || null;
    if (fileUrl !== undefined) updateData.file_url = fileUrl || null;
    if (fileName !== undefined) updateData.file_name = fileName || null;

    const { data, error } = await supabase
      .from('vehicle_dispatch')
      .update(updateData)
      .eq('id', dispatchId)
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
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dispatch record not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating dispatch record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update dispatch record' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a dispatch record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dispatchId: string }> }
) {
  try {
    const supabase = await createClient();
    const { dispatchId } = await params;

    // Get the record first to check for file
    const { data: dispatchRecord } = await supabase
      .from('vehicle_dispatch')
      .select('file_url')
      .eq('id', dispatchId)
      .single();

    // Delete file from storage if exists
    if (dispatchRecord?.file_url) {
      try {
        // Extract file path from URL
        const urlParts = dispatchRecord.file_url.split('/vehicle-dispatch/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage
            .from('vehicle-dispatch')
            .remove([filePath]);
        }
      } catch (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    const { error } = await supabase
      .from('vehicle_dispatch')
      .delete()
      .eq('id', dispatchId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting dispatch record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete dispatch record' },
      { status: 500 }
    );
  }
}

