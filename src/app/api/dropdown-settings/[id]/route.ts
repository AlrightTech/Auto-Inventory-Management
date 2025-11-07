import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch a single dropdown setting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('dropdown_settings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dropdown setting not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error fetching dropdown setting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dropdown setting' },
      { status: 500 }
    );
  }
}

// PATCH - Update a dropdown setting
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, label, value, is_active } = body;

    // Build update object
    const updateData: any = {};
    if (category !== undefined) updateData.category = category.trim();
    if (label !== undefined) updateData.label = label.trim();
    if (value !== undefined) updateData.value = value.trim();
    if (is_active !== undefined) updateData.is_active = is_active;

    // If label or category is being updated, check for duplicates
    if (label !== undefined || category !== undefined) {
      const { data: current } = await supabase
        .from('dropdown_settings')
        .select('category, label')
        .eq('id', id)
        .single();

      const checkCategory = category !== undefined ? category.trim() : current?.category;
      const checkLabel = label !== undefined ? label.trim() : current?.label;

      const { data: existing } = await supabase
        .from('dropdown_settings')
        .select('id')
        .eq('category', checkCategory)
        .eq('label', checkLabel)
        .neq('id', id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'A dropdown option with this label already exists in this category' },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from('dropdown_settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Dropdown setting not found' },
          { status: 404 }
        );
      }
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A dropdown option with this label already exists in this category' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating dropdown setting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update dropdown setting' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a dropdown setting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('dropdown_settings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting dropdown setting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete dropdown setting' },
      { status: 500 }
    );
  }
}

