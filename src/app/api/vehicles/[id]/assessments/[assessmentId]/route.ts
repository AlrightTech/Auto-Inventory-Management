import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/vehicles/[id]/assessments/[assessmentId] - Update an assessment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assessmentId: string }> }
) {
  try {
    const supabase = await createClient();
    const { assessmentId } = await params;
    const body = await request.json();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine status based on required fields
    const hasRequiredFields = body.assessment_date && body.assessment_time && body.conducted_name;
    const status = hasRequiredFields ? 'Completed' : 'Pending';

    // Update assessment
    const updateData: any = {
      ...body,
      status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('vehicle_assessments')
      .update(updateData)
      .eq('id', assessmentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating assessment:', error);
      return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PATCH /api/vehicles/[id]/assessments/[assessmentId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/vehicles/[id]/assessments/[assessmentId] - Delete an assessment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; assessmentId: string }> }
) {
  try {
    const supabase = await createClient();
    const { assessmentId } = await params;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('vehicle_assessments')
      .delete()
      .eq('id', assessmentId);

    if (error) {
      console.error('Error deleting assessment:', error);
      return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/vehicles/[id]/assessments/[assessmentId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



