import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH - Update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { noteId } = await params;
    const body = await request.json();
    const { note_text } = body;

    if (!note_text || note_text.trim() === '') {
      return NextResponse.json(
        { error: 'Note text is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('vehicle_notes')
      .update({
        note_text: note_text.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating vehicle note:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { noteId } = await params;

    const { error } = await supabase
      .from('vehicle_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vehicle note:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete note' },
      { status: 500 }
    );
  }
}

