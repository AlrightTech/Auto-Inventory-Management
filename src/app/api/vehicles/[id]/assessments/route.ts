import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/vehicles/[id]/assessments - Get all assessments for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('vehicle_assessments')
      .select('*')
      .eq('vehicle_id', id)
      .order('assessment_date', { ascending: false })
      .order('assessment_time', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error('Error in GET /api/vehicles/[id]/assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vehicles/[id]/assessments - Create a new assessment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    // Validate required fields
    if (!body.assessment_date || !body.assessment_time || !body.conducted_name) {
      return NextResponse.json(
        { error: 'Assessment date, time, and conducted name are required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine status based on required fields
    const hasRequiredFields = body.assessment_date && body.assessment_time && body.conducted_name;
    const status = hasRequiredFields ? 'Completed' : 'Pending';

    // Create assessment
    const { data, error } = await supabase
      .from('vehicle_assessments')
      .insert({
        vehicle_id: id,
        assessment_date: body.assessment_date,
        assessment_time: body.assessment_time,
        conducted_name: body.conducted_name,
        status,
        miles_in: body.miles_in || null,
        color: body.color || null,
        cr_number: body.cr_number || null,
        damage_markers: body.damage_markers || [],
        pre_accident_defects: body.pre_accident_defects || null,
        other_defects: body.other_defects || null,
        work_requested: body.work_requested || [],
        owner_instructions: body.owner_instructions || [],
        fuel_level: body.fuel_level || null,
        assessment_file_url: body.assessment_file_url || null,
        assessment_file_name: body.assessment_file_name || null,
        images: body.images || [],
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', error);
      return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/vehicles/[id]/assessments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

