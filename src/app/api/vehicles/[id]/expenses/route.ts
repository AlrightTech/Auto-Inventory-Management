import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Fetch all expenses for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;

    const { data, error } = await supabase
      .from('vehicle_expenses')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error('Error fetching vehicle expenses:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST - Create a new expense
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: vehicleId } = await params;
    const body = await request.json();
    const { expense_description, expense_date, cost, notes } = body;

    if (!expense_description || expense_description.trim() === '') {
      return NextResponse.json(
        { error: 'Expense description is required' },
        { status: 400 }
      );
    }

    if (!expense_date) {
      return NextResponse.json(
        { error: 'Expense date is required' },
        { status: 400 }
      );
    }

    if (cost === null || cost === undefined || isNaN(parseFloat(cost))) {
      return NextResponse.json(
        { error: 'Valid cost is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('vehicle_expenses')
      .insert({
        vehicle_id: vehicleId,
        expense_description: expense_description.trim(),
        expense_date: expense_date,
        cost: parseFloat(cost),
        notes: notes?.trim() || null,
        created_by: user?.id || null,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle expense:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create expense' },
      { status: 500 }
    );
  }
}

