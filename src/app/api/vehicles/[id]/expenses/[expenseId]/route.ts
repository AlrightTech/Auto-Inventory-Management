import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH - Update an expense
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const supabase = await createClient();
    const { expenseId } = await params;
    const body = await request.json();
    const { expense_description, expense_date, cost, notes } = body;

    const updateData: any = {};

    if (expense_description !== undefined) {
      if (!expense_description || expense_description.trim() === '') {
        return NextResponse.json(
          { error: 'Expense description cannot be empty' },
          { status: 400 }
        );
      }
      updateData.expense_description = expense_description.trim();
    }

    if (expense_date !== undefined) {
      updateData.expense_date = expense_date;
    }

    if (cost !== undefined) {
      if (isNaN(parseFloat(cost))) {
        return NextResponse.json(
          { error: 'Valid cost is required' },
          { status: 400 }
        );
      }
      updateData.cost = parseFloat(cost);
    }

    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('vehicle_expenses')
      .update(updateData)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating vehicle expense:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const supabase = await createClient();
    const { expenseId } = await params;

    const { error } = await supabase
      .from('vehicle_expenses')
      .delete()
      .eq('id', expenseId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vehicle expense:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete expense' },
      { status: 500 }
    );
  }
}

