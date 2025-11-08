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
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', id)
      .single();

    if (vehicleError || !vehicle) {
      console.error('Vehicle not found:', vehicleError);
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check if user profile exists (created_by references profiles.id)
    // Note: created_by is nullable, so if profile doesn't exist, we can set it to null
    let createdBy: string | null = null;
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    // If profile exists, use user.id, otherwise leave as null
    if (profile && !profileError) {
      createdBy = user.id;
    } else if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected if profile doesn't exist
      // Log other errors but don't fail the request
      console.warn('Profile lookup error (non-critical):', profileError);
    }

    // Determine status based on required fields
    const hasRequiredFields = body.assessment_date && body.assessment_time && body.conducted_name;
    const status = hasRequiredFields ? 'Completed' : 'Pending';

    // Prepare assessment data with proper type handling
    const assessmentData: any = {
      vehicle_id: id,
      assessment_date: body.assessment_date,
      assessment_time: body.assessment_time,
      conducted_name: body.conducted_name.trim(),
      status,
      miles_in: body.miles_in ? parseInt(body.miles_in) : null,
      color: body.color?.trim() || null,
      cr_number: body.cr_number?.trim() || null,
      damage_markers: Array.isArray(body.damage_markers) ? body.damage_markers : [],
      pre_accident_defects: body.pre_accident_defects?.trim() || null,
      other_defects: body.other_defects?.trim() || null,
      work_requested: Array.isArray(body.work_requested) ? body.work_requested : [],
      owner_instructions: Array.isArray(body.owner_instructions) ? body.owner_instructions : [],
      fuel_level: body.fuel_level !== null && body.fuel_level !== undefined ? parseInt(body.fuel_level) : null,
      assessment_file_url: body.assessment_file_url?.trim() || null,
      assessment_file_name: body.assessment_file_name?.trim() || null,
      images: Array.isArray(body.images) ? body.images : [],
    };

    // Only add created_by if profile exists
    if (createdBy) {
      assessmentData.created_by = createdBy;
    }

    // Create assessment
    const { data, error } = await supabase
      .from('vehicle_assessments')
      .insert(assessmentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating assessment:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        assessmentData: JSON.stringify(assessmentData, null, 2)
      });
      
      // Return more specific error message
      const errorMessage = error.message || 'Failed to create assessment';
      const errorDetails = error.details ? ` Details: ${error.details}` : '';
      const errorHint = error.hint ? ` Hint: ${error.hint}` : '';
      
      return NextResponse.json(
        { 
          error: `Failed to create assessment: ${errorMessage}${errorDetails}${errorHint}`,
          code: error.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/vehicles/[id]/assessments:', {
      error,
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

