import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all dropdown settings, optionally filtered by category
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active_only') !== 'false'; // Default to true

    let query = supabase
      .from('dropdown_settings')
      .select('*')
      .order('created_at', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      // If table doesn't exist, return empty array gracefully
      if (error.code === '42P01') {
        return NextResponse.json({ data: [] });
      }
      throw error;
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('Error fetching dropdown settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dropdown settings' },
      { status: 500 }
    );
  }
}

// POST - Create a new dropdown setting
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
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

    // Validate required fields
    if (!category || !category.trim()) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!label || !label.trim()) {
      return NextResponse.json(
        { error: 'Label is required' },
        { status: 400 }
      );
    }

    if (!value || !value.trim()) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }

    // Check for duplicate label in the same category
    const { data: existing } = await supabase
      .from('dropdown_settings')
      .select('id')
      .eq('category', category.trim())
      .eq('label', label.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'A dropdown option with this label already exists in this category' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('dropdown_settings')
      .insert({
        category: category.trim(),
        label: label.trim(),
        value: value.trim(),
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A dropdown option with this label already exists in this category' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating dropdown setting:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create dropdown setting' },
      { status: 500 }
    );
  }
}

