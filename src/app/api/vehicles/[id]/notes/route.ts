import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all notes for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;

    const { data, error } = await supabase
      .from('vehicle_notes')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('Error fetching vehicle notes:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// POST - Create a new note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;
    const body = await request.json();
    const { note_text } = body;

    if (!note_text || note_text.trim() === '') {
      return NextResponse.json(
        { error: 'Note text is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('vehicle_notes')
      .insert({
        vehicle_id: vehicleId,
        note_text: note_text.trim(),
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle note:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create note' },
      { status: 500 }
    );
  }
}

