import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE - Delete an image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const supabase = await createClient();
    const { imageId } = await params;

    // Get image record to find file path
    const { data: image, error: fetchError } = await supabase
      .from('vehicle_images')
      .select('file_url')
      .eq('id', imageId)
      .single();

    if (fetchError || !image) {
      throw new Error('Image not found');
    }

    // Extract file path from URL
    const urlParts = image.file_url.split('/vehicle-images/');
    const filePath = urlParts.length > 1 ? urlParts[1] : null;

    // Delete from storage if path exists
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('vehicle-images')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('vehicle_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vehicle image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}

